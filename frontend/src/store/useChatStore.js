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
      toast.error(error.response?.data?.message || "Something went wrong");
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
      toast.error(error.response?.data?.messages || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }
    const socket = useAuthStore.getState().socket;
    const tempId = Date.now();

    const optimisticMessage = {
      _id: tempId,
      senderId: useAuthStore.getState().authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image || null,
      createdAt: new Date(),
      status: "sending",
    };

    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));

    try {
      const formData = new FormData();
      formData.append("text", messageData.text);

      if (messageData.image) {
        formData.append("image", messageData.image);
      }

      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      // 🔥 EMIT SOCKET AFTER SAVE
      socket?.emit("sendMessage", res.data);

      // 🔥 UPDATE optimistic message → SENT ✓
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? { ...res.data, status: "sent" } : msg,
        ),
      }));

      get().moveUserToTop(selectedUser._id);
    } catch (error) {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg,
        ),
      }));

      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageStatusUpdated");
    socket.off("messagesRead");

    // NEW MESSAGE RECEIVED
    socket.on("newMessage", (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      const authUser = useAuthStore.getState().authUser;

      if (newMessage.senderId !== authUser._id) {
        get().moveUserToTop(newMessage.senderId);
      }

      if (
        !currentSelectedUser ||
        newMessage.senderId !== currentSelectedUser._id
      ) {
        set((state) => ({
          users: state.users.map((u) =>
            u._id === newMessage.senderId
              ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
              : u,
          ),
        }));
      }

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

      if (newMessage.receiverId === authUser._id) {
        get().markMessagesAsRead();
      }
    });

    // DELIVERY UPDATE → ✓✓
    socket.on("messageStatusUpdated", (updatedMsg) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m._id === updatedMsg._id ? updatedMsg : m,
        ),
      }));
    });

    // READ UPDATE → green ✓✓
    socket.on("messagesRead", ({ receiverId }) => {
      set((state) => ({
        messages: state.messages.map((m) =>
          m.receiverId === receiverId ? { ...m, status: "read" } : m,
        ),
      }));
    });
  },

  markMessagesAsRead: () => {
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    const { selectedUser } = get();

    if (!socket || !selectedUser || !authUser) return;

    socket.emit("markAsRead", {
      senderId: selectedUser._id,
      receiverId: authUser._id,
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageStatusUpdated");
    socket.off("messagesRead");
  },

  subscribeToTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (!selectedUser || !socket) return;

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
      if (!authUser) return;

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
    if (!socket) return;
    socket.off("typing");
    socket.off("stopTyping");
  },

  emitTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (!selectedUser || !socket) return;

    socket.emit("typing", selectedUser._id);
  },

  emitStopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (!selectedUser || !socket) return;

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

  setSelectedUser: (selectedUser) => {
    set((state) => {
      if (!selectedUser) {
        return { selectedUser };
      }

      return {
        selectedUser,
        users: state.users.map((u) =>
          u._id === selectedUser._id ? { ...u, unreadCount: 0 } : u,
        ),
      };
    });
  },
}));
