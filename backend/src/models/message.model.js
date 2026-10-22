import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// 🔥 COMPOUND INDEXES (OPTIMIZED for conversation queries, pagination and unread counts)

// Fast conversation lookups & cursor pagination (bidirectional)
messageSchema.index({ senderId: 1, receiverId: 1, _id: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, _id: -1 });

// Fast unread count & delivery status queries
messageSchema.index({ receiverId: 1, status: 1 });

// Fast sorting fallback
messageSchema.index({ createdAt: -1 });


// 🔥 Optional: ensure at least text OR image exists
messageSchema.pre("save", function (next) {
  if (!this.text && !this.image) {
    return next(new Error("Message must contain text or image"));
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;