import React from 'react';
import { Network, RefreshCw, Pause, Play, ChevronDown, Activity } from 'lucide-react';

interface QuarcControlCenterHeaderProps {
  activeDestination: string;
  onDestinationChange: (dest: string) => void;
  activeRouteStr: string;
  activeNodePathStr: string;
  routeScore: number;
  expectedSwapSuccess: number;
  networkHealth: number;
  totalNodes: number;
  activeLinks: number;
  bellPairs: number;
  activeSwaps: number;
  autoRefreshSec: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onRecluster: () => void;
  reclusterLoading?: boolean;
}

export const QuarcControlCenterHeader: React.FC<QuarcControlCenterHeaderProps> = ({
  activeDestination,
  onDestinationChange,
  activeRouteStr,
  activeNodePathStr,
  routeScore,
  expectedSwapSuccess,
  networkHealth,
  totalNodes,
  activeLinks,
  bellPairs,
  activeSwaps,
  autoRefreshSec,
  isPaused,
  onTogglePause,
  onRecluster,
  reclusterLoading = false
}) => {
  const substations = [
    { id: 'Substation_A', label: 'Substation A' },
    { id: 'Substation_B', label: 'Substation B' },
    { id: 'Substation_C', label: 'Substation C' },
    { id: 'Substation_D', label: 'Substation D' },
    { id: 'Substation_E', label: 'Substation E' },
  ];

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-4 font-mono shadow-2xl">
      {/* Top Banner Title & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Network className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-100 uppercase tracking-wide font-sans">
                QUANTUM ADAPTIVE ROUTING &amp; CLUSTERING ENGINE (QuARC)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/40">
                QuARC v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Dynamic Cluster-Based Routing + Entanglement Resource Scheduling Visualization
            </p>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Auto Refresh 1s</span>
          </div>

          <button
            onClick={onTogglePause}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={onRecluster}
            disabled={reclusterLoading}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-lg shadow-lg transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reclusterLoading ? 'animate-spin' : ''}`} />
            <span>Recluster Now</span>
          </button>
        </div>
      </div>

      {/* Row 2: Active Destination, Active Route, and Sparkline Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center text-xs">
        {/* Active Destination Dropdown */}
        <div className="lg:col-span-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider block">
            ACTIVE DESTINATION
          </span>
          <div className="relative">
            <select
              value={activeDestination}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="w-full bg-slate-950 text-cyan-300 font-bold border border-cyan-500/50 rounded-lg px-2.5 py-1.5 text-xs font-mono appearance-none focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              {substations.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Active Route & Node Path */}
        <div className="lg:col-span-3 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 font-sans font-bold uppercase tracking-wider block">
            ACTIVE ROUTE
          </span>
          <div className="text-cyan-300 font-extrabold truncate text-xs">
            {activeRouteStr}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {activeNodePathStr}
          </div>
        </div>

        {/* Sparkline Metrics Items */}
        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 font-sans block font-bold">ROUTE SCORE</span>
            <span className="text-cyan-300 font-extrabold text-sm">{routeScore.toFixed(2)}%</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 font-sans block font-bold">EXPECTED SWAP SUCCESS</span>
            <span className="text-purple-300 font-extrabold text-sm">{expectedSwapSuccess.toFixed(2)}%</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 font-sans block font-bold">NETWORK HEALTH</span>
            <span className="text-emerald-400 font-extrabold text-sm">{networkHealth.toFixed(1)}%</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 font-sans block font-bold">TOTAL NODES</span>
            <span className="text-slate-100 font-extrabold text-sm">{totalNodes}</span>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-400 font-sans block font-bold">BELL PAIRS</span>
            <span className="text-amber-300 font-extrabold text-sm">{bellPairs}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
