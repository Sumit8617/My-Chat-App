import {create} from 'zustand';
import {axiosInstance} from '../libs/axios.js';
import toast from 'react-hot-toast';

export const useAuthStore =create((set)=>({
    authUser: null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,

    isCheckingAuth: true,

    checkAuth: async()=>{
        try {
            const res = await axiosInstance.get("/auth/check")
            set({authUser:res.data})
        } catch (error) {
            console.log("Error in checkAuth:",error)
            set({authUser:null})
        } finally{
            set({isCheckingAuth: false})
        }
    },

    signup: async(data)=>{
        set({isSigningUp:true})
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({authUser: res.data});
            toast.success("Account created successfully");
            return res.data;
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isSigningUp:false})
        }
    },

    login: async(data)=>{
        set({isLoggingIn:true})
        try {
            const res = await axiosInstance.post("/auth/login",data)
            set({authUser:res.data})
            toast.success("Logged in successfully")
        } catch (error) {
            toast.error(error.response.data.message)
        } finally{
            set({isLoggingIn:false})
        }
    },
    
    logout: async()=>{
        try {
            await axiosInstance.post("/auth/logout")
            set({authUser:null})
            toast.success("logout successfully")
        } catch (error) {
            toast.error(error.response.data.message)
        }
    }

}))