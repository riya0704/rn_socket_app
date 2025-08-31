import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export async function getMessages(req, res){
  const { id } = req.params; // could be conversationId or peerId
  const limit = Math.min(parseInt(req.query.limit || '50'), 200);
  let conversation;
  const isId = /^[0-9a-fA-F]{24}$/.test(id);
  if (isId) {
    conversation = await Conversation.findById(id);
  } else {
    conversation = await Conversation.findOne({ participants: { $all: [req.user.id, id] } });
    if (!conversation) conversation = await Conversation.create({ participants: [req.user.id, id] });
  }
  if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: -1 }).limit(limit).lean();
  res.json({ conversationId: conversation._id, messages: messages.reverse() });
}
