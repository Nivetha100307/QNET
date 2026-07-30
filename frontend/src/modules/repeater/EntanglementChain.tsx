import React from 'react';
import { Network, Zap, CheckCircle2 } from 'lucide-react';

interface EntanglementChainProps {
  stage: 'INITIAL' | 'BELL_PAIRS' | 'SWAP_R1' | 'SWAP_R2' | 'SWAP_R3' | 'END_TO_END';
  distanceKm: number;
}

export const EntanglementChain: React.FC<EntanglementChainProps> = ({ stage, distanceKm }) => {
  const getChainVisual = () => {
    switch (stage) {
      case 'INITIAL':
        return [
          { name: 'Control', active: true },
          { name: 'R1', active: false },
          { name: 'R2', active: false },
          { name: 'R3', active: false },
          { name: 'Substation', active: false }
        ];
      case 'BELL_PAIRS':
        return [
          { name: 'Control', active: true },
          { name: 'R1', active: true },
          { name: 'R2', active: true },
          { name: 'R3', active: true },
          { name: 'Substation', active: true }
        ];
      case 'SWAP_R1':
        return [
          { name: 'Control', active: true },
          { name: 'R2 (via R1 Swap)', active: true },
          { name: 'R3', active: true },
          { name: 'Substation', active: true }
        ];
      case 'SWAP_R2':
        return [
          { name: 'Control', active: true },
          { name: 'R3 (via R1+R2 Swaps)', active: true },
          { name: 'Substation', active: true }
        ];
      case 'SWAP_R3':
      case 'END_TO_END':
        return [
          { name: 'Control Center', active: true },
          { name: 'Substation A (End-to-End Entangled)', active: true }
        ];
      default:
        return [];
    }
  };

  const chainNodes = getChainVisual();
  const isEndToEnd = stage === 'END_TO_END' || stage === 'SWAP_R3';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Entanglement Swapping & Link Extension
          </h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
          {isEndToEnd ? 'END-TO-END ESTABLISHED' : 'SWAPPING IN PROGRESS'}
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Watch the quantum link contract multi-hop repeaters into a single direct long-distance entanglement line:
      </p>

      {/* Dynamic Growing Line Container */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 relative min-h-[90px]">
        {chainNodes.map((node, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2 z-10">
              <div
                className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition-all duration-500 ${
                  isEndToEnd
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                    : node.active
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                ● {node.name}
              </div>
            </div>

            {i < chainNodes.length - 1 && (
              <div className="flex-1 min-w-[40px] h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500 rounded-full relative overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                <div className="absolute inset-0 bg-white/40 animate-pulse" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
