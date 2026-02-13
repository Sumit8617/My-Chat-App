import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  onlineUsers: [],
  typingUsers: new Set(),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      console.log("From useChatStore getUsers:", res.data);
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.messages || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { messages, selectedUser } = get();
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

      set({ messages: [...messages, res.data] });
      get().moveUserToTop(selectedUser._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const currentSelectedUser = get().selectedUser;

      get().moveUserToTop(newMessage.senderId);

      set((state) => {
        const updatedTyping = new Set(state.typingUsers);
        updatedTyping.delete(newMessage.senderId);

        return { typingUsers: updatedTyping };
      });

      if (
        !currentSelectedUser ||
        newMessage.senderId !== currentSelectedUser._id
      ) {
        return;
      }

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  subscribeToTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (!selectedUser) return;

    socket.off("typing");
    socket.off("stopTyping");

    socket.on("typing", (senderId) => {
      const authUser = useAuthStore.getState().authUser;

      if (senderId === authUser._id) return;
      set((state) => {
        const updated = new Set(state.typingUsers);
        updated.add(senderId);

        return { typingUsers: updated };
      });
    });

    socket.on("stopTyping", (senderId) => {
      const authUser = useAuthStore.getState().authUser;

      if (senderId === authUser._id) return;
      set((state) => {
        const updated = new Set(state.typingUsers);
        updated.delete(senderId);

        return { typingUsers: updated };
      });
    });
  },

  unsubscribeFromTyping: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("typing");
    socket.off("stopTyping");
  },

  emitTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (!selectedUser) return;

    socket.emit("typing", selectedUser._id);
  },

  emitStopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (!selectedUser) return;

    socket.emit("stopTyping", selectedUser._id);
  },

  moveUserToTop: (userId) => {
    set((state) => {
      const updatedUsers = [...state.users];

      const index = updatedUsers.findIndex((u) => u._id === userId);

      if (index === -1) return state;

      const [user] = updatedUsers.splice(index, 1);

      updatedUsers.unshift(user);

      return { users: updatedUsers };
    });
  },

  setSelectedUser: (selectedUser) => set({ selectedUser, isTyping: false }),
}));
