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


// 🔥 COMPOUND INDEXES (VERY IMPORTANT for performance)

// Fast chat queries (sender ↔ receiver)
messageSchema.index({ senderId: 1, receiverId: 1 });

// Fast unread count queries
messageSchema.index({ receiverId: 1, status: 1 });

// Fast sorting (pagination, latest messages)
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