import React from "react";
import { Cpu, RefreshCw, Server, WifiOff } from "lucide-react";
import { motion } from "framer-motion";
import { HealthResponse } from "../../types/api";

interface BackendStatusCardProps {
  health: HealthResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export const BackendStatusCard: React.FC<BackendStatusCardProps> = ({
  health,
  isLoading,
  error,
  onRetry,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#9d4edd]/10 text-[#9d4edd] border border-[#9d4edd]/30">
            <Cpu size={18} />
          </div>
          <span className="text-xs font-semibold text-[#8c9ba5] uppercase tracking-wider">
            Quantum Engine API
          </span>
        </div>

        {isLoading ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ffb700]/15 text-[#ffb700] border border-[#ffb700]/30 animate-pulse">
            CONNECTING...
          </span>
        ) : error ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30">
            OFFLINE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
            HEALTHY
          </span>
        )}
      </div>

      <div>
        <h3 className="font-title font-bold text-base text-[#f0f4fc]">
          {isLoading
            ? "Checking REST Service..."
            : error
            ? "FastAPI Backend Connection Error"
            : `${health?.app} v${health?.version}`}
        </h3>
        <p className="text-xs text-[#8c9ba5] flex items-center gap-1 mt-0.5">
          <Server size={12} />
          {error
            ? error
            : health
            ? `Environment: ${health.environment} • REST API Online`
            : "Initializing connection..."}
        </p>
      </div>

      {error && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 self-start text-xs text-[#00f0ff] hover:underline font-semibold mt-1"
        >
          <RefreshCw size={12} /> Retry Connection
        </button>
      )}
    </motion.div>
  );
};
