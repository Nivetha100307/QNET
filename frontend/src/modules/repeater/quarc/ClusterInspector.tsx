import React from 'react';
import { QuarcCluster } from '../../../services/repeaterApi';
import { Layers, ArrowRight, X } from 'lucide-react';

interface ClusterInspectorProps {
  cluster: QuarcCluster | null;
  onClose: () => void;
}

export const ClusterInspector: React.FC<ClusterInspectorProps> = ({ cluster, onClose }) => {
  if (!cluster) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-xs relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-100 font-sans">{cluster.name}</h4>
            <p className="text-[11px] text-cyan-400">Cluster ID: {cluster.id} | Leader: {cluster.leader}</p>
          </div>
        </div>

        <div className="space-y-3 text-slate-300">
          <span className="text-[11px] font-sans font-bold text-slate-400 block">Internal Repeater Hop Chain:</span>
          <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px]">
            {cluster.nodes.map((node, i) => (
              <React.Fragment key={node}>
                <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded font-bold">
                  {node.replace('Repeater_', '').replace('_', ' ')}
                </span>
                {i < cluster.nodes.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-600" />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">MEMORY LIFETIME</span>
              <span className="text-purple-300 font-bold text-sm">{cluster.avg_memory_ms} ms</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">BELL PAIR INVENTORY</span>
              <span className="text-emerald-400 font-bold text-sm">154 Pairs</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">SWAP SUCCESS</span>
              <span className="text-amber-300 font-bold text-sm">{(cluster.avg_swap_success * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block">QUEUE LENGTH</span>
              <span className="text-cyan-300 font-bold text-sm">3 Requests</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
        >
          Close Inspection
        </button>
      </div>
    </div>
  );
};
