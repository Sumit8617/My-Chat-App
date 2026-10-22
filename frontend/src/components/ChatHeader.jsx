import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

function ChatHeader() {
  const { selectedUser, setSelectedUser, typingUsers } = useChatStore();
  const { onlineUsers } = useAuthStore();

  if (!selectedUser) return null;

  const onlineUsersSet = new Set(
    onlineUsers?.map((id) => id.toString())
  );

  const isOnline = onlineUsersSet.has(selectedUser._id.toString());


  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePicture || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {(typingUsers?.has(selectedUser._id) || typingUsers?.has(selectedUser._id?.toString())) ? (
                <span className="text-green-400 flex items-center gap-1">
                  Typing
                  <span className="flex gap-1 ml-1">
                    <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></span>
                    <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce delay-200"></span>
                  </span>
                </span>
              ) : isOnline ? (
                "Online"
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
}
export default ChatHeader;
