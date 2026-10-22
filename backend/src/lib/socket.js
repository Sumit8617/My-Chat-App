import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

// 🔥 Track number of sockets per user (multi-tab safe)
const userSocketCount = new Map();

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = socket.handshake.query?.userId?.toString();

  if (userId && userId !== "undefined" && userId !== "null") {
    // ✅ Join room (IMPORTANT)
    socket.join(userId);

    // ✅ Track online users correctly (multi-tab safe)
    const count = userSocketCount.get(userId) || 0;
    userSocketCount.set(userId, count + 1);

    io.emit("getOnlineUsers", Array.from(userSocketCount.keys()));

    console.log(`User ${userId} joined room`);
  } else {
    console.log("⚠️ Socket connected without valid userId");
  }

  // 🔤 TYPING EVENTS
  socket.on("typing", (receiverId) => {
    if (!receiverId) return;
    io.to(receiverId.toString()).emit("typing", userId);
  });

  socket.on("stopTyping", (receiverId) => {
    if (!receiverId) return;
    io.to(receiverId.toString()).emit("stopTyping", userId);
  });

  // 💬 SEND MESSAGE STATUS UPDATE
  socket.on("sendMessage", async (newMsg) => {
    try {
      if (!newMsg?._id) return;

      // Update DB to delivered if not already updated
      await Message.findByIdAndUpdate(newMsg._id, {
        status: "delivered",
        deliveredAt: new Date(),
      });
    } catch (err) {
      console.log("sendMessage socket error:", err);
    }
  });

  // ✅ READ RECEIPTS
  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    try {
      if (!senderId || !receiverId) return;

      await Message.updateMany(
        { senderId, receiverId, status: { $ne: "read" } },
        { status: "read", readAt: new Date() }
      );

      io.to(senderId.toString()).emit("messagesRead", { receiverId });
    } catch (err) {
      console.log("markAsRead error:", err);
    }
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    if (userId && userId !== "undefined" && userId !== "null") {
      const count = userSocketCount.get(userId) || 0;

      if (count <= 1) {
        userSocketCount.delete(userId);
      } else {
        userSocketCount.set(userId, count - 1);
      }

      io.emit("getOnlineUsers", Array.from(userSocketCount.keys()));
    }
  });
});

export { io, app, server, userSocketCount };