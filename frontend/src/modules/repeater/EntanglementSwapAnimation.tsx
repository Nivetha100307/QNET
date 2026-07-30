import React from 'react';
import { Play, RotateCcw, Zap, Sliders, ShieldAlert, Gauge } from 'lucide-react';

interface EntanglementSwapAnimationProps {
  onRunSequence: () => void;
  onStepSwap: () => void;
  onReset: () => void;
  onReplay: () => void;
  isRunning: boolean;
  noiseEnabled: boolean;
  onToggleNoise: (enabled: boolean) => void;
  distanceKm: number;
  onChangeDistance: (dist: number) => void;
  speedMultiplier: number;
  onChangeSpeed: (speed: number) => void;
  currentStage: string;
}

export const EntanglementSwapAnimation: React.FC<EntanglementSwapAnimationProps> = ({
  onRunSequence,
  onStepSwap,
  onReset,
  onReplay,
  isRunning,
  noiseEnabled,
  onToggleNoise,
  distanceKm,
  onChangeDistance,
  speedMultiplier,
  onChangeSpeed,
  currentStage
}) => {
  const distances = [40, 80, 120, 200];
  const speeds = [0.5, 1, 2, 5];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" /> Simulation Configuration & Execution Controls
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure network distance, noise toggle, simulation speed, and run step-by-step BSM sequence.
          </p>
        </div>

        {/* Action Button Row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRunSequence}
            disabled={isRunning}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            {isRunning ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            Run Full Sequence
          </button>

          <button
            onClick={onStepSwap}
            disabled={isRunning}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            Step BSM Swap
          </button>

          <button
            onClick={onReplay}
            disabled={isRunning}
            className="px-3.5 py-2 bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 text-xs font-bold rounded-xl border border-purple-500/40 transition flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Replay
          </button>

          <button
            onClick={onReset}
            disabled={isRunning}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono rounded-xl border border-slate-800"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Control Tweaks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1 font-mono text-xs">
        {/* Fiber Distance Selector */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-slate-400 text-[10px] uppercase block">Configurable Fiber Distance:</span>
          <div className="flex gap-1.5">
            {distances.map((d) => (
              <button
                key={d}
                onClick={() => onChangeDistance(d)}
                className={`flex-1 py-1 rounded text-[11px] font-bold border transition ${
                  distanceKm === d
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {d} km
              </button>
            ))}
          </div>
        </div>

        {/* Fiber Noise Injection Toggle */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-slate-400 text-[10px] uppercase block">Fiber Noise & Interference:</span>
          <button
            onClick={() => onToggleNoise(!noiseEnabled)}
            className={`w-full py-1.5 rounded text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
              noiseEnabled
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            {noiseEnabled ? 'Fiber Noise: ON (0.25 dB/km)' : 'Ideal Channel: ON (0.20 dB/km)'}
          </button>
        </div>

        {/* Simulation Speed Controls */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <span className="text-slate-400 text-[10px] uppercase block">Simulation Speed:</span>
          <div className="flex gap-1.5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`flex-1 py-1 rounded text-[11px] font-bold border transition ${
                  speedMultiplier === s
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
