import React from 'react';
import { CheckCircle2, Clock, Activity, Layers } from 'lucide-react';
import { QuarcCluster } from '../../../services/repeaterApi';

interface QuarcExecutionPipelineProps {
  currentStageIdx: number;
  clusters: QuarcCluster[];
  onSelectCluster: (cluster: QuarcCluster) => void;
  selectedClusterId?: string;
}

export const QuarcExecutionPipeline: React.FC<QuarcExecutionPipelineProps> = ({
  currentStageIdx,
  clusters,
  onSelectCluster,
  selectedClusterId
}) => {
  const pipelineStages = [
    { id: 1, name: '1. Network Scan', desc: 'Live telemetry collection', status: currentStageIdx > 1 ? 'Done' : currentStageIdx === 1 ? 'In Progress' : 'Pending' },
    { id: 2, name: '2. Link Analysis', desc: 'Fidelity & QBER evaluation', status: currentStageIdx > 2 ? 'Done' : currentStageIdx === 2 ? 'In Progress' : 'Pending' },
    { id: 3, name: '3. Cluster Formation', desc: 'Community detection', status: currentStageIdx > 3 ? 'Done' : currentStageIdx === 3 ? 'In Progress' : 'Pending' },
    { id: 4, name: '4. Route Optimization', desc: 'Inter-cluster routing', status: currentStageIdx > 4 ? 'Done' : currentStageIdx === 4 ? 'In Progress' : 'Pending' },
    { id: 5, name: '5. Resource Scheduling', desc: 'Bell pairs & memory', status: currentStageIdx > 5 ? 'Done' : currentStageIdx === 5 ? 'In Progress' : 'Pending' },
    { id: 6, name: '6. Transmission', desc: 'Photon propagation', status: currentStageIdx >= 6 ? 'Done' : currentStageIdx === 6 ? 'In Progress' : 'Pending' },
  ];

  const clusterColors: Record<string, string> = {
    'Cluster-A': 'border-blue-500/50 bg-blue-950/30 text-blue-400',
    'Cluster-B': 'border-purple-500/50 bg-purple-950/30 text-purple-400',
    'Cluster-C': 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400',
    'Cluster-D': 'border-amber-500/50 bg-amber-950/30 text-amber-400',
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* SECTION 1: QuARC Execution Pipeline Card */}
      <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            QUARC EXECUTION PIPELINE
          </span>
        </div>

        <div className="space-y-2">
          {pipelineStages.map((stage) => {
            const isDone = stage.status === 'Done';
            const isInProgress = stage.status === 'In Progress';
            return (
              <div
                key={stage.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  isInProgress
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : isDone
                    ? 'bg-slate-900/80 border-emerald-500/40 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
                }`}
              >
                <div>
                  <div className="font-bold text-[11px]">{stage.name}</div>
                  <div className="text-[9px] text-slate-400">{stage.desc}</div>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-extrabold flex items-center gap-1 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isInProgress
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : null}
                  {stage.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Cluster Health Overview List */}
      <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            CLUSTER HEALTH OVERVIEW
          </span>
        </div>

        <div className="space-y-2">
          {clusters.map((c) => {
            const isSelected = selectedClusterId === c.id;
            const colorClass = clusterColors[c.id] || 'border-cyan-500/50 bg-cyan-950/30 text-cyan-400';
            return (
              <button
                key={c.id}
                onClick={() => onSelectCluster(c)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected ? `${colorClass} ring-2 ring-cyan-500 shadow-lg scale-[1.02]` : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${c.health >= 90 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="font-bold text-[11px] text-slate-200">{c.name.split(' ')[0]} {c.id}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">{c.nodes.length} Nodes</span>
                  <span className="font-extrabold text-[11px] text-emerald-400">{c.health}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
