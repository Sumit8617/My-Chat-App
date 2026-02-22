import mongoose from 'mongoose';
import User from './user.model.js';

const messageSchema = new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text:{
        type: String,
    },
    image:{
        type: String,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    deliveredAt: Date,
    readAt: Date,
  },

{timestamps: true}
)

const Message = mongoose.model('Message', messageSchema);

export default Message;