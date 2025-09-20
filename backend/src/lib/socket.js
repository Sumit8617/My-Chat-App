import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Map userId -> socketId
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = socket.handshake.query?.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
