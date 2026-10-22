import React from "react";
import { MessageSquare, ShieldCheck, Zap, Palette, CheckCheck, Sparkles } from "lucide-react";

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center relative p-8 xl:p-12 overflow-hidden bg-base-200/50">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-16 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-16 w-80 h-80 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Glass Showcase Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-base-100/60 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-base-content/10 transition-all hover:border-primary/30">
          
          {/* Mock Chat Header */}
          <div className="flex items-center justify-between pb-4 border-b border-base-content/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="size-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-content shadow-lg shadow-primary/20">
                  <MessageSquare className="size-5" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-emerald-500 rounded-full ring-2 ring-base-100" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-sm">
                  <span>Chatty Lounge</span>
                  <Sparkles className="size-3.5 text-amber-400" />
                </div>
                <p className="text-xs text-base-content/60 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  2,410 online now
                </p>
              </div>
            </div>
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block size-7 rounded-full ring-2 ring-base-100 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User 1" />
              <img className="inline-block size-7 rounded-full ring-2 ring-base-100 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="User 2" />
              <img className="inline-block size-7 rounded-full ring-2 ring-base-100 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User 3" />
            </div>
          </div>

          {/* Mock Messages Flow */}
          <div className="py-4 space-y-3.5 text-xs">
            {/* Incoming message */}
            <div className="flex items-start gap-2.5">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="Sophia" className="size-7 rounded-full object-cover mt-0.5" />
              <div className="bg-base-200/90 rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[80%] shadow-sm border border-base-content/5">
                <p className="font-medium text-base-content/70 text-[11px] mb-0.5">Sophia</p>
                <p className="text-base-content/90">Hey team! Are the new themes live? 🎨</p>
              </div>
            </div>

            {/* Outgoing message */}
            <div className="flex items-end justify-end gap-1.5">
              <div className="bg-primary text-primary-content rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[80%] shadow-md shadow-primary/20">
                <p>Yes! 32 themes with instant real-time sync ✨</p>
                <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-primary-content/80">
                  <span>10:42 AM</span>
                  <CheckCheck className="size-3 text-sky-200" />
                </div>
              </div>
            </div>

            {/* Simulated Typing Indicator */}
            <div className="flex items-center gap-2 pt-1 pl-1">
              <div className="flex items-center gap-1.5 bg-base-200/80 px-3 py-1.5 rounded-full text-[11px] text-base-content/70 border border-base-content/5">
                <span>Munmun is typing</span>
                <span className="flex gap-1 ml-0.5">
                  <span className="size-1 bg-primary rounded-full animate-bounce"></span>
                  <span className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            </div>
          </div>

          {/* Feature highlights bar */}
          <div className="pt-3 border-t border-base-content/10 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors">
              <Zap className="size-4 text-amber-400" />
              <span className="font-medium text-base-content/80">Instant Sync</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span className="font-medium text-base-content/80">JWT Secure</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-base-200/50 hover:bg-base-200 transition-colors">
              <Palette className="size-4 text-primary" />
              <span className="font-medium text-base-content/80">32 Themes</span>
            </div>
          </div>
        </div>

        {/* Text Details Below Card */}
        <div className="text-center mt-8 space-y-2">
          <h2 className="text-2xl xl:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-sm text-base-content/60 max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AuthImagePattern);