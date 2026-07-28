import React from "react";
import { AlertTriangle, CheckCircle2, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { BellScoreData } from "../../mocks/dashboard";

interface BellScoreCardProps {
  bellData: BellScoreData;
}

export const BellScoreCard: React.FC<BellScoreCardProps> = ({ bellData }) => {
  const { sValue, isEntangled, eavesdroppingDetected, correlations } = bellData;
  const percentage = Math.min(100, Math.max(0, (sValue / 2.828) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass-panel p-5 rounded-2xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-[#00f0ff]" />
          <h2 className="font-title font-bold text-base text-[#f0f4fc]">
            CHSH Bell Inequality Verification
          </h2>
        </div>
        <span
          className={`text-xs border px-2.5 py-1 rounded-full font-semibold ${
            isEntangled
              ? "text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/30"
              : "text-[#ff3b30] bg-[#ff3b30]/10 border-[#ff3b30]/30"
          }`}
        >
          {isEntangled ? "Quantum Non-Locality Test" : "Classical Bound (S ≤ 2.0)"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Gauge Display */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col items-center gap-3 text-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={isEntangled ? "url(#cyanPurpleGradient)" : "#ff3b30"}
                strokeWidth="8"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="cyanPurpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#9d4edd" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span
                className={`font-title font-extrabold text-2xl ${
                  isEntangled ? "text-[#00f0ff] glow-cyan" : "text-[#ff3b30]"
                }`}
              >
                {sValue.toFixed(3)}
              </span>
              <span className="text-[10px] text-[#8c9ba5] uppercase">Bell Parameter S</span>
            </div>
          </div>

          <div
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              isEntangled ? "text-[#00ff9d]" : "text-[#ff3b30]"
            }`}
          >
            {isEntangled ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            <span>
              {isEntangled
                ? "Secure Entanglement (S > 2.0)"
                : "Violation Failed / Eve Detected"}
            </span>
          </div>
        </div>

        {/* Correlations Table */}
        <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
          <h3 className="text-xs font-semibold text-[#8c9ba5] uppercase tracking-wider">
            Correlation Expectations E(Ai, Bj)
          </h3>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-[#5c6b75]">
                <th className="pb-1.5">Pair</th>
                <th className="pb-1.5">Angles</th>
                <th className="pb-1.5 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#f0f4fc]">
              <tr>
                <td className="py-1.5 font-mono">E(A1, B1)</td>
                <td className="py-1.5 text-[#8c9ba5]">0° / 45°</td>
                <td className="py-1.5 text-right font-semibold text-[#00f0ff]">
                  {correlations.e11.toFixed(3)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 font-mono">E(A1, B3)</td>
                <td className="py-1.5 text-[#8c9ba5]">0° / 135°</td>
                <td className="py-1.5 text-right font-semibold text-[#ff007f]">
                  {correlations.e13.toFixed(3)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 font-mono">E(A3, B1)</td>
                <td className="py-1.5 text-[#8c9ba5]">90° / 45°</td>
                <td className="py-1.5 text-right font-semibold text-[#00f0ff]">
                  {correlations.e31.toFixed(3)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5 font-mono">E(A3, B3)</td>
                <td className="py-1.5 text-[#8c9ba5]">90° / 135°</td>
                <td className="py-1.5 text-right font-semibold text-[#00f0ff]">
                  {correlations.e33.toFixed(3)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
