import React from 'react';
import { ShieldCheck, Activity, Cpu, Radio, Network } from 'lucide-react';

interface QuantumHealthCardProps {
  networkHealthPct: number;
  activeRepeatersCount: number;
  totalRepeatersCount: number;
  memoryEfficiencyPct: number;
  linkStatus: string;
}

export const QuantumHealthCard: React.FC<QuantumHealthCardProps> = ({
  networkHealthPct,
  activeRepeatersCount,
  totalRepeatersCount,
  memoryEfficiencyPct,
  linkStatus
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Quantum Network Health
          </h3>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-bold">
          {linkStatus || 'STABLE'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase block">NETWORK HEALTH</span>
          <span className="text-emerald-400 font-extrabold text-lg">{networkHealthPct}%</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase block">ACTIVE REPEATERS</span>
          <span className="text-cyan-300 font-extrabold text-lg">
            {activeRepeatersCount} / {totalRepeatersCount}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase block">MEMORY EFFICIENCY</span>
          <span className="text-purple-300 font-extrabold text-lg">{memoryEfficiencyPct}%</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[10px] uppercase block">QUANTUM LINKS</span>
          <span className="text-emerald-400 font-extrabold text-sm">{linkStatus}</span>
        </div>
      </div>
    </div>
  );
};
