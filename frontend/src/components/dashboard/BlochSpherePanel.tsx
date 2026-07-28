import React from "react";
import { Compass, Globe } from "lucide-react";
import { motion } from "framer-motion";

export const BlochSpherePanel: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-panel p-5 rounded-2xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-[#9d4edd]" />
          <h2 className="font-title font-bold text-base text-[#f0f4fc]">
            Qubit Basis & Measurement Angles
          </h2>
        </div>
        <span className="text-xs text-[#8c9ba5] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
          Ry(-θ) Rotations
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Alice Bloch Sphere */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col items-center gap-3">
          <h3 className="text-xs font-semibold text-[#00f0ff] uppercase tracking-wider">
            Alice Basis Projection
          </h3>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 2" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 2" />
              {/* Vector Arrow Alice */}
              <line x1="50" y1="50" x2="50" y2="12" stroke="#00f0ff" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="12" r="3" fill="#ffffff" />
            </svg>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Compass size={14} className="text-[#00f0ff]" />
            <span className="text-[#8c9ba5]">Angle: <strong className="text-[#00f0ff]">0.0° (A1)</strong></span>
          </div>
        </div>

        {/* Bob Bloch Sphere */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col items-center gap-3">
          <h3 className="text-xs font-semibold text-[#ff007f] uppercase tracking-wider">
            Bob Basis Projection
          </h3>
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 2" />
              <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 2" />
              {/* Vector Arrow Bob (Rotated 45 degrees) */}
              <line x1="50" y1="50" x2="78" y2="22" stroke="#ff007f" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="78" cy="22" r="3" fill="#ffffff" />
            </svg>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Compass size={14} className="text-[#ff007f]" />
            <span className="text-[#8c9ba5]">Angle: <strong className="text-[#ff007f]">45.0° (B1)</strong></span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
