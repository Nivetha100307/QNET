import React from "react";
import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { QBERData } from "../../mocks/dashboard";

interface QBERCardProps {
  qberData: QBERData;
}

export const QBERCard: React.FC<QBERCardProps> = ({ qberData }) => {
  const { errorRate, maxThreshold, isSecure } = qberData;
  const errorPct = errorRate * 100;
  const thresholdPct = maxThreshold * 100;
  const progressPct = Math.min(100, (errorRate / maxThreshold) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className={isSecure ? "text-[#00ff9d]" : "text-[#ff3b30]"} />
          <h2 className="font-title font-bold text-base text-[#f0f4fc]">
            Quantum Bit Error Rate (QBER)
          </h2>
        </div>
        <span
          className={`text-xs border px-2.5 py-1 rounded-full font-semibold ${
            isSecure
              ? "text-[#00ff9d] bg-[#00ff9d]/10 border-[#00ff9d]/30"
              : "text-[#ff3b30] bg-[#ff3b30]/10 border-[#ff3b30]/30"
          }`}
        >
          {isSecure ? "Error Rate Safe" : "High Error Security Abort"}
        </span>
      </div>

      <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-xs text-[#8c9ba5]">Current Channel Error:</span>
          <span
            className={`font-title font-extrabold text-xl ${
              isSecure ? "text-[#00ff9d] glow-green" : "text-[#ff3b30]"
            }`}
          >
            {errorPct.toFixed(2)}%
          </span>
        </div>

        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isSecure ? "bg-gradient-to-r from-[#00ff9d] to-[#ffb700]" : "bg-[#ff3b30]"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-[#5c6b75]">
          <span>0.0% Ideal</span>
          <span className="text-[#ffb700] font-semibold">
            Max Threshold: {thresholdPct.toFixed(1)}%
          </span>
        </div>
      </div>

      <div
        className={`flex items-center gap-2 text-xs p-3 rounded-xl border ${
          isSecure
            ? "text-[#00ff9d] bg-[#00ff9d]/5 border-[#00ff9d]/20"
            : "text-[#ff3b30] bg-[#ff3b30]/5 border-[#ff3b30]/20"
        }`}
      >
        {isSecure ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
        <span>
          {isSecure
            ? "Error rate is well within secure bounds for key derivation."
            : "QBER exceeds 11% threshold. Session aborted."}
        </span>
      </div>
    </motion.div>
  );
};
