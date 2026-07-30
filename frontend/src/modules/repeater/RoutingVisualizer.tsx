import React, { useState } from 'react';
import { Network, CheckCircle2, CornerDownRight, Zap, Radio } from 'lucide-react';
import { RouteCandidate } from '../../services/repeaterApi';

interface RoutingVisualizerProps {
  availableRoutes: RouteCandidate[];
  distanceKm: number;
}

export const RoutingVisualizer: React.FC<RoutingVisualizerProps> = ({
  availableRoutes,
  distanceKm
}) => {
  const [selectedRouteIdx, setSelectedRouteIdx] = useState<number>(0);

  const activeRoute = availableRoutes[selectedRouteIdx] || availableRoutes[0];
  const hops = activeRoute ? activeRoute.hops : [];
  const numNodes = hops.length;

  // Format node label cleanly
  const formatNodeLabel = (nodeId: string) => {
    if (nodeId.includes('Control')) return 'Control Center';
    if (nodeId.includes('Repeater_R1')) return 'Repeater R1';
    if (nodeId.includes('Repeater_R2')) return 'Repeater R2';
    if (nodeId.includes('Repeater_R3')) return 'Repeater R3';
    return nodeId.replace(/_/g, ' ');
  };

  // Node icon type helper
  const getNodeType = (idx: number, total: number) => {
    if (idx === 0) return 'SOURCE';
    if (idx === total - 1) return 'DESTINATION';
    return 'REPEATER';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Network className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              Dynamic Quantum Dijkstra Routing Visualizer
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Live Photonic Transmission Graph &amp; NetworkX Shortest Path Solver
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/30 flex items-center gap-1.5 self-start sm:self-auto">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          NetworkX Graph Solver
        </span>
      </div>

      {/* Path Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {availableRoutes.map((route, idx) => {
          const isSelected = selectedRouteIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedRouteIdx(idx)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950/40 to-slate-900 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {route.active ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <CornerDownRight className="w-4 h-4 text-purple-400 shrink-0" />
                  )}
                  <span className={`text-xs font-bold font-mono ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {route.name}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  route.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {route.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/60 pt-2">
                <span>Hops: <strong className="text-slate-200">{route.hop_count}</strong></span>
                <span>Loss: <strong className={route.active ? 'text-emerald-400' : 'text-slate-300'}>{route.cost} dB</strong></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* DIAGRAMMATIC GRAPHICAL VISUALIZER WITH MOVING PHOTONS */}
      <div className="bg-slate-950 rounded-2xl border border-cyan-500/30 p-4 sm:p-6 shadow-inner space-y-4 overflow-hidden relative">
        <div className="flex items-center justify-between text-xs font-mono border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>PHOTON MOTION GRAPH ({activeRoute.name})</span>
          </div>
          <span className="text-slate-400">
            Total Path Distance: <strong className="text-cyan-300">{distanceKm} km</strong> ({activeRoute.hop_count} Hops)
          </span>
        </div>

        {/* SVG Diagrammatic Canvas */}
        <div className="w-full overflow-x-auto py-4">
          <svg viewBox="0 0 800 170" className="w-full min-w-[650px] h-auto overflow-visible">
            <defs>
              <linearGradient id="fiberGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b2d4" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>
              <filter id="photonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Link Lines & Photons */}
            {hops.map((_, i) => {
              if (i === numNodes - 1) return null;
              const x1 = 60 + i * (680 / (numNodes - 1));
              const x2 = 60 + (i + 1) * (680 / (numNodes - 1));
              const y = 75;
              const hopLoss = (activeRoute.cost / (numNodes - 1)).toFixed(1);
              const hopDist = (distanceKm / (numNodes - 1)).toFixed(0);

              const pathD = `M ${x1} ${y} L ${x2} ${y}`;

              return (
                <g key={`link-group-${i}`}>
                  {/* Background Fiber Channel */}
                  <line x1={x1} y1={y} x2={x2} y2={y} stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                  
                  {/* Glowing Active Optical Line */}
                  <path id={`hop-path-${selectedRouteIdx}-${i}`} d={pathD} stroke="url(#fiberGlow)" strokeWidth="3" strokeDasharray="6 3" />

                  {/* Moving Photons along the Path */}
                  <circle r="5" fill="#38bdf8" filter="url(#photonGlow)">
                    <animateMotion path={pathD} dur="1.8s" repeatCount="indefinite" begin={`${i * 0.35}s`} />
                  </circle>

                  <circle r="4" fill="#e879f9" filter="url(#photonGlow)">
                    <animateMotion path={pathD} dur="1.8s" repeatCount="indefinite" begin={`${i * 0.35 + 0.6}s`} />
                  </circle>

                  {/* Hop distance & attenuation label */}
                  <rect x={(x1 + x2) / 2 - 35} y={y - 32} width="70" height="20" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                  <text x={(x1 + x2) / 2} y={y - 18} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    {hopDist}km | {hopLoss}dB
                  </text>
                </g>
              );
            })}

            {/* Render Nodes (Glowing Circles & Icons) */}
            {hops.map((nodeId, idx) => {
              const x = 60 + idx * (680 / (numNodes - 1));
              const y = 75;
              const nodeType = getNodeType(idx, numNodes);
              const label = formatNodeLabel(nodeId);

              let nodeColor = '#06b2d4';
              let bgColor = '#083344';
              if (nodeType === 'SOURCE') {
                nodeColor = '#38bdf8';
                bgColor = '#0c4a6e';
              } else if (nodeType === 'DESTINATION') {
                nodeColor = '#34d399';
                bgColor = '#064e3b';
              } else {
                nodeColor = '#c084fc';
                bgColor = '#3b0764';
              }

              return (
                <g key={`node-group-${idx}`} className="transition-transform duration-300">
                  {/* Outer Pulsing Aura Ring */}
                  <circle cx={x} cy={y} r="26" stroke={nodeColor} strokeWidth="1.5" strokeOpacity="0.4" fill="none" className="animate-pulse" />
                  
                  {/* Node Base Circle */}
                  <circle cx={x} cy={y} r="20" fill={bgColor} stroke={nodeColor} strokeWidth="2.5" filter="url(#photonGlow)" />

                  {/* Inner Node Core */}
                  <circle cx={x} cy={y} r="8" fill={nodeColor} />

                  {/* Node Label Text */}
                  <text x={x} y={y + 38} textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                    {label}
                  </text>

                  {/* Node Badge ID */}
                  <rect x={x - 28} y={y + 44} width="56" height="15" rx="4" fill="#0f172a" stroke="#1e293b" />
                  <text x={x} y={y + 55} textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                    {nodeType}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Route Hop Chain Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-sans">Active Hop Chain:</span>
            <span className="text-cyan-300 font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {hops.map((h) => formatNodeLabel(h)).join('  ➔  ')}
            </span>
          </div>
          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
            ✓ Photonic Transmission Loss: {activeRoute.cost} dB
          </span>
        </div>
      </div>
    </div>
  );
};
