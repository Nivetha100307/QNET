import React from 'react';
import { Lock, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

interface EndToEndReadinessCardProps {
  isReady: boolean;
  distanceKm: number;
  fidelity: number;
  latencyMs: number;
  bellPairs: number;
}

export const EndToEndReadinessCard: React.FC<EndToEndReadinessCardProps> = ({
  isReady,
  distanceKm,
  fidelity,
  latencyMs,
  bellPairs
}) => {
  return (
    <div className={`p-5 rounded-2xl border transition-all duration-500 shadow-xl ${
      isReady
        ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
        : 'bg-slate-900/90 border-slate-800'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Lock className={`w-5 h-5 ${isReady ? 'text-emerald-400' : 'text-slate-500'}`} />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            End-to-End QKD Readiness Status
          </h3>
        </div>

        <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
          isReady
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {isReady ? '✓ READY FOR E91 QKD' : 'SWAPPING IN PROGRESS'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">LINK STATUS</span>
          <span className={`font-bold text-sm ${isReady ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isReady ? 'READY' : 'PENDING'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">TOTAL DISTANCE</span>
          <span className="text-slate-200 font-bold text-sm">{distanceKm} km</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">AVG FIDELITY</span>
          <span className="text-cyan-300 font-bold text-sm">{(fidelity * 100).toFixed(1)}%</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">END-TO-END LATENCY</span>
          <span className="text-purple-300 font-bold text-sm">{latencyMs} ms</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">SHARED BELL PAIRS</span>
          <span className="text-emerald-300 font-bold text-sm">{bellPairs}</span>
        </div>
      </div>
    </div>
  );
};
