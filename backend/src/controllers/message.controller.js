import User from "../models/user.model.js";
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"; 

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers =await User.find({_id:{ $ne: loggedInUserId }}).select("-password")
        return res.status(200).json(filteredUsers);
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
        const{text,image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageURL;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageURL = uploadResponse.secure_url
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageURL
        })
        await newMessage.save();

        //todo: realtime functionality goes here

        return res.status(200).json(newMessage);

    } catch (error) {
        console.log("Error in sendMessage:", error);
        return res.status(500).json({ message: "Internal server error" });   
    }
}