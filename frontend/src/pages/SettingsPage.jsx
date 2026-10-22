import React from "react";
import { useThemeStore, THEMES } from "../store/useThemeStore";
import { Send, Palette, Check } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, text: "Hey! How's the new chat app looking?", isSent: false, time: "12:00 PM" },
  { id: 2, text: "Loving the new themes! Super smooth and modern 🚀", isSent: true, time: "12:01 PM" },
];

function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-full overflow-y-auto px-4 py-8 max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold">Theme</h2>
        </div>
        <p className="text-sm text-base-content/70">
          Choose a theme for your chat interface
        </p>
      </div>

      {/* THEME GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {THEMES.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`
              group flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all duration-200
              ${
                theme === t
                  ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/40"
                  : "border-base-300 hover:border-base-content/30 hover:bg-base-200/50"
              }
            `}
          >
            {/* MINI THEME PALETTE PREVIEW */}
            <div
              className="relative h-8 w-full rounded-lg overflow-hidden border border-base-300/40"
              data-theme={t}
            >
              <div className="absolute inset-0 grid grid-cols-4 gap-0.5 p-1 bg-base-100">
                <div className="rounded bg-primary" />
                <div className="rounded bg-secondary" />
                <div className="rounded bg-accent" />
                <div className="rounded bg-neutral" />
              </div>
            </div>

            {/* THEME NAME */}
            <div className="flex items-center justify-between w-full px-1">
              <span className="text-xs font-medium truncate capitalize">
                {t}
              </span>
              {theme === t && (
                <Check className="size-3.5 text-primary shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* CHAT PREVIEW SECTION */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Live Preview</h3>

        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-lg overflow-hidden">
          <div className="p-4 bg-base-200 max-w-lg mx-auto my-4 rounded-xl border border-base-300">
            {/* MOCK CHAT HEADER */}
            <div className="flex items-center gap-3 pb-3 border-b border-base-300">
              <div className="size-9 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold text-sm">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">John Doe</h4>
                <p className="text-xs text-green-500 font-medium">Online</p>
              </div>
            </div>

            {/* MOCK CHAT MESSAGES */}
            <div className="py-4 space-y-3">
              {PREVIEW_MESSAGES.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm
                      ${
                        msg.isSent
                          ? "bg-primary text-primary-content rounded-br-none"
                          : "bg-base-300 text-base-content rounded-bl-none"
                      }
                    `}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`text-[10px] mt-1 text-right opacity-70`}
                    >
                      {msg.time} {msg.isSent && "✓✓"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* MOCK INPUT BAR */}
            <div className="flex items-center gap-2 pt-2 border-t border-base-300">
              <input
                type="text"
                readOnly
                placeholder="This is a preview..."
                className="input input-sm input-bordered flex-1 rounded-xl text-xs bg-base-100"
              />
              <button
                type="button"
                className="btn btn-sm btn-circle btn-primary"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;