import React from 'react';
import { Layers, ArrowDown, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface BellStateMeasurementProps {
  repeaterId: string;
  bsmOutcome: string;
  swappedFidelity: number;
  status: string;
}

export const BellStateMeasurement: React.FC<BellStateMeasurementProps> = ({
  repeaterId,
  bsmOutcome,
  swappedFidelity,
  status
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Bell State Measurement (BSM)
          </h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Node: {repeaterId}
        </span>
      </div>

      {/* Optical BSM Diagram */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-around gap-6 relative overflow-hidden">
        {/* Qubit A Input */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            ● Qubit A
          </div>
          <ArrowRight className="w-5 h-5 text-cyan-400 animate-pulse" />
        </div>

        {/* Central BSM Optical Beam Splitter Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/40 via-slate-900 to-indigo-900/40 border-2 border-purple-500/50 text-center space-y-2 relative shadow-2xl">
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-300 block">
            Bell State Measurement Optics
          </span>
          <div className="text-2xl font-extrabold font-mono text-purple-300 py-1 tracking-widest">
            {bsmOutcome || '|Φ+>'}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Beam Splitter & Single Photon Detectors
          </span>
        </div>

        {/* Qubit B Input */}
        <div className="flex items-center gap-3">
          <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div className="p-3 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 font-mono font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            ● Qubit B
          </div>
        </div>
      </div>

      {/* Outcome Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">MEASUREMENT OUTCOME</span>
          <span className="text-purple-300 font-bold text-sm">{bsmOutcome || '|Phi+>'}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">SWAPPED FIDELITY</span>
          <span className="text-emerald-400 font-bold text-sm">{(swappedFidelity * 100).toFixed(1)}%</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <span className="text-slate-400 block text-[10px]">SWAP STATUS</span>
          <span className="text-cyan-300 font-bold text-sm">{status || 'SWAP_SUCCESSFUL'}</span>
        </div>
      </div>
    </div>
  );
};
