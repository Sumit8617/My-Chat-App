import { MessageSquare, Shield, Sparkles, Image, Palette } from "lucide-react";

function NoChatSelected() {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-base-100/40 relative overflow-hidden select-none">
      
      {/* Soft background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md text-center space-y-6 relative z-10">
        
        {/* Animated Badge & Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="size-3.5" />
            <span>End-to-End Realtime</span>
          </div>

          <div className="relative mt-2">
            <div className="size-20 rounded-3xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-content shadow-xl shadow-primary/25">
              <MessageSquare className="size-10" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-base-content to-base-content/70 bg-clip-text text-transparent">
            Welcome to Chatty!
          </h2>
          <p className="text-sm text-base-content/60 max-w-xs mx-auto leading-relaxed">
            Select a contact from the sidebar to start a real-time conversation.
          </p>
        </div>

        {/* Quick feature cards */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 text-center text-xs">
          <div className="p-3 rounded-2xl bg-base-200/60 border border-base-content/5 flex flex-col items-center gap-1.5">
            <Shield className="size-4 text-emerald-400" />
            <span className="font-semibold text-[11px] text-base-content/80">Encrypted</span>
          </div>
          <div className="p-3 rounded-2xl bg-base-200/60 border border-base-content/5 flex flex-col items-center gap-1.5">
            <Image className="size-4 text-sky-400" />
            <span className="font-semibold text-[11px] text-base-content/80">Media</span>
          </div>
          <div className="p-3 rounded-2xl bg-base-200/60 border border-base-content/5 flex flex-col items-center gap-1.5">
            <Palette className="size-4 text-purple-400" />
            <span className="font-semibold text-[11px] text-base-content/80">32 Themes</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default NoChatSelected;