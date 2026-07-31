import React from 'react';
import { Activity } from 'lucide-react';

interface QuarcLivePhotonPropagationProps {
  activeDestination: string;
}

export const QuarcLivePhotonPropagation: React.FC<QuarcLivePhotonPropagationProps> = ({ activeDestination }) => {
  return (
    <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <span className="text-xs font-bold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          LIVE PHOTON PROPAGATION
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 py-2 px-1 relative">
        <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center font-bold text-[10px] text-cyan-300 z-10">
          CC
        </div>

        <div className="h-1 flex-1 bg-slate-800 relative">
          <div className="h-full bg-cyan-400 w-1/3 animate-pulse" />
        </div>

        <div className="w-8 h-8 rounded-full bg-blue-950 border border-blue-400 flex items-center justify-center font-bold text-[10px] text-blue-300 z-10">
          Cl-A
        </div>

        <div className="h-1 flex-1 bg-slate-800 relative">
          <div className="h-full bg-purple-400 w-1/2 animate-pulse" />
        </div>

        <div className="w-8 h-8 rounded-full bg-purple-950 border border-purple-400 flex items-center justify-center font-bold text-[10px] text-purple-300 z-10">
          Cl-B
        </div>

        <div className="h-1 flex-1 bg-slate-800 relative">
          <div className="h-full bg-amber-400 w-2/3 animate-pulse" />
        </div>

        <div className="w-8 h-8 rounded-full bg-amber-950 border border-amber-400 flex items-center justify-center font-bold text-[10px] text-amber-300 z-10">
          Cl-D
        </div>

        <div className="h-1 flex-1 bg-slate-800 relative">
          <div className="h-full bg-emerald-400 w-full animate-pulse" />
        </div>

        <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center font-bold text-[10px] text-emerald-300 z-10">
          Sub
        </div>
      </div>
    </div>
  );
};
