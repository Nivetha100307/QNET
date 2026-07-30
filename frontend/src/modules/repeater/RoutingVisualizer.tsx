import React from 'react';
import { Network, CheckCircle2, CornerDownRight } from 'lucide-react';
import { RouteCandidate } from '../../services/repeaterApi';

interface RoutingVisualizerProps {
  availableRoutes: RouteCandidate[];
  distanceKm: number;
}

export const RoutingVisualizer: React.FC<RoutingVisualizerProps> = ({
  availableRoutes,
  distanceKm
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Dynamic Quantum Dijkstra Routing Engine
          </h3>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
          NetworkX Graph Solver
        </span>
      </div>

      <div className="space-y-3">
        {availableRoutes.map((route, idx) => {
          const isActive = route.active;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all duration-300 ${
                isActive
                  ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <CornerDownRight className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                  <span className={`text-xs font-bold font-mono ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                    {route.name}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-slate-400">Hops: <strong className="text-slate-200">{route.hop_count}</strong></span>
                  <span className="text-slate-400">Cost: <strong className={isActive ? 'text-emerald-400' : 'text-slate-400'}>{route.cost} dB</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'}`}>
                    {route.status}
                  </span>
                </div>
              </div>

              {/* Hop Chain Path String */}
              <div className="mt-2 text-[11px] font-mono text-slate-300 bg-slate-950 p-2 rounded border border-slate-800/80 overflow-x-auto">
                {route.hops.join('  ⟶  ')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
