import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  async function signIn(email, password){
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    setAuthToken(res.data.token);
    await AsyncStorage.setItem('token', res.data.token);
  }

  async function register(name, email, password){
    const res = await api.post('/auth/register', { name, email, password });
    setUser(res.data.user);
    setToken(res.data.token);
    setAuthToken(res.data.token);
    await AsyncStorage.setItem('token', res.data.token);
  }

  async function signOut(){
    setUser(null);
    setToken(null);
    setAuthToken(null);
    await AsyncStorage.removeItem('token');
  }

  return <AuthContext.Provider value={{ user, token, signIn, register, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);
