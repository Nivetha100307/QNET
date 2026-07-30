import React from 'react';
import { Cpu, Server, Activity, ShieldCheck } from 'lucide-react';
import { RepeaterNodeInfo } from '../../services/repeaterApi';

interface RepeaterNodeProps {
  node: RepeaterNodeInfo;
  isControlOrSub?: boolean;
  type?: 'SOURCE' | 'REPEATER' | 'DESTINATION';
  onSelect?: () => void;
}

export const RepeaterNodeCard: React.FC<RepeaterNodeProps> = ({
  node,
  type = 'REPEATER',
  onSelect
}) => {
  const isSource = type === 'SOURCE';
  const isDest = type === 'DESTINATION';

  const borderColor = isSource
    ? 'border-cyan-500/50 bg-cyan-950/30'
    : isDest
    ? 'border-emerald-500/50 bg-emerald-950/30'
    : 'border-purple-500/40 bg-slate-900/90';

  const badgeBg = isSource
    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    : isDest
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : 'bg-purple-500/20 text-purple-300 border-purple-500/30';

  const slots = Array.from({ length: node.capacity || 8 });

  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-xl border ${borderColor} shadow-lg backdrop-blur-md space-y-2 cursor-pointer transition hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSource ? (
            <Server className="w-4 h-4 text-cyan-400" />
          ) : isDest ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <Cpu className="w-4 h-4 text-purple-400 animate-pulse" />
          )}
          <span className="text-xs font-bold text-slate-100 font-mono truncate max-w-[110px]">
            {node.id}
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${badgeBg}`}>
          {node.status}
        </span>
      </div>

      <div className="text-[11px] text-slate-400 font-mono flex justify-between">
        <span>Fidelity:</span>
        <span className="text-cyan-300 font-bold">{(node.memory_fidelity * 100).toFixed(1)}%</span>
      </div>

      <div className="text-[11px] text-slate-400 font-mono flex justify-between">
        <span>Latency:</span>
        <span className="text-slate-300">{node.latency_ms} ms</span>
      </div>

      {/* Bell Pair Slot Inventory */}
      <div className="space-y-1 pt-1 border-t border-slate-800">
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Memory Slots:</span>
          <span className="text-purple-300 font-bold">{node.stored_bell_pairs}/{node.capacity || 8}</span>
        </div>
        <div className="flex gap-1">
          {slots.map((_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-sm transition-all duration-300 ${
                i < node.stored_bell_pairs
                  ? 'bg-gradient-to-t from-purple-600 to-cyan-400 shadow-[0_0_5px_rgba(168,85,247,0.5)]'
                  : 'bg-slate-800 border border-slate-700/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
