import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import mongoose from "mongoose";

export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user?._id;
    if (!myId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const myObjectId = new mongoose.Types.ObjectId(myId);

    // all users except me
    const users = await User.find({ _id: { $ne: myId } }).select("-password").lean();

    // attach unread count for each user
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: myObjectId,
          status: { $ne: "read" },
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = {};
    unreadCounts.forEach((item) => {
      unreadMap[item._id.toString()] = item.count;
    });

    const usersWithUnread = users.map((user) => ({
      ...user,
      unreadCount: unreadMap[user._id.toString()] || 0,
    }));

    return res.status(200).json(usersWithUnread);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatWithId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userToChatWithId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const myId = req.user?._id;
    if (!myId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const myObjectId = new mongoose.Types.ObjectId(myId);
    const userToChatWithObjectId = new mongoose.Types.ObjectId(
      userToChatWithId,
    );

    const messages = await Message.find({
      $or: [
        { senderId: myObjectId, receiverId: userToChatWithObjectId },
        { senderId: userToChatWithObjectId, receiverId: myObjectId },
      ],
    })
      .sort({ _id:-1 })
      .limit(50);
    return res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const text = req.body?.text;
    const image = req.file;

    if (process.env.NODE_ENV === "development") {
      console.log("TEXT:", text);
      console.log("FILE:", image);
    }

    const { id: receiverId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const senderId = req.user?._id;
    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const myObjectId = new mongoose.Types.ObjectId(senderId);
    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

    if (!text && !image) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    if (image && image.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Image too large" });
    }

    let imageURL = "";
    if (req.file) {
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploadResponse = await cloudinary.uploader.upload(base64Image,{
        folder:"chat_app",
      });
      imageURL = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId: myObjectId,
      receiverId: receiverObjectId,
      text,
      image: imageURL,
      status: "sent",
    });
    await newMessage.save();
    io.to(receiverId.toString()).emit("newMessage", newMessage);
    io.to(senderId.toString()).emit("newMessage", newMessage);

    return res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
