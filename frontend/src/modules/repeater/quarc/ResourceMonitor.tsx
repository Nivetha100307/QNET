import React from 'react';
import { Database } from 'lucide-react';

interface ResourceMonitorProps {
  metrics?: {
    overall_health: number;
    network_efficiency: number;
    route_confidence: number;
    average_fidelity: number;
    average_memory_ms: number;
    congestion_index: number;
    active_clusters_count: number;
    total_links_monitored: number;
  };
  clusterPathStr?: string;
}

export const ResourceMonitor: React.FC<ResourceMonitorProps> = ({
  metrics,
  clusterPathStr = 'Cluster A ➔ Cluster B ➔ Cluster C'
}) => {
  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-slate-300 font-sans flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          Cluster Pipeline &amp; Performance Telemetry
        </span>
        <span className="text-xs text-cyan-300 font-bold">
          Pipeline: {clusterPathStr}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-slate-500 text-[10px] block font-sans font-bold">AVERAGE FIDELITY</span>
          <span className="text-emerald-400 text-base font-extrabold">{metrics?.average_fidelity || 98.8}%</span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-slate-500 text-[10px] block font-sans font-bold">ROUTE CONFIDENCE</span>
          <span className="text-cyan-300 text-base font-extrabold">{metrics?.route_confidence || 96.0}%</span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-slate-500 text-[10px] block font-sans font-bold">MEMORY EFFICIENCY</span>
          <span className="text-purple-300 text-base font-extrabold">91.0%</span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center">
          <span className="text-slate-500 text-[10px] block font-sans font-bold">CLUSTER STABILITY</span>
          <span className="text-amber-300 text-base font-extrabold">97.0%</span>
        </div>
      </div>
    </div>
  );
};
