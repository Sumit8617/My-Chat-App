import User from "../models/user.model.js";
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"; 
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user._id;

    // all users except me
    const users = await User.find({_id:{ $ne: myId }}).select("-password");

    // attach unread count for each user
    const usersWithUnread = await Promise.all(
      users.map(async(user)=>{

        const unreadCount = await Message.countDocuments({
          senderId:user._id,
          receiverId:myId,
          status:{ $ne:"read" }
        });
        return {
          ...user.toObject(),
          unreadCount
        };
      })
    );
    return res.status(200).json(usersWithUnread);
  } catch (error) {
    console.log(error);
    res.status(500).json({message:"Server error"});
  }
};

export const getMessages = async (req, res) => {
    try {
        const {id: userToChatWithId} =req.params
        const myId=req.user._id

        const messages = await Message.find({
            $or:[
                {senderId: myId, receiverId: userToChatWithId},
                {senderId: userToChatWithId, receiverId: myId}
            ]
        }).sort({createdAt: 1})
        return res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const sendMessage = async (req,res) =>{
    try {
        const text = req.body?.text;
        const image = req.file;
        console.log("TEXT:", text);
        console.log("FILE:", image);

        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageURL="";
        if(req.file){
            const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
            const uploadResponse = await cloudinary.uploader.upload(base64Image);
            imageURL = uploadResponse.secure_url;
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageURL,
            status: "sent" 
        })
        await newMessage.save();

        return res.status(200).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage:", error);
        return res.status(500).json({ message: "Internal server error" });   
    }
}