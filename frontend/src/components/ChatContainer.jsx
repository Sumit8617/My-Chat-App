import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../libs/utils";

function ChatContainer() {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    isTyping,
    subscribeToTyping,
    unsubscribeFromTyping,
    markMessagesAsRead,
    setSelectedUser,
  } = useChatStore();

  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const firstLoadRef = useRef(true);

  //  LOAD / SUBSCRIBE
  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    markMessagesAsRead();

    subscribeToMessages();
    subscribeToTyping();

    return () => {
      unsubscribeFromMessages();
      unsubscribeFromTyping();
    };
  }, [selectedUser?._id]);

  //  SMART AUTO SCROLL

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messages.length === 0) return;

    // wait for DOM to paint messages
    setTimeout(() => {
      // FIRST TIME CHAT OPENS → jump instantly to bottom
      if (firstLoadRef.current) {
        container.scrollTop = container.scrollHeight;
        firstLoadRef.current = false;
        return;
      }

      // NEW MESSAGE → smooth scroll ONLY if user near bottom
      const nearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        120;

      if (nearBottom) {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  }, [messages]);

  // reset when switching chats
  useEffect(() => {
    firstLoadRef.current = true;
  }, [selectedUser?._id]);

  //  LOADING STATE

  if (isMessagesLoading) {
    return (
      <div className="flex-1 w-full min-w-0 flex flex-col min-h-0">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  //  MAIN UI

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* HEADER */}
      <div className="shrink-0 bg-base-100 border-b border-base-300 flex items-center z-20">
        {/* MOBILE BACK */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden px-3 py-2 text-xl font-semibold"
        >
          ←
        </button>

        <div className="flex-1">
          <ChatHeader />
        </div>
      </div>

      {/* MESSAGES */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message, index) => {
          const isOwnMessage =
            message.senderId?.toString() === authUser?._id?.toString();

          return (
            <div
              key={message._id || index}
              ref={index === messages.length - 1 ? messageEndRef : null}
              className={`flex items-end gap-2 ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              {!isOwnMessage && (
                <img
                  src={selectedUser?.profilePicture || "/avatar.png"}
                  className="w-8 h-8 rounded-full"
                />
              )}

              <div className="flex flex-col max-w-[75%] md:max-w-xs">
                <span className="text-xs text-gray-400 mb-1">
                  {formatMessageTime(message.createdAt)}
                </span>

                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm ${
                    isOwnMessage
                      ? "bg-primary text-primary-content"
                      : "bg-base-300"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      className="max-w-[200px] rounded-md mb-2"
                    />
                  )}

                  {message.text && <p>{message.text}</p>}

                  {isOwnMessage && (
                    <div className="flex justify-end text-[11px] mt-1 opacity-80">
                      {message.status === "sending" && "⏳"}
                      {message.status === "sent" && "✓"}
                      {message.status === "delivered" && "✓✓"}
                      {message.status === "read" && (
                        <span className="text-sky-400">✓✓</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isOwnMessage && (
                <img
                  src={authUser?.profilePicture || "/avatar.png"}
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* TYPING */}
      {isTyping && (
        <div className="px-4 pb-1 text-sm text-zinc-400 shrink-0">
          Typing...
        </div>
      )}

      {/* INPUT */}
      <div className="shrink-0">
        <MessageInput />
      </div>
    </div>
  );
}

export default ChatContainer;
