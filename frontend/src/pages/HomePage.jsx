import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";
import { useState, useEffect } from "react";

function HomePage() {
  const { selectedUser } = useChatStore();

  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);

  // START RESIZE
  const startResizing = () => {
    setIsResizing(true);
    document.body.style.userSelect = "none";
  };

  // STOP RESIZE
  const stopResizing = () => {
    setIsResizing(false);
    document.body.style.userSelect = "";
  };

  // CORRECT RESIZE LOGIC (relative to container)
  const resize = (e) => {
    if (!isResizing) return;

    const layout = document.getElementById("chat-layout");
    if (!layout) return;

    const left = layout.getBoundingClientRect().left;
    const newWidth = Math.min(Math.max(e.clientX - left, 200), 500);

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
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4 h-full">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)]">

          {/* IMPORTANT: give layout an id for resize math */}
          <div
            id="chat-layout"
            className="flex h-full rounded-lg overflow-hidden"
          >

            {/* SIDEBAR — ALWAYS VISIBLE */}
            <div
              style={{ width: sidebarWidth, minWidth: 200 }}
              className="relative flex-none border-r border-base-300"
            >
              <Sidebar sidebarWidth={sidebarWidth} />

              {/* DRAG HANDLE */}
              <div
                onMouseDown={startResizing}
                className="absolute top-0 right-0 w-2 h-full cursor-col-resize
                           bg-transparent hover:bg-base-300 active:bg-base-300"
              />
            </div>

            {/* CHAT AREA */}
            <div className="flex-1 flex">
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default HomePage;