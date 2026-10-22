import { create } from "zustand";
import { axiosInstance } from "../libs/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore.js";
 
const typingTimeouts = new Map();
 
export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  hasMoreMessages: false,
  isLoadingOlderMessages: false,
  typingUsers: new Set(),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true, hasMoreMessages: false });
    try {
      const res = await axiosInstance.get(`/messages/${userId}?limit=30`);
      const fetchedMessages = Array.isArray(res.data)
        ? res.data
        : res.data.messages || [];
      const hasMore = Boolean(res.data?.hasMore);

      set({
        messages: fetchedMessages,
        hasMoreMessages: hasMore,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  loadOlderMessages: async () => {
    const { selectedUser, messages, hasMoreMessages, isLoadingOlderMessages } = get();
    if (!selectedUser || !hasMoreMessages || isLoadingOlderMessages || messages.length === 0) {
      return false;
    }

    set({ isLoadingOlderMessages: true });
    try {
      const oldestMessageId = messages[0]._id;
      const res = await axiosInstance.get(
        `/messages/${selectedUser._id}?cursor=${oldestMessageId}&limit=30`
      );
      const olderMessages = Array.isArray(res.data)
        ? res.data
        : res.data.messages || [];
      const hasMore = Boolean(res.data?.hasMore);

      const existingIds = new Set(messages.map((m) => m._id));
      const filteredOlder = olderMessages.filter((m) => !existingIds.has(m._id));

      set((state) => ({
        messages: [...filteredOlder, ...state.messages],
        hasMoreMessages: hasMore,
      }));
      return true;
    } catch (error) {
      console.error("Error loading older messages:", error);
      return false;
    } finally {
      set({ isLoadingOlderMessages: false });
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

      // Update optimistic message with server-persisted message
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? res.data : msg,
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
      const selectedUserId = get().selectedUser?._id;
      const authUser = useAuthStore.getState().authUser;

      get().moveUserToTop(newMessage.senderId);
      if (!selectedUserId || newMessage.senderId !== selectedUserId) {
        set((state) => ({
          users: state.users.map((u) =>
            u._id === newMessage.senderId
              ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
              : u,
          ),
        }));
      }

      set((state) => {
        if (!state.typingUsers.has(newMessage.senderId)) return state;

        const updatedTyping = new Set(state.typingUsers);
        updatedTyping.delete(newMessage.senderId);
        return { typingUsers: updatedTyping };
      });

      if (!selectedUserId || newMessage.senderId !== selectedUserId) {
        return;
      }

      set((state) => {
        // Prevent duplicate messages in chat view
        if (state.messages.some((m) => m._id === newMessage._id)) {
          return state;
        }
        return {
          messages: [...state.messages, newMessage],
        };
      });

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
    if (!socket) return;

    socket.off("typing");
    socket.off("stopTyping");

    socket.on("typing", (senderId) => {
      const authUser = useAuthStore.getState().authUser;
      if (!senderId || senderId.toString() === authUser?._id?.toString()) return;

      const idStr = senderId.toString();

      // Reset auto-clear timeout (clear typing indicator after 3.5s if stopTyping event was dropped)
      if (typingTimeouts.has(idStr)) {
        clearTimeout(typingTimeouts.get(idStr));
      }

      const timeout = setTimeout(() => {
        set((state) => {
          const updated = new Set(state.typingUsers);
          updated.delete(idStr);
          updated.delete(senderId);
          return { typingUsers: updated };
        });
        typingTimeouts.delete(idStr);
      }, 3500);

      typingTimeouts.set(idStr, timeout);

      set((state) => {
        if (state.typingUsers.has(idStr)) return state;

        const updated = new Set(state.typingUsers);
        updated.add(idStr);
        updated.add(senderId);

        return { typingUsers: updated };
      });
    });

    socket.on("stopTyping", (senderId) => {
      const authUser = useAuthStore.getState().authUser;
      if (!senderId || !authUser) return;

      const idStr = senderId.toString();
      if (typingTimeouts.has(idStr)) {
        clearTimeout(typingTimeouts.get(idStr));
        typingTimeouts.delete(idStr);
      }

      set((state) => {
        const updated = new Set(state.typingUsers);
        updated.delete(idStr);
        updated.delete(senderId);

        return { typingUsers: updated };
      });
    });
  },

  unsubscribeFromTyping: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("typing");
      socket.off("stopTyping");
    }
    for (const timeout of typingTimeouts.values()) {
      clearTimeout(timeout);
    }
    typingTimeouts.clear();
  },

  emitTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (!selectedUser?._id || !socket) return;

    socket.emit("typing", selectedUser._id.toString());
  },

  emitStopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();

    if (!selectedUser?._id || !socket) return;

    socket.emit("stopTyping", selectedUser._id.toString());
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
