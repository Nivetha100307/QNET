import React from 'react';
import { QuarcCluster } from '../../../services/repeaterApi';
import { ChevronRight, Radio } from 'lucide-react';

interface TopologyCanvasProps {
  clusters: QuarcCluster[];
  currentStep: number;
  selectedDestination: string;
  onClusterClick: (cluster: QuarcCluster) => void;
  onClusterHover: (cluster: QuarcCluster | null) => void;
  hoveredCluster: QuarcCluster | null;
}

export const TopologyCanvas: React.FC<TopologyCanvasProps> = ({
  clusters,
  currentStep,
  selectedDestination,
  onClusterClick,
  onClusterHover,
  hoveredCluster
}) => {
  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 relative overflow-hidden shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <span className="text-xs font-bold text-slate-300 font-sans flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-ping" />
          Dynamic Quantum Cluster Mesh &amp; Photonic Inter-Cluster Propagation
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Click any cluster to inspect internal repeaters &amp; quantum memory
        </span>
      </div>

      {/* SVG Inter-Cluster Animated Optical Links */}
      <div className="relative min-h-[300px] flex items-center justify-between gap-6 px-4">
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <defs>
            <linearGradient id="cyanLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Inter-Cluster Optical Link Lines */}
          <line x1="25%" y1="50%" x2="50%" y2="50%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
          <line x1="50%" y1="50%" x2="75%" y2="50%" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />

          {/* Moving Photons */}
          {currentStep >= 7 && (
            <>
              <circle r="6" fill="#22d3ee" className="shadow-lg">
                <animate attributeName="cx" values="25%;50%;75%" dur="2s" repeatCount="indefinite" />
                <animate attributeName="cy" values="50%;50%;50%" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="4" fill="#a855f7">
                <animate attributeName="cx" values="50%;75%" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="cy" values="50%;50%" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>

        {/* Render Cluster Cards */}
        {clusters.map((cluster) => {
          const isHovered = hoveredCluster?.id === cluster.id;
          const healthColor = cluster.health >= 90 ? 'border-emerald-500/60 bg-emerald-950/20' : cluster.health >= 75 ? 'border-amber-500/60 bg-amber-950/20' : 'border-rose-500/60 bg-rose-950/20';

          return (
            <div
              key={cluster.id}
              onMouseEnter={() => onClusterHover(cluster)}
              onMouseLeave={() => onClusterHover(null)}
              onClick={() => onClusterClick(cluster)}
              className={`z-10 flex-1 max-w-[280px] bg-slate-900/90 border-2 rounded-2xl p-4 shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 ${healthColor} relative group`}
            >
              {/* Cluster Pulsing Ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur opacity-40 group-hover:opacity-100 transition duration-500" />

              <div className="relative space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-slate-100 font-sans">{cluster.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {cluster.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">HEALTH</span>
                    <span className="text-emerald-400 font-bold text-xs">{cluster.health}%</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">FIDELITY</span>
                    <span className="text-cyan-300 font-bold text-xs">{cluster.avg_fidelity}%</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">MEMORY</span>
                    <span className="text-purple-300 font-bold text-xs">{cluster.avg_memory_ms} ms</span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">SWAP SUCCESS</span>
                    <span className="text-amber-300 font-bold text-xs">{(cluster.avg_swap_success * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Nodes: <strong className="text-slate-200">{cluster.nodes.length}</strong></span>
                  <span className="text-cyan-400 group-hover:underline flex items-center gap-1 font-sans">
                    Expand <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>

              {/* Rich Hover Tooltip */}
              {isHovered && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-slate-950 border-2 border-cyan-500/60 rounded-2xl p-4 shadow-2xl z-50 text-[11px] font-mono space-y-2 pointer-events-none">
                  <div className="font-extrabold text-cyan-300 border-b border-slate-800 pb-1 flex items-center justify-between">
                    <span>{cluster.name}</span>
                    <span>{cluster.id}</span>
                  </div>
                  <div className="space-y-1 text-slate-300 text-[10px]">
                    <div>Nodes: <strong>{cluster.nodes.join(', ')}</strong></div>
                    <div>Leader Node: <strong>{cluster.leader}</strong></div>
                    <div>Avg QBER: <strong className="text-rose-400">{cluster.avg_qber}%</strong></div>
                    <div>Bell Pairs Available: <strong className="text-emerald-400">154 Pairs</strong></div>
                    <div>Queue Depth: <strong className="text-amber-300">3 Requests</strong></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
