import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import User from './models/User.js';

export function setupSocket(server) {
  const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN?.split(',') || '*' } });

  const userSockets = new Map(); // userId -> Set(socketId)

  function addSocket(userId, socketId){
    const set = userSockets.get(userId) || new Set();
    set.add(socketId);
    userSockets.set(userId, set);
  }
  function removeSocket(userId, socketId){
    const set = userSockets.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (!set.size) userSockets.delete(userId);
  }
  function emitToUser(userId, event, payload){
    const set = userSockets.get(userId);
    if (!set) return;
    set.forEach(sid => io.to(sid).emit(event, payload));
  }

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('no token'));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;
      next();
    } catch (e) {
      next(new Error('bad token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    addSocket(userId, socket.id);
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    io.emit('presence:update', { userId, online: true, lastSeen: new Date().toISOString() });

    socket.on('typing:start', ({ to }) => {
      emitToUser(to, 'typing:update', { from: userId, typing: true });
    });
    socket.on('typing:stop', ({ to }) => {
      emitToUser(to, 'typing:update', { from: userId, typing: false });
    });

    socket.on('message:send', async (payload, ack) => {
      try {
        const { to, text } = payload;
        let conversation = await Conversation.findOne({ participants: { $all: [userId, to] } });
        if (!conversation) conversation = await Conversation.create({ participants: [userId, to] });
        const msg = await Message.create({ conversation: conversation._id, from: userId, to, text, status: 'sent' });
        conversation.lastMessage = { text, at: new Date(), from: userId };
        await conversation.save();

        ack?.({ ok: true, messageId: msg._id, status: 'sent', conversationId: conversation._id });

        emitToUser(to, 'message:new', { ...msg.toObject(), createdAt: msg.createdAt.toISOString() });

        // update delivery status
        await Message.findByIdAndUpdate(msg._id, { status: 'delivered' });
        emitToUser(userId, 'message:update', { id: msg._id, status: 'delivered' });
        emitToUser(to, 'message:update', { id: msg._id, status: 'delivered' });
      } catch (e) {
        ack?.({ ok: false, error: e.message });
      }
    });

    socket.on('message:read', async ({ messageIds, conversationId }) => {
      await Message.updateMany({ _id: { $in: messageIds }, to: userId }, { $set: { status: 'read' } });
      const conv = await Conversation.findById(conversationId);
      const peer = conv?.participants.find(p => String(p) !== String(userId));
      if (peer) emitToUser(peer, 'message:read', { conversationId, messageIds });
      emitToUser(userId, 'message:update:bulk', { ids: messageIds, status: 'read' });
    });

    socket.on('disconnect', async () => {
      removeSocket(userId, socket.id);
      const online = userSockets.has(userId);
      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, { lastSeen });
      if (!online) io.emit('presence:update', { userId, online: false, lastSeen: lastSeen.toISOString() });
    });
  });

  return io;
}
