import React, { useState } from "react";
import { Cpu, Play, RefreshCw, RotateCcw, ShieldAlert, Sliders, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface QuantumControlPanelProps {
  isLoading?: boolean;
  onStartSession?: (numBits: number, enableEve?: boolean, noiseLevel?: number, backendName?: string) => void;
  onResetBench?: () => void;
}

export const QuantumControlPanel: React.FC<QuantumControlPanelProps> = ({
  isLoading = false,
  onStartSession,
  onResetBench,
}) => {
  const [numBits, setNumBits] = useState(128);
  const [eveActive, setEveActive] = useState(false);
  const [backend, setBackend] = useState("aer_simulator");
  const [noiseLevel, setNoiseLevel] = useState(0.5);

  const handleStart = () => {
    if (onStartSession) {
      onStartSession(numBits, eveActive, noiseLevel / 100, backend);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel p-6 rounded-2xl flex flex-wrap items-center justify-between gap-6"
    >
      {/* Number of Bits Selector */}
      <div className="flex flex-col gap-2 min-w-[160px]">
        <label className="text-xs font-semibold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-1.5">
          <Sliders size={14} className="text-[#00f0ff]" /> Key Length
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="32"
            max="512"
            step="32"
            value={numBits}
            onChange={(e) => setNumBits(Number(e.target.value))}
            className="accent-[#00f0ff] cursor-pointer"
          />
          <span className="font-title font-bold text-sm text-[#00f0ff] min-w-[65px]">
            {numBits} bits
          </span>
        </div>
      </div>

      {/* Backend Selector */}
      <div className="flex flex-col gap-2 min-w-[180px]">
        <label className="text-xs font-semibold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-1.5">
          <Cpu size={14} className="text-[#9d4edd]" /> Quantum Backend
        </label>
        <select
          value={backend}
          onChange={(e) => setBackend(e.target.value)}
          className="bg-white/5 border border-white/10 text-[#f0f4fc] text-xs rounded-xl px-3 py-2 outline-none cursor-pointer hover:bg-white/10 transition-all"
        >
          <option value="aer" className="bg-[#0b0d17]">Qiskit AerSimulator (Local CPU)</option>
          <option value="ibm" className="bg-[#0b0d17]">IBM Quantum Hardware (ibm_brisbane)</option>
        </select>
      </div>

      {/* Eavesdropper Toggle Switch */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert size={14} className={eveActive ? "text-[#ff3b30]" : "text-[#8c9ba5]"} /> Eavesdropper (Eve)
        </label>
        <button
          onClick={() => setEveActive(!eveActive)}
          className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all ${
            eveActive
              ? "bg-[#ff3b30]/15 border-[#ff3b30] text-[#ff3b30] shadow-[0_0_15px_rgba(255,59,48,0.3)]"
              : "bg-white/5 border-white/10 text-[#8c9ba5] hover:bg-white/10"
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${eveActive ? "bg-[#ff3b30] animate-ping" : "bg-[#5c6b75]"}`} />
          <span>{eveActive ? "Eve Intercept Active" : "Channel Secure"}</span>
        </button>
      </div>

      {/* Noise Level Slider */}
      <div className="flex flex-col gap-2 min-w-[140px]">
        <label className="text-xs font-semibold text-[#8c9ba5] uppercase tracking-wider flex items-center gap-1.5">
          <Zap size={14} className="text-[#ffb700]" /> Channel Noise
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={noiseLevel}
            onChange={(e) => setNoiseLevel(Number(e.target.value))}
            className="accent-[#ffb700] cursor-pointer"
          />
          <span className="font-title font-bold text-xs text-[#ffb700]">
            {noiseLevel.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleStart}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#9d4edd] text-black font-title font-bold text-sm shadow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} fill="black" />}
          <span>{isLoading ? "Executing API..." : "Start E91 Protocol"}</span>
        </button>
        <button
          onClick={onResetBench}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#8c9ba5] hover:text-[#f0f4fc] hover:bg-white/10 transition-all text-xs font-semibold"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </motion.div>
  );
};
