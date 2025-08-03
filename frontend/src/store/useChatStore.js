import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";

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
            set({users:res.data})
        } catch (error) {
            toast.error(error.response.data.messages)   
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
            toast.error(error.response.data.messages)
        }finally{
            set({isMessagesLoading:false})
        }
    },

    sendMessage: async(messageData)=>{
        const{messages,selectedUser} = get()
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData)
            set({messages:[...messages,res.data]})
        } catch (error) {
            toast.error(error.response.data.messages)
        }
    },

    setSelectedUser:(selectedUser)=>set({selectedUser})

}))