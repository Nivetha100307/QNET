import React from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, RefreshCw, ChevronDown, Zap, FastForward } from 'lucide-react';

interface SimulationControlsProps {
  selectedDestination: string;
  onDestinationChange: (dest: string) => void;
  currentStep: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onInjectFailure: () => void;
  onRecluster: () => void;
  speedMultiplier: number;
  onSpeedChange: (speed: number) => void;
  loading?: boolean;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  selectedDestination,
  onDestinationChange,
  currentStep,
  isPlaying,
  onTogglePlay,
  onReset,
  onInjectFailure,
  onRecluster,
  speedMultiplier,
  onSpeedChange,
  loading = false
}) => {
  const substations = [
    { id: 'Substation_A', label: 'Substation A (Primary Industrial Load)' },
    { id: 'Substation_B', label: 'Substation B (Regional Feeder Hub)' },
    { id: 'Substation_C', label: 'Substation C (High-Voltage Substation)' },
    { id: 'Substation_D', label: 'Substation D (Distribution Relay)' },
    { id: 'Substation_E', label: 'Substation E (Emergency Solar Grid)' },
  ];

  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Destination Substation Selector */}
        <div className="flex items-center gap-3">
          <label className="text-slate-300 font-sans font-bold text-xs shrink-0 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Target Substation Destination:
          </label>
          <div className="relative">
            <select
              value={selectedDestination}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="bg-slate-900 text-cyan-300 font-bold border-2 border-cyan-500/50 rounded-xl px-3 py-2 pr-8 text-xs font-mono appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer shadow-lg"
            >
              {substations.map((sub) => (
                <option key={sub.id} value={sub.id} className="bg-slate-900 text-slate-200">
                  {sub.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Speed Controller & Replay Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-slate-400 font-sans font-bold">Speed:</span>
          {[1, 2, 5, 10].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                speedMultiplier === s
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}

          <button
            onClick={onTogglePlay}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={onReset}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Replay</span>
          </button>
        </div>
      </div>

      {/* Action Triggers: Failure Injection & Recluster */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={onInjectFailure}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-200" />
            <span>Inject Link / Repeater Failure</span>
          </button>

          <button
            onClick={onRecluster}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-200 ${loading ? 'animate-spin' : ''}`} />
            <span>Auto-Recluster Mesh</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-sans">
          Selecting a new substation re-executes dynamic clustering &amp; quantum route scheduling in real-time.
        </span>
      </div>
    </div>
  );
};
