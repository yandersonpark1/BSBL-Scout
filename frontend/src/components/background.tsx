import React from "react";

const Background: React.FC = () => {
  return (
    <div
      className="fixed inset-0 -z-10 w-full h-full bg-black"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 150, 255, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 150, 255, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/20 via-teal-400/15 to-transparent blur-3xl animate-blob-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-blue-500/15 via-cyan-400/15 to-transparent blur-3xl animate-blob-slow" />
    </div>
  );
};

export default Background;






