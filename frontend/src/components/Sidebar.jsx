import React, { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

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

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.fullName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesOnline = showOnlineOnly
      ? onlineUsers?.includes(user._id.toString())
      : true;

    return matchesSearch && matchesOnline;
  });

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full border-r border-base-300 flex flex-col transition-all duration-200">

      {/* HEADER */}
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          {expanded && <span className="font-medium">Contacts</span>}
        </div>

        {/* ONLINE FILTER */}
        {expanded && (
          <div className="mt-3 flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">Show online only</span>
            </label>

            <span className="text-xs text-zinc-500">
              ({Math.max((onlineUsers?.length || 0) - 1, 0)} online)
            </span>
          </div>
        )}

        {/* SEARCH */}
        {expanded && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-sm input-bordered w-full"
            />
          </div>
        )}
      </div>

      {/* USER LIST */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >

            {/* AVATAR */}
            <div className={`relative ${expanded ? "" : "mx-auto"}`}>
              <img
                src={user.profilePicture || "/avatar.png"}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />

              {onlineUsers?.includes(user._id.toString()) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div>

            {/* USER INFO */}
            {expanded && (
              <div className="text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>

                <div className="text-sm text-zinc-400">
                  {typingUsers.has(user._id) ? (
                    <span className="text-green-400 flex items-center gap-1">
                      Typing
                      <span className="flex gap-1 ml-1">
                        <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce"></span>
                        <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce delay-100"></span>
                        <span className="w-1 h-1 bg-green-400 rounded-full animate-bounce delay-200"></span>
                      </span>
                    </span>
                  ) : onlineUsers?.includes(user._id.toString()) ? (
                    "Online"
                  ) : (
                    "Offline"
                  )}
                </div>
              </div>
            )}

            {/* UNREAD BADGE */}
            {expanded && user.unreadCount > 0 && (
              <span className="ml-auto bg-primary text-primary-content text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {user.unreadCount}
              </span>
            )}
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            No users found
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;