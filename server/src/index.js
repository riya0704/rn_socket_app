import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from './db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from "./routes/users.routes.js";
import messageRoutes from "./routes/messages.routes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// ✅ Allow CORS from Expo/Web
app.use(cors({
  origin: "*", // for testing allow all (later you can restrict to Expo IP)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/conversations", messageRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // ✅ allow socket.io CORS
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🔗 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => {
    console.log(`✅ Server running on http://10.165.246.129:${PORT}`);
  });
});

