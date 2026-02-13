import React from 'react'

function MessageSkeleton() {

  const skeletonMessages = Array.from({ length: 6 });

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-pulse">
      {skeletonMessages.map((_, idx) => {

        const widths = ["w-24", "w-32", "w-40", "w-52", "w-64"];
        const randomWidth = widths[Math.floor(Math.random() * widths.length)];

        return (
          <div
            key={idx}
            className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full skeleton" />
            </div>

            <div className="chat-header mb-1">
              <div className="skeleton h-3 w-10" />
            </div>

            <div className="chat-bubble bg-transparent p-0">
              <div className={`skeleton h-10 ${randomWidth}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MessageSkeleton;
