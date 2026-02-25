import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";
import { useState, useEffect } from "react";

function HomePage() {
  const { selectedUser } = useChatStore();

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = () => {
    setIsResizing(true);
    document.body.style.userSelect = "none";
  };

  const stopResizing = () => {
    setIsResizing(false);
    document.body.style.userSelect = "";
  };

  const resize = (e) => {
    if (!isResizing) return;
    const newWidth = Math.min(Math.max(e.clientX, 200), 500);
    setSidebarWidth(newWidth);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  return (
    <div className="h-full bg-base-200">

      {/* MOBILE = FULL SCREEN */}
      {/* DESKTOP = CENTERED CARD */}
      <div className="h-full md:flex md:items-center md:justify-center md:pt-4 md:px-4">

        <div className="
          w-full h-full
          md:max-w-6xl
          md:h-[calc(100vh-8rem)]
          md:bg-base-100 md:rounded-lg md:shadow-xl
        ">

          <div id="chat-layout" className="flex h-full min-h-0 rounded-lg overflow-hidden">

            {/* SIDEBAR */}
            <div
              style={{ width: sidebarWidth }}
              className={`
                shrink-0 border-r border-base-300 bg-base-100
                ${selectedUser ? "hidden md:block" : "block"}
              `}
            >
              <Sidebar sidebarWidth={sidebarWidth} />

              {/* DESKTOP RESIZER */}
              <div
                onMouseDown={startResizing}
                className="hidden md:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-base-300"
              />
            </div>

            {/* CHAT */}
            <div className={`flex-1 flex flex-col min-h-0 ${selectedUser ? "block" : "hidden md:flex"}`}>
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;