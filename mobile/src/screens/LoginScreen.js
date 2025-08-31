import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useAuth } from '../store/auth';

export default function LoginScreen({ navigation }){
  const { signIn } = useAuth();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20 }}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize='none' style={{borderWidth:1, padding:8, marginVertical:8}}/>
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{borderWidth:1, padding:8, marginBottom:8}}/>
      {err ? <Text style={{color:'red'}}>{err}</Text> : null}
      <Button title="Login" onPress={async ()=>{ try{ await signIn(email,password); } catch(e){ setErr(e.response?.data?.message || e.message); } }} />
      <Button title="Register" onPress={()=>navigation.navigate('Register')} />
    </View>
  );
}
