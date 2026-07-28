import React from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="glass-panel p-12 rounded-2xl text-center space-y-4 my-12 max-w-lg mx-auto">
      <div className="text-4xl font-bold font-title text-[#ff3b30]">404</div>
      <h2 className="font-title text-xl font-semibold text-[#f0f4fc]">Quantum State Not Found</h2>
      <p className="text-xs text-[#8c9ba5]">The requested path collapsed into an invalid eigenstate.</p>
      <Link
        to="/"
        className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#9d4edd] text-black font-title font-semibold text-xs shadow-cyan"
      >
        Return to Home Overview
      </Link>
    </div>
  );
};
