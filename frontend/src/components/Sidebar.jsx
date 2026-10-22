import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search } from "lucide-react";

function Sidebar({ sidebarWidth = 280 }) {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    typingUsers,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [search, setSearch] = useState("");

  const expanded = sidebarWidth > 250;

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = (user.fullName || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesOnline = showOnlineOnly
        ? onlineUsers?.includes(user._id?.toString())
        : true;

      return matchesSearch && matchesOnline;
    });
  }, [users, search, showOnlineOnly, onlineUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full flex flex-col transition-all duration-200 select-none bg-base-100/50">
      
      {/* HEADER */}
      <div className="border-b border-base-content/10 w-full p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Users className="size-4.5" />
            </div>
            {expanded && (
              <span className="font-bold text-sm tracking-tight text-base-content">
                Contacts
              </span>
            )}
          </div>
          {expanded && (
            <span className="text-[11px] font-semibold text-primary px-2 py-0.5 rounded-full bg-primary/10">
              {Math.max((onlineUsers?.length || 0) - 1, 0)} online
            </span>
          )}
        </div>

        {/* SEARCH */}
        {expanded && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-sm w-full pl-9 rounded-xl bg-base-200/60 focus:bg-base-100 border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/20 text-xs transition-all"
            />
          </div>
        )}

        {/* ONLINE FILTER TOGGLE */}
        {expanded && (
          <div className="flex items-center justify-between pt-0.5">
            <label className="cursor-pointer flex items-center gap-2 text-xs text-base-content/70 hover:text-base-content transition-colors">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-xs checkbox-primary rounded-md"
              />
              <span>Show online only</span>
            </label>
          </div>
        )}
      </div>

      {/* USER LIST */}
      <div className="overflow-y-auto flex-1 w-full p-2 space-y-1">
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isUserOnline = onlineUsers?.includes(user._id?.toString());
          const isUserTyping = Boolean(
            typingUsers?.has(user._id) ||
              typingUsers?.has(user._id?.toString())
          );

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full p-2.5 flex items-center gap-3 rounded-2xl
                transition-all duration-150 cursor-pointer text-left
                ${
                  isSelected
                    ? "bg-primary/15 text-primary-content shadow-sm ring-1 ring-primary/30"
                    : "hover:bg-base-200/70"
                }
              `}
            >
              {/* AVATAR */}
              <div className={`relative shrink-0 ${expanded ? "" : "mx-auto"}`}>
                <img
                  src={user.profilePicture || "/avatar.png"}
                  alt={user.fullName || "User"}
                  className="size-11 object-cover rounded-full ring-2 ring-base-content/10 shadow-sm"
                />

                {isUserOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full ring-2 ring-base-100 shadow-sm" />
                )}
              </div>

              {/* USER INFO */}
              {expanded && (
                <div className="text-left min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate text-base-content">
                    {user.fullName}
                  </div>

                  <div className="text-xs mt-0.5 truncate">
                    {isUserTyping ? (
                      <span className="text-emerald-500 font-medium flex items-center gap-1">
                        Typing
                        <span className="flex gap-0.5 ml-0.5">
                          <span className="size-1 bg-emerald-500 rounded-full animate-bounce"></span>
                          <span className="size-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="size-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </span>
                      </span>
                    ) : isUserOnline ? (
                      <span className="text-emerald-500 font-medium">Online</span>
                    ) : (
                      <span className="text-base-content/50">Offline</span>
                    )}
                  </div>
                </div>
              )}

              {/* UNREAD BADGE */}
              {expanded && user.unreadCount > 0 && (
                <span className="ml-auto bg-primary text-primary-content text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {user.unreadCount}
                </span>
              )}
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-xs text-base-content/50 py-8">
            No contacts found
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;