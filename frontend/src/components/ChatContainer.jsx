import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../libs/utils";
import { ArrowLeft, Loader2 } from "lucide-react";

function ChatContainer() {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    typingUsers,
    markMessagesAsRead,
    setSelectedUser,
    hasMoreMessages,
    isLoadingOlderMessages,
    loadOlderMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const firstLoadRef = useRef(true);

  const isTyping = Boolean(
    selectedUser?._id &&
      (typingUsers?.has(selectedUser._id) ||
        typingUsers?.has(selectedUser._id.toString()))
  );

  const handleImageLoad = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 300;
    if (nearBottom || firstLoadRef.current) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isTyping) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isTyping]);

  //  INFINITE SCROLL (LOAD OLDER MESSAGES)
  const handleScroll = async (e) => {
    const container = e.target;
    if (container.scrollTop < 30 && hasMoreMessages && !isLoadingOlderMessages) {
      const prevScrollHeight = container.scrollHeight;
      const prevScrollTop = container.scrollTop;

      const loaded = await loadOlderMessages();
      if (loaded) {
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight - prevScrollHeight + prevScrollTop;
        });
      }
    }
  };

  // 🔄 LOAD / MARK READ
  useEffect(() => {
    if (!selectedUser?._id) return;

    getMessages(selectedUser._id);
    markMessagesAsRead();
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
          className="md:hidden p-2.5 text-base-content/80 hover:text-base-content transition-colors"
          aria-label="Back to contacts"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="flex-1">
          <ChatHeader />
        </div>
      </div>

      {/* MESSAGES */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* LOADING OLDER MESSAGES SPINNER */}
        {isLoadingOlderMessages && (
          <div className="flex justify-center py-2">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        )}
        {messages.map((message, index) => {
          const isOwnMessage =
            message.senderId?.toString() === authUser?._id?.toString();

          return (
            <div
              key={message._id || index}
              ref={index === messages.length - 1 ? messageEndRef : null}
              className={`flex items-end gap-2.5 my-1 ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              {!isOwnMessage && (
                <img
                  src={selectedUser?.profilePicture || "/avatar.png"}
                  className="size-7 rounded-full object-cover ring-2 ring-base-content/10 shrink-0 mb-1"
                  alt={selectedUser?.fullName || "User"}
                />
              )}

              <div className="flex flex-col max-w-[80%] sm:max-w-md">
                <span
                  className={`text-[10px] text-base-content/40 mb-1 px-1 ${
                    isOwnMessage ? "text-right" : "text-left"
                  }`}
                >
                  {formatMessageTime(message.createdAt)}
                </span>

                <div
                  className={`px-4 py-2.5 shadow-sm text-sm ${
                    isOwnMessage
                      ? "bg-primary text-primary-content rounded-2xl rounded-br-xs shadow-primary/10"
                      : "bg-base-200/90 text-base-content rounded-2xl rounded-bl-xs border border-base-content/5"
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      onLoad={handleImageLoad}
                      className="max-w-[240px] rounded-xl mb-2 object-cover cursor-pointer hover:opacity-95 transition-opacity shadow-sm"
                    />
                  )}

                  {message.text && (
                    <p className="leading-relaxed whitespace-pre-wrap break-words">
                      {message.text}
                    </p>
                  )}

                  {isOwnMessage && (
                    <div className="flex justify-end items-center gap-1 text-[10px] mt-1 opacity-80">
                      {message.status === "sending" && <span>⏳</span>}
                      {message.status === "sent" && <span>✓</span>}
                      {message.status === "delivered" && <span>✓✓</span>}
                      {message.status === "read" && (
                        <span className="text-sky-300 font-bold">✓✓</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isOwnMessage && (
                <img
                  src={authUser?.profilePicture || "/avatar.png"}
                  className="size-7 rounded-full object-cover ring-2 ring-base-content/10 shrink-0 mb-1"
                  alt="Me"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* TYPING INDICATOR */}
      {isTyping && (
        <div className="px-5 pb-2.5 text-xs text-base-content/70 shrink-0 flex items-center animate-fadeIn">
          <div className="flex items-center gap-2 bg-base-200/90 px-3.5 py-1.5 rounded-full shadow-sm border border-base-content/5">
            <span className="font-medium text-[11px]">
              {selectedUser.fullName || "User"} is typing
            </span>
            <span className="flex gap-1 ml-0.5">
              <span className="size-1 bg-primary rounded-full animate-bounce"></span>
              <span className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
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
