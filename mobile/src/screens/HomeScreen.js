import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import api from '../services/api';
import { useAuth } from '../store/auth';
import { initSocket } from '../services/socket';

export default function HomeScreen({ navigation }){
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({});

  useEffect(()=>{ load(); }, []);
  async function load(){
    const res = await api.get('/users');
    setUsers(res.data);
  }

  useEffect(()=>{
    if (!token) return;
    const socket = initSocket(token, api.defaults.baseURL);
    const onPresence = (p) => setPresence(prev => ({ ...prev, [p.userId]: p.online }));
    socket.on('presence:update', onPresence);
    return ()=>{ socket.off('presence:update', onPresence); };
  }, [token]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList data={users} keyExtractor={u=>u._id}
        renderItem={({item})=>(
          <TouchableOpacity onPress={()=>navigation.navigate('Chat',{ peer: item })} style={{padding:16, borderBottomWidth:1}}>
            <Text style={{fontWeight:'600'}}>{item.name} {presence[item._id] ? '• Online' : ''}</Text>
            <Text style={{ color:'#666' }}>{item.email}</Text>
          </TouchableOpacity>
        )} />
    </View>
  )
}
