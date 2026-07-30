import React from 'react';
import { Cpu, RefreshCw, Zap } from 'lucide-react';
import { RepeaterMemoryItem } from '../../services/repeaterApi';

interface QuantumMemoryCardProps {
  memories: RepeaterMemoryItem[];
}

export const QuantumMemoryCard: React.FC<QuantumMemoryCardProps> = ({ memories }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Quantum Memory Storage
          </h3>
        </div>
        <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
          Trapped-Ion & Spin Memory
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {memories.map((m) => {
          const slots = Array.from({ length: m.max_capacity || 8 });
          return (
            <div key={m.repeater_id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100 font-mono">{m.repeater_id}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {m.status}
                </span>
              </div>

              {/* Lifetime Decay Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Coherence Lifetime:</span>
                  <span className="text-purple-300 font-bold">{m.lifetime_remaining_pct}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-500"
                    style={{ width: `${m.lifetime_remaining_pct}%` }}
                  />
                </div>
              </div>

              {/* Slots Inventory */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Stored Bell Pairs:</span>
                  <span className="text-cyan-300 font-bold">{m.stored_pairs} / {m.max_capacity}</span>
                </div>
                <div className="flex gap-1">
                  {slots.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2.5 flex-1 rounded-sm ${
                        i < m.stored_pairs
                          ? 'bg-cyan-400 shadow-[0_0_5px_rgba(56,189,248,0.5)]'
                          : 'bg-slate-900 border border-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
