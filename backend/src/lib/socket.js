import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js";

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

  const userId = socket.handshake.query?.userId?.toString();

  if (userId && userId !== "undefined" && userId !== "null") {
  userSocketMap[userId] = socket.id;
  console.log(`User ${userId} mapped to socket ${socket.id}`);
} else {
  console.log("⚠️ Socket connected without valid userId");
}

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", (receiverId) => {
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", userId);
    }
  });

  socket.on("stopTyping", (receiverId) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    console.log("Typing event received for:", receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", userId);
    }
  });

  socket.on("sendMessage", async (newMsg) => {
    try {
      const receiverSocketId = getReceiverSocketId(
        newMsg.receiverId?.toString(),
      );

      // send message to receiver
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMsg);

        // update DB → delivered
        await Message.findByIdAndUpdate(newMsg._id, {
          status: "delivered",
          deliveredAt: new Date(),
        });

        newMsg.status = "delivered";
      }

      // notify sender about status change
      const senderSocketId = getReceiverSocketId(newMsg.senderId?.toString());

      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdated", newMsg);
      }
    } catch (err) {
      console.log("sendMessage socket error:", err);
    }
  });

  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    try {
      await Message.updateMany(
        { senderId, receiverId, status: { $ne: "read" } },
        { status: "read", readAt: new Date() },
      );

      const senderSocketId = getReceiverSocketId(senderId?.toString());

      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", { receiverId });
      }
    } catch (err) {
      console.log("markAsRead error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    if (userId && userId !== "undefined" && userId !== "null") {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };
