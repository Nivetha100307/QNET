import React from 'react';
import { Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export const QuarcEntanglementSchedulerBar: React.FC = () => {
  return (
    <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <span className="text-xs font-bold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          ENTANGLEMENT SCHEDULER
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
        {/* Stage 1: Bell Pair Generation */}
        <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center flex-1 min-w-[120px]">
          <span className="text-slate-400 block text-[9px]">Bell Pair Generation</span>
          <span className="text-emerald-400 font-extrabold text-xs">432 available</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        {/* Stage 2: Memory Reservation */}
        <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center flex-1 min-w-[120px]">
          <span className="text-slate-400 block text-[9px]">Memory Reservation</span>
          <span className="text-purple-300 font-extrabold text-xs">76% utilized</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        {/* Stage 3: BSM Queue */}
        <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center flex-1 min-w-[120px]">
          <span className="text-slate-400 block text-[9px]">BSM Queue</span>
          <span className="text-cyan-300 font-extrabold text-xs">5 operations</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        {/* Stage 4: Swap Execution */}
        <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center flex-1 min-w-[120px]">
          <span className="text-slate-400 block text-[9px]">Swap Execution</span>
          <span className="text-amber-300 font-extrabold text-xs">2 in progress</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        {/* Stage 5: Transmission */}
        <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-cyan-500/40 text-center flex-1 min-w-[120px]">
          <span className="text-cyan-300 block text-[9px] font-bold">Transmission</span>
          <span className="text-cyan-200 font-extrabold text-xs animate-pulse">In progress</span>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

        {/* Stage 6: Verification */}
        <div className="bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-800 text-center flex-1 min-w-[120px]">
          <span className="text-slate-500 block text-[9px]">Verification</span>
          <span className="text-slate-400 font-bold text-xs">Pending</span>
        </div>
      </div>
    </div>
  );
};
