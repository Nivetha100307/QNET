import React from 'react';
import { CheckCircle2, XCircle, Clock, Loader2, MinusCircle } from 'lucide-react';

export interface SCADALayerInfo {
  number: number;
  name: string;
  category: string;
  status: 'WAITING' | 'RUNNING' | 'PASSED' | 'FAILED';
  latencyMs?: number;
}

interface SCADALayerCardProps {
  layer: SCADALayerInfo;
  isCurrentActive?: boolean;
}

export const SCADALayerCard: React.FC<SCADALayerCardProps> = ({ layer, isCurrentActive }) => {
  const layerNumFormatted = layer.number < 10 ? `0${layer.number}` : `${layer.number}`;

  let borderClass = 'border-slate-800/80 bg-slate-950/60 text-slate-400';
  let badgeClass = 'bg-slate-900 text-slate-500 border-slate-800';
  let Icon = MinusCircle;

  if (layer.status === 'RUNNING' || isCurrentActive) {
    borderClass = 'border-cyan-500/80 bg-cyan-950/40 text-cyan-200 shadow-lg shadow-cyan-950/50 animate-pulse';
    badgeClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    Icon = Loader2;
  } else if (layer.status === 'PASSED') {
    borderClass = 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200';
    badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    Icon = CheckCircle2;
  } else if (layer.status === 'FAILED') {
    borderClass = 'border-rose-500/60 bg-rose-950/40 text-rose-200 shadow-lg shadow-rose-950/50';
    badgeClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    Icon = XCircle;
  }

  return (
    <div className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between h-22 ${borderClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
          LAYER {layerNumFormatted}
        </span>
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${badgeClass}`}>
          <Icon className={`w-3 h-3 ${layer.status === 'RUNNING' ? 'animate-spin' : ''}`} />
          {layer.status}
        </span>
      </div>

      <div className="space-y-0.5 mt-1">
        <div className="text-xs font-bold text-slate-100 truncate" title={layer.name}>
          {layer.name}
        </div>
        <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between">
          <span className="truncate">{layer.category}</span>
          {layer.latencyMs !== undefined && (
            <span className="text-cyan-400 font-bold flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {layer.latencyMs}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
