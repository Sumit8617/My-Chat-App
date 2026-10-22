import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare, Settings, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

function Navbar() {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="bg-base-100/70 border-b border-base-content/10 sticky top-0 z-40 backdrop-blur-xl transition-colors">
      <div className="w-full px-4 sm:px-6 h-16">
        <div className="flex items-center justify-between h-full">
          
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group hover:opacity-95 transition-all"
          >
            <div className="size-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-content shadow-md shadow-primary/25 group-hover:scale-105 transition-transform duration-300">
              <MessageSquare className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight leading-none bg-gradient-to-r from-base-content to-base-content/75 bg-clip-text text-transparent">
                Chatty
              </span>
              <span className="text-[10px] text-primary font-semibold tracking-wider uppercase mt-0.5">
                Realtime
              </span>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/settings"
              className="btn btn-sm btn-ghost rounded-xl gap-2 hover:bg-base-200/80 transition-all text-xs font-medium"
            >
              <Settings className="size-4 text-base-content/70" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link
                  to="/profile"
                  className="btn btn-sm btn-ghost rounded-xl gap-2 hover:bg-base-200/80 transition-all text-xs font-medium"
                >
                  <User className="size-4 text-base-content/70" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button
                  onClick={logout}
                  className="btn btn-sm btn-ghost rounded-xl gap-2 hover:bg-error/15 hover:text-error text-base-content/70 transition-all text-xs font-medium cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;