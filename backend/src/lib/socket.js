import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  },
});

// Helper to parse cookie headers
const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...v] = c.trim().split("=");
      return [key, decodeURIComponent(v.join("="))];
    })
  );
};

// 🔒 Socket.io JWT Authentication Middleware
io.use(async (socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers?.cookie);
    const token =
      cookies?.jwt ||
      socket.handshake.auth?.token ||
      socket.handshake.query?.token;

    if (!token) {
      console.log("❌ Socket connection rejected: No JWT token found");
      return next(new Error("Authentication error: Unauthorized - No token"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.log("❌ Socket connection rejected: Invalid or expired token");
      return next(new Error("Authentication error: Invalid or expired token"));
    }

    const user = await User.findById(decoded.userId).select("-password").lean();
    if (!user) {
      console.log("❌ Socket connection rejected: User not found");
      return next(new Error("Authentication error: User not found"));
    }

    // Attach authenticated user securely to socket instance
    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    console.error("❌ Socket auth unexpected error:", error);
    next(new Error("Authentication error: Internal server error"));
  }
});

// 🔥 Track number of sockets per user (multi-tab safe)
const userSocketCount = new Map();

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log("✅ Authenticated user connected:", userId, "(Socket ID:", socket.id, ")");

  // Join private room dedicated to this authenticated user
  socket.join(userId);

  // Track online users
  const count = userSocketCount.get(userId) || 0;
  userSocketCount.set(userId, count + 1);

  io.emit("getOnlineUsers", Array.from(userSocketCount.keys()));

  // Mark pending unread messages sent to this user while offline as delivered
  Message.updateMany(
    { receiverId: userId, status: "sent" },
    { status: "delivered", deliveredAt: new Date() }
  ).exec().catch((err) => console.log("Error updating delivered status:", err));

  // 🔤 TYPING EVENTS (uses cryptographically verified socket.userId)
  socket.on("typing", (receiverId) => {
    if (!receiverId) return;
    io.to(receiverId.toString()).emit("typing", socket.userId);
  });

  socket.on("stopTyping", (receiverId) => {
    if (!receiverId) return;
    io.to(receiverId.toString()).emit("stopTyping", socket.userId);
  });

  // 💬 MESSAGE STATUS ACK
  socket.on("sendMessage", async (newMsg) => {
    try {
      if (!newMsg?._id) return;
      await Message.findByIdAndUpdate(newMsg._id, {
        status: "delivered",
        deliveredAt: new Date(),
      });
    } catch (err) {
      console.log("sendMessage socket error:", err);
    }
  });

  // ✅ READ RECEIPTS (securely scoped to socket.userId)
  socket.on("markAsRead", async ({ senderId }) => {
    try {
      if (!senderId) return;

      await Message.updateMany(
        { senderId, receiverId: socket.userId, status: { $ne: "read" } },
        { status: "read", readAt: new Date() }
      );

      io.to(senderId.toString()).emit("messagesRead", { receiverId: socket.userId });
    } catch (err) {
      console.log("markAsRead error:", err);
    }
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", userId, "(Socket ID:", socket.id, ")");

    const count = userSocketCount.get(userId) || 0;
    if (count <= 1) {
      userSocketCount.delete(userId);
    } else {
      userSocketCount.set(userId, count - 1);
    }

    io.emit("getOnlineUsers", Array.from(userSocketCount.keys()));
  });
});

export { io, app, server, userSocketCount };