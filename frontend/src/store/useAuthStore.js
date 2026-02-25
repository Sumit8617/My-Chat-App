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
  socket: null,

  checkAuth: async () => {
    console.log("checkAuth called");
    try {
      const res = await axiosInstance.get("/auth/check");
      console.log("From useAuthStore checkAuth:", res.data);
      set({ authUser: res.data.user });
      get().connectSocket();
      console.log("Auth User set in checkAuth:", res.data);
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
      set({ authUser: res.data.user });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data.user });
      console.log("From useAuthStore login:", res.data);
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      get().disconnectSocket(); // disconnect FIRST
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, onlineUsers: [], socket: null });
      toast.success("logout successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data.user });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
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
    if (socket) return;

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
      set({ onlineUsers: userIds });
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      set({ onlineUsers: [] });
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
