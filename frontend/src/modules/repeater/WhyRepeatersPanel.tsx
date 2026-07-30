import React from 'react';
import { HelpCircle, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';

interface WhyRepeatersPanelProps {
  distanceKm: number;
  noiseEnabled?: boolean;
}

export const WhyRepeatersPanel: React.FC<WhyRepeatersPanelProps> = ({ distanceKm, noiseEnabled = false }) => {
  // Real-time quantum physics formulas
  const alpha_dB = noiseEnabled ? 0.25 : 0.20;
  const totalLoss_dB = (distanceKm * alpha_dB).toFixed(1);

  // Direct fiber link decoherence: F_direct = 0.98 * e^(-alpha_dec * d)
  const alpha_dec = noiseEnabled ? 0.012 : 0.0075;
  const directFidelityPct = (Math.max(0.15, 0.98 * Math.exp(-alpha_dec * distanceKm)) * 100).toFixed(1);
  const directQberPct = Math.min(48.0, Math.max(2.5, (100 - parseFloat(directFidelityPct)) * 0.85)).toFixed(1);

  // Multi-hop repeater link (3 repeaters = 4 hops)
  const hopDist = distanceKm / 4;
  const alpha_hop = noiseEnabled ? 0.0025 : 0.0012;
  const hopFid = 0.98 * Math.exp(-alpha_hop * hopDist);
  const swapPenalty = noiseEnabled ? 0.965 : 0.985;
  const repeaterFidelityPct = (Math.min(0.98, Math.max(0.70, hopFid * Math.pow(swapPenalty, 3))) * 100).toFixed(1);
  const repeaterQberPct = Math.max(1.8, (100 - parseFloat(repeaterFidelityPct)) * 0.55).toFixed(1);

  const isDirectSuccess = parseFloat(directQberPct) < 11.0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Why Quantum Repeaters Are Essential ({distanceKm} km Real-Time Physics Calculation)
          </h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Decoherence Physics Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct Link Box */}
        <div className={`p-4 rounded-xl border space-y-3 ${
          isDirectSuccess
            ? 'bg-amber-950/20 border-amber-500/30'
            : 'bg-rose-950/20 border-rose-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isDirectSuccess ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {isDirectSuccess ? '⚠️ Direct Fiber Link (Unstable)' : '❌ Direct Fiber Link (No Repeaters)'}
            </span>
            <AlertTriangle className={`w-4 h-4 ${isDirectSuccess ? 'text-amber-400' : 'text-rose-400'}`} />
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Distance & Loss:</span> <span className="text-slate-200">{distanceKm} km ({totalLoss_dB} dB attenuation)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Photon Losses:</span> <span className="text-rose-400 font-bold">Exponential ({alpha_dB} dB/km)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>State Fidelity:</span> <span className="text-rose-400 font-bold">{directFidelityPct}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>QBER Error Rate:</span> <span className="text-rose-400 font-bold">{directQberPct}% ({isDirectSuccess ? '< 11%' : '> 11% threshold'})</span>
            </div>
          </div>

          <div className={`p-2.5 rounded-lg border text-[11px] flex items-center gap-2 ${
            isDirectSuccess
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
          }`}>
            <span className={`w-2 h-2 rounded-full shrink-0 ${isDirectSuccess ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`} />
            <span>
              {isDirectSuccess
                ? <strong>WARNING: High QBER degradation over distance. Key rate severely throttled.</strong>
                : <strong>FAILED: Quantum state decoheres before reaching Substation. E91 QKD impossible.</strong>}
            </span>
          </div>
        </div>

        {/* Repeater Mesh Box */}
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              ✓ Multi-Hop Quantum Repeater Mesh
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Distance & Hops:</span> <span className="text-slate-200">{distanceKm} km / 3 Repeaters ({hopDist.toFixed(0)} km/hop)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>BSM Swapping:</span> <span className="text-emerald-400 font-bold">BSM Entanglement Extension</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>State Fidelity:</span> <span className="text-emerald-400 font-bold">{repeaterFidelityPct}%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>QBER Error Rate:</span> <span className="text-emerald-400 font-bold">{repeaterQberPct}% (&lt; 11% threshold)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span><strong>SUCCESSFUL:</strong> Entanglement extended across substations. Ready for 256-bit key generation.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
