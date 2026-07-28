import React from "react";
import { Activity, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardContext } from "../../contexts/DashboardContext";

export const WebSocketStatusCard: React.FC = () => {
  const { wsStatus, wsEventCount } = useDashboardContext();

  const getStatusBadge = () => {
    switch (wsStatus) {
      case "CONNECTED":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#00ff9d]/15 text-[#00ff9d] border border-[#00ff9d]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
            LIVE TELEMETRY
          </span>
        );
      case "CONNECTING":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/30 animate-pulse">
            CONNECTING...
          </span>
        );
      case "RECONNECTING":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ffb700]/15 text-[#ffb700] border border-[#ffb700]/30 animate-pulse">
            RECONNECTING
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#ff3b30]/15 text-[#ff3b30] border border-[#ff3b30]/30">
            FAILED
          </span>
        );
      case "DISCONNECTED":
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-[#8c9ba5] border border-white/10">
            STANDBY
          </span>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="glass-panel p-5 rounded-2xl flex flex-col justify-between gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
            <Wifi size={18} />
          </div>
          <span className="text-xs font-semibold text-[#8c9ba5] uppercase tracking-wider">
            Duplex Telemetry Socket
          </span>
        </div>
        {getStatusBadge()}
      </div>

      <div>
        <h3 className="font-title font-bold text-base text-[#f0f4fc]">
          /api/v1/ws/qkd/sessions
        </h3>
        <p className="text-xs text-[#8c9ba5] flex items-center gap-1 mt-0.5">
          <Activity size={12} /> Live Event Dispatcher • {wsEventCount} Events Streamed
        </p>
      </div>
    </motion.div>
  );
};
