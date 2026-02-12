import User from "../models/user.model.js";
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"; 
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        console.log("Logged in user ID:", loggedInUserId);
        const filteredUsers = await User.find({_id:{ $ne: loggedInUserId }}).select("-password")
        console.log("From getUsersForSidebar backend:",filteredUsers)
        return res.status(200).json(filteredUsers, {message : "Users fetched successfully"});
    } catch (error) {
        console.log("Error in getUsersForSidebar:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

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
            image: imageURL
        })
        await newMessage.save();

        //todo: realtime functionality goes here
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return res.status(200).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage:", error);
        return res.status(500).json({ message: "Internal server error" });   
    }
}