import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../libs/utils";
import { useRef } from "react";

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
  } = useChatStore();
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);

  useEffect(() => {
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    subscribeToTyping();

    return () => unsubscribeFromTyping();
  }, [selectedUser]);

  // useEffect(()=>{
  //   getMessages(selectedUser._id)

  //   subscribeToMessages()

  //   return ()=> unsubscribeFromMessages()
  // },[selectedUser, getMessages,subscribeToMessages,unsubscribeFromMessages])

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              {/* LEFT AVATAR */}
              {!isOwnMessage && (
                <img
                  src={selectedUser?.profilePicture || "/avatar.png"}
                  className="w-8 h-8 rounded-full"
                />
              )}

              {/* MESSAGE */}
              <div className="flex flex-col max-w-xs">
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
                      alt="attachment"
                      className="max-w-[200px] rounded-md mb-2"
                    />
                  )}

                  {message.text}
                </div>
              </div>

              {/* RIGHT AVATAR */}
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

      {isTyping && (
        <div className="px-4 pb-2 text-sm text-zinc-400 flex gap-1 items-center">
          <span>Typing</span>

          <span className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100"></span>
            <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200"></span>
          </span>
        </div>
      )}

      <MessageInput />
    </div>
  );
}

export default ChatContainer;
