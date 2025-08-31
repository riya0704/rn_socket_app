# Real-time 1:1 Chat (React Native + Node + Socket.IO + MongoDB)

## Setup - Server
cd server
cp .env.example .env   # edit MONGO_URI, JWT_SECRET
npm install
npm run dev

## Setup - Mobile
cd mobile
cp .env.example .env   # set EXPO_PUBLIC_API_URL to your PC LAN IP (e.g. http://192.168.1.100:4000)
npm install
npx expo start -c

## Test
1) Register two users via mobile app.
2) Login on two devices (or phone + emulator).
3) Chat, observe typing & presence and read receipts.

Env:
- SERVER: .env -> PORT, MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
- MOBILE: .env -> EXPO_PUBLIC_API_URL

Sample users: register alice@example.com and bob@example.com.
# rn_socket_app
