import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, TextInput, Button, Text, KeyboardAvoidingView, Platform } from 'react-native';
import api from '../services/api';
import { useAuth } from '../store/auth';
import { initSocket } from '../services/socket';

export default function ChatScreen({ route }){
  const { peer } = route.params;
  const { user, token } = useAuth();
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const socketRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(()=>{
    (async()=>{
      const res = await api.get(`/conversations/${peer._id}/messages`);
      setConversationId(res.data.conversationId);
      setMessages(res.data.messages);
      if (token) socketRef.current = initSocket(token, api.defaults.baseURL);
    })();
  }, [peer._id, token]);

  useEffect(()=>{
    const s = socketRef.current;
    if (!s) return;
    const onNew = (msg)=>{
      if ( (msg.from === peer._id && msg.to === user.id) || (msg.from === user.id && msg.to === peer._id) ) {
        setMessages(prev => [...prev, msg]);
      }
    };
    const onTyping = (t) => { if (t.from === peer._id) setTyping(t.typing); };
    const onUpdate = (u) => setMessages(prev => prev.map(m => m._id === u.id ? { ...m, status: u.status } : m));
    const onBulk = (u) => setMessages(prev => prev.map(m => u.ids.includes(m._id) ? { ...m, status: u.status } : m));

    s.on('message:new', onNew);
    s.on('typing:update', onTyping);
    s.on('message:update', onUpdate);
    s.on('message:update:bulk', onBulk);
    s.on('message:read', ({ messageIds }) => {
      setMessages(prev => prev.map(m => messageIds.includes(m._id) ? { ...m, status: 'read' } : m));
    });

    return ()=> {
      s.off('message:new', onNew);
      s.off('typing:update', onTyping);
      s.off('message:update', onUpdate);
      s.off('message:update:bulk', onBulk);
    };
  }, [peer._id, user?.id]);

  const sendTypingStart = () => {
    const s = socketRef.current; if (!s) return;
    s.emit('typing:start', { to: peer._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(()=> s.emit('typing:stop', { to: peer._id }), 1500);
  };

  const sendMessage = () => {
    const text = input.trim(); if (!text) return;
    setInput('');
    const s = socketRef.current; if (!s) return;
    s.emit('message:send', { to: peer._id, text }, (ack)=>{
      if (ack?.ok) {
        const localMsg = { _id: ack.messageId, conversation: ack.conversationId, from: user.id, to: peer._id, text, status: 'sent', createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, localMsg]);
      }
    });
  };

  useEffect(()=>{
    // mark unread as read
    const unread = messages.filter(m => m.to === user.id && m.status !== 'read');
    if (unread.length && socketRef.current) {
      socketRef.current.emit('message:read', { messageIds: unread.map(m => m._id), conversationId });
    }
  }, [messages.length]);

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
      <FlatList data={messages} keyExtractor={m=>m._id} renderItem={({item})=>(
        <View style={{alignItems: item.from===user.id ? 'flex-end' : 'flex-start', marginVertical:6}}>
          <View style={{backgroundColor: item.from===user.id ? '#cce5ff' : '#eee', padding:10, borderRadius:10, maxWidth:'80%'}}>
            <Text>{item.text}</Text>
            {item.from === user.id && <Text style={{fontSize:10, marginTop:4}}>{ item.status === 'read' ? '✔✔' : item.status === 'delivered' ? '✔✔' : '✔' }</Text>}
          </View>
        </View>
      )} contentContainerStyle={{padding:12}} />

      {typing ? <Text style={{paddingLeft:12}}>Typing...</Text> : null}

      <View style={{flexDirection:'row', padding:12}}>
        <TextInput value={input} onChangeText={(t)=>{ setInput(t); sendTypingStart(); }} style={{flex:1, borderWidth:1, padding:10, borderRadius:20}} placeholder="Message"/>
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
}
