import React from 'react';
import { Atom, Zap, RefreshCw } from 'lucide-react';

interface BellPairVisualizerProps {
  counter: number;
  stage: string;
  distanceKm?: number;
  noiseEnabled?: boolean;
}

export const BellPairVisualizer: React.FC<BellPairVisualizerProps> = ({
  counter,
  stage,
  distanceKm = 120,
  noiseEnabled = false
}) => {
  // Real-time quantum physics calculation for EPR generation fidelity
  const hopDist = distanceKm / 4;
  const alpha_gen = noiseEnabled ? 0.0032 : 0.0012;
  const generationFidelity = (Math.max(0.75, 0.995 * Math.exp(-alpha_gen * hopDist)) * 100).toFixed(1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Atom className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Bell Pair Generation ($|\Psi^-\rangle$)
          </h3>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
          Qiskit AerSimulator
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Live Animated Counter Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Bell Pair Counter</span>
            <span className="text-xs font-mono text-slate-300">Target Pairs: 24</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-400 animate-pulse">
              {counter}
            </span>
            <span className="text-xs font-mono text-slate-500">/ 24</span>
          </div>
        </div>

        {/* State Representation */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1 font-mono text-xs">
          <div className="text-slate-400 flex justify-between">
            <span>Entangled EPR Pair State:</span>
            <span className="text-purple-400 font-bold">{"|Ψ⁻⟩ = 1/√2(|01⟩ - |10⟩)"}</span>
          </div>
          <div className="text-slate-400 flex justify-between">
            <span>Generation Fidelity:</span>
            <span className="text-emerald-400 font-bold">{generationFidelity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
