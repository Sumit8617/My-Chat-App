import React from "react";

const AuthImagePattern = ({ title, subtitle, animate = true }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">

        <div className="grid grid-cols-3 gap-3 mb-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              role="presentation"
              className={`aspect-square rounded-2xl bg-primary/10 ${
                animate && i % 2 === 0 ? "animate-pulse" : ""
              }`}
            />
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>

      </div>
    </div>
  );
};

export default React.memo(AuthImagePattern);