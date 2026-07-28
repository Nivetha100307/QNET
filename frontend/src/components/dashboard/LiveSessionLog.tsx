import React from "react";
import { Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { LogEntry } from "../../mocks/dashboard";

interface LiveSessionLogProps {
  logs: LogEntry[];
}

export const LiveSessionLog: React.FC<LiveSessionLogProps> = ({ logs }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="glass-panel p-5 rounded-2xl flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-[#00f0ff]" />
          <h2 className="font-title font-bold text-base text-[#f0f4fc]">
            Live Protocol Execution Log
          </h2>
        </div>
        <span className="text-xs text-[#8c9ba5] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full font-mono">
          {logs.length} Events Captured
        </span>
      </div>

      <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-xs max-h-48 overflow-y-auto space-y-1.5 text-[#8c9ba5]">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-[#5c6b75]">{log.time}</span>
            <span className="text-[#00f0ff] font-semibold">[{log.type}]</span>
            <span className="text-[#f0f4fc]">{log.msg}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
