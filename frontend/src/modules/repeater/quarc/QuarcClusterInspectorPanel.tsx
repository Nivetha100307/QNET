import React from 'react';
import { QuarcCluster } from '../../../services/repeaterApi';
import { Layers, ArrowRight, Activity, Eye } from 'lucide-react';

interface QuarcClusterInspectorPanelProps {
  cluster: QuarcCluster;
  onOpenDetailsModal: () => void;
}

export const QuarcClusterInspectorPanel: React.FC<QuarcClusterInspectorPanelProps> = ({
  cluster,
  onOpenDetailsModal
}) => {
  const healthPct = cluster.health || 96.2;
  const radius = 28;
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (healthPct / 100) * circumference;

  return (
    <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-4 font-mono text-xs shadow-xl h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          CLUSTER INSPECTOR
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold border border-purple-500/40">
          ● {cluster.id}
        </span>
      </div>

      <div className="space-y-3">
        {/* Health Score Circular Gauge */}
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block">Health Score</span>
            <span className="text-lg font-black text-emerald-400">{healthPct}%</span>
          </div>

          <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
              <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
              <circle
                stroke="#22c55e"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        </div>

        {/* Nodes list */}
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Nodes ({cluster.nodes.length}):</span>
          <span className="font-extrabold text-cyan-300 truncate max-w-[140px]">{cluster.nodes.join(', ')}</span>
        </div>

        {/* Avg Fidelity & Avg QBER */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 block">Avg. Fidelity</span>
            <span className="text-emerald-400 font-extrabold text-xs">{cluster.avg_fidelity}%</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 block">Avg. QBER</span>
            <span className="text-amber-300 font-extrabold text-xs">{cluster.avg_qber}%</span>
          </div>
        </div>

        {/* Memory Utilization Progress Bar */}
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-sans">Memory Utilization</span>
            <span className="text-purple-300 font-bold">72%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div className="h-full bg-purple-500 rounded-full w-[72%]" />
          </div>
        </div>

        {/* Bell Pairs & Swap Success */}
        <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Bell Pairs Available</span>
            <span className="text-emerald-400 font-bold">128</span>
          </div>
          <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-500 block">Swap Success</span>
            <span className="text-amber-300 font-bold">{(cluster.avg_swap_success * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* INTERNAL ROUTE */}
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
          <span className="text-[10px] text-slate-400 font-sans font-bold block uppercase">INTERNAL ROUTE (Auto)</span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-300 overflow-x-auto py-1">
            {cluster.nodes.map((n, i) => (
              <React.Fragment key={n}>
                <span>{n.replace('Repeater_', '')}</span>
                {i < cluster.nodes.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onOpenDetailsModal}
        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/40 transition flex items-center justify-center gap-1.5 shadow-md mt-2"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>View Details</span>
      </button>
    </div>
  );
};
