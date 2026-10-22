import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  const onlineUsersSet = new Set(onlineUsers?.map((id) => id.toString()));
  const isOnline = onlineUsersSet.has(selectedUser._id?.toString());
  const isTyping = Boolean(
    typingUsers?.has(selectedUser._id) ||
      typingUsers?.has(selectedUser._id?.toString())
  );

  return (
    <div className="px-4 py-3 border-b border-base-content/10 bg-base-100/50 backdrop-blur-md">
      <div className="flex items-center justify-between">
        
        {/* User profile & status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="size-11 rounded-full overflow-hidden ring-2 ring-base-content/10 shadow-sm">
              <img
                src={selectedUser.profilePicture || "/avatar.png"}
                alt={selectedUser.fullName || "User"}
                className="size-full object-cover"
              />
            </div>
            {isOnline && (
              <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-base-100 shadow-sm" />
            )}
          </div>

          <div className="text-left">
            <h3 className="font-semibold text-sm leading-tight text-base-content">
              {selectedUser.fullName}
            </h3>
            <div className="text-xs mt-0.5">
              {isTyping ? (
                <span className="text-emerald-500 font-medium flex items-center gap-1">
                  Typing
                  <span className="flex gap-0.5 ml-0.5">
                    <span className="size-1 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="size-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="size-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                </span>
              ) : isOnline ? (
                <span className="text-emerald-500 font-medium flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Online
                </span>
              ) : (
                <span className="text-base-content/50">Offline</span>
              )}
            </div>
          </div>
        </div>

        {/* Close Chat Button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="btn btn-sm btn-ghost btn-circle hover:bg-base-200 transition-colors text-base-content/70 hover:text-base-content"
          title="Close chat"
          aria-label="Close chat"
        >
          <X className="size-4.5" />
        </button>

      </div>
    </div>
  );
}

export default ChatHeader;
