import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;
console.log("Coming From AutSlice BASE_URL:", BASE_URL);

export const useAuthStore = create((set, get) => ({
  // Initial State
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  onlineUsersSet: new Set(),
  socket: null,

  checkAuth: async () => {
    console.log("checkAuth called");
    try {
      const res = await axiosInstance.get("/auth/check");
      const user = res.data?.user || res.data;
      set({ authUser: user });
      const socket = get().socket;
      if (!socket || !socket.connected) {
        get().connectSocket();
      }
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const user = res.data?.user || res.data;
      set({ authUser: user });
      toast.success("Account created successfully");
      const socket = get().socket;
      if (!socket || !socket.connected) {
        get().connectSocket();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const user = res.data?.user || res.data;
      set({ authUser: user });
      toast.success("Logged in successfully");
      const socket = get().socket;
      if (!socket || !socket.connected) {
        get().connectSocket();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      get().disconnectSocket(); // disconnect FIRST
      await axiosInstance.post("/auth/logout");
      set({ 
        authUser: null, 
        onlineUsers: [], 
        onlineUsersSet: new Set(), 
        socket: null 
      });      
      toast.success("logout successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      const user = res.data?.user || res.data;
      set({ authUser: user });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();

    // 🚫 don't connect if user not ready
    if (!authUser?._id) {
      console.log("❌ Socket skipped: authUser not ready");
      return;
    }

    // 🚫 prevent duplicate connections
    if (socket?.connected) return;

    console.log("🔌 Connecting socket for:", authUser._id);

    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser._id.toString(),
      },
      transports: ["websocket"],
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("ONLINE USERS:", userIds);
      set({
        onlineUsers: userIds,
        onlineUsersSet: new Set(userIds.map(id => id.toString()))
      });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      set({ 
        onlineUsers: [], 
        onlineUsersSet: new Set() 
      });
    });

    newSocket.on("connect_error", () => {
      console.log("❌ Connection failed");
    });

    newSocket.io.on("reconnect", () => {
      console.log("🔄 Reconnected");
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
