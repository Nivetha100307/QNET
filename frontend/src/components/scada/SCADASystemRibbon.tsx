import React from 'react';
import { ShieldCheck, Cpu, Key, Lock, Activity, Wifi, Radio, Clock } from 'lucide-react';

interface SCADASystemRibbonProps {
  sessionStatus: string;
  keyValid: boolean;
  targetDevice: string;
  latencyMs: number;
}

export const SCADASystemRibbon: React.FC<SCADASystemRibbonProps> = ({
  sessionStatus,
  keyValid,
  targetDevice,
  latencyMs
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md font-mono text-xs text-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-100 font-sans font-bold">SCADA SOC Operations Ribbon</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">SESSION:</span>
            <span className="text-emerald-400 font-bold">{sessionStatus}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">QUANTUM KEY:</span>
            <span className="text-purple-300 font-bold">{keyValid ? 'VALID (256-bit)' : 'EXPIRED'}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">AES CIPHER:</span>
            <span className="text-blue-300 font-bold">AES-256-GCM</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">RTU DEVICE:</span>
            <span className="text-amber-300 font-bold">{targetDevice} (ONLINE)</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">THREAT LEVEL:</span>
            <span className="text-emerald-400 font-bold">LOW</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">LATENCY:</span>
            <span className="text-cyan-300 font-bold">{latencyMs} ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
