import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

interface RepeaterFidelityItem {
  id: string;
  fidelity: number;
}

interface FidelityHeatMapProps {
  items: RepeaterFidelityItem[];
}

export const FidelityHeatMap: React.FC<FidelityHeatMapProps> = ({ items }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Fidelity Heat Map
          </h3>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          Real-Time Bar Gauge
        </span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {items.map((item) => {
          const pct = Math.round(item.fidelity * 100);
          const barColor =
            pct >= 94
              ? 'from-emerald-500 to-cyan-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : pct >= 90
              ? 'from-cyan-500 to-blue-500'
              : 'from-amber-500 to-rose-500';

          return (
            <div key={item.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-bold">{item.id}</span>
                <span className="text-emerald-400 font-extrabold text-sm">{pct}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className={`bg-gradient-to-r ${barColor} h-full transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
