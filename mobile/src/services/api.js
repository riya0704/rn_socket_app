import axios from 'axios';
import Constants from 'expo-constants';

const baseURL = (Constants.expoConfig?.extra?.apiUrl) || process.env.EXPO_PUBLIC_API_URL || 'http://10.165.246.129:4000';
const api = axios.create({ baseURL });

export function setAuthToken(token) {
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export default api;
