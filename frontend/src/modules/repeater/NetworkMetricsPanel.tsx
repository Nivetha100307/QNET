import React from 'react';
import { Activity, Zap, RefreshCw, Layers } from 'lucide-react';
import { RepeaterMetricsResponse } from '../../services/repeaterApi';

interface NetworkMetricsPanelProps {
  metrics: RepeaterMetricsResponse | null;
}

export const NetworkMetricsPanel: React.FC<NetworkMetricsPanelProps> = ({ metrics }) => {
  if (!metrics) return null;

  const items = [
    { label: 'Entanglement Distance', value: `${metrics.total_distance_km} km`, color: 'text-cyan-300' },
    { label: 'Bell Pairs Generated', value: metrics.bell_pairs_generated, color: 'text-cyan-400' },
    { label: 'Swaps Completed', value: metrics.swaps_completed, color: 'text-purple-400' },
    { label: 'Bell Measurements', value: metrics.bell_measurements, color: 'text-indigo-400' },
    { label: 'Average Fidelity', value: `${(metrics.average_fidelity * 100).toFixed(1)}%`, color: 'text-emerald-400' },
    { label: 'Swap Success Rate', value: `${(metrics.swap_success_rate * 100).toFixed(1)}%`, color: 'text-emerald-300' },
    { label: 'Hop Count', value: metrics.hop_count, color: 'text-amber-300' },
    { label: 'Network Latency', value: `${metrics.network_latency_ms} ms`, color: 'text-purple-300' },
    { label: 'Memory Efficiency', value: `${metrics.memory_usage_pct.toFixed(0)}%`, color: 'text-cyan-300' },
    { label: 'Route Cost', value: `${metrics.route_cost} dB`, color: 'text-slate-300' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Extended Network Statistics & Telemetry
          </h3>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
          Telemetry Monitoring
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
        {items.map((item, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase truncate">{item.label}</span>
            <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
