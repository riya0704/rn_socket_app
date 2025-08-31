import { io } from 'socket.io-client';
let socket = null;

export function initSocket(token, apiUrl) {
  if (socket) return socket;
  socket = io(apiUrl || (process.env.EXPO_PUBLIC_API_URL), { auth: { token } });
  return socket;
}

export function disconnectSocket(){
  socket?.disconnect();
  socket = null;
}
