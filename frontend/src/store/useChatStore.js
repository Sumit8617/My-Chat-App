import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";
import {useAuthStore} from "./useAuthStore.js";

export const useChatStore = create((set,get)=>({
  messages:[],
  users:[],
  selectedUser:null,
  isUsersLoading:false,
  isMessagesLoading:false,
  onlineUsers:[],

  getUsers: async()=>{
    set({isUsersLoading:true})
    try {
      const res = await axiosInstance.get("/messages/users")
      console.log("From useChatStore getUsers:",res.data)
      set({users:res.data})
    } catch (error) {
      toast.error(error.response.data.message || "Something went wrong")
    } finally{
      set({isUsersLoading:false})
    }
  },

  getMessages: async(userId)=>{
    set({isMessagesLoading:true})
    try {
      const res = await axiosInstance.get(`/messages/${userId}`)
    set({messages:res.data})
    } catch (error) {
      toast.error(error.response.data.messages || "Something went wrong")
    }finally{
      set({isMessagesLoading:false})
    }
  },

  sendMessage: async(messageData)=>{
    const{messages,selectedUser} = get()
    try {
      const formData = new FormData();

      formData.append("text", messageData.text);

      if (messageData.image) {
        formData.append("image", messageData.image);
      }

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      set({messages:[...messages,res.data]})
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message")
    }
  },

  subscribeToMessages:()=>{
    const {selectedUser} = get()
    if(!selectedUser) return

    const socket = useAuthStore.getState().socket

    socket.on("newMessage",(newMessage)=>{
      if(newMessage.senderId !== selectedUser._id) return
      set({
        messages: [...get().messages, newMessage],
      })
    })
  },

  unsubscribeFromMessages:()=>{
    const socket = useAuthStore.getState().socket
    socket.off("newMessage")
  },

  setSelectedUser:(selectedUser)=>set({selectedUser})
}))