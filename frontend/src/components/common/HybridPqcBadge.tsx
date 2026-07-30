import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Zap, RefreshCw, Layers } from 'lucide-react';
import { fetchHybridStatus, HybridStatusResponse } from '../../services/pqcApi';

export const HybridPqcBadge: React.FC = () => {
  const [status, setStatus] = useState<HybridStatusResponse | null>(null);

  const loadStatus = async () => {
    try {
      const data = await fetchHybridStatus();
      if (data) setStatus(data);
    } catch (err) {
      // Silent catch
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!status) return null;

  const mode = status.communication_mode;

  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  let badgeLabel = '🟢 QUANTUM (E91 / GHZ)';
  let icon = <Shield className="w-3.5 h-3.5 text-emerald-400" />;

  if (mode === 'HYBRID') {
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
    badgeLabel = '🟡 HYBRID (BUFFERING)';
    icon = <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />;
  } else if (mode === 'PQC_ONLY') {
    badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    badgeLabel = '🔵 PQC SECURE (ML-KEM + ML-DSA)';
    icon = <Zap className="w-3.5 h-3.5 text-blue-400" />;
  } else if (mode === 'RECOVERING') {
    badgeColor = 'bg-orange-500/20 text-orange-300 border-orange-500/40 animate-pulse';
    badgeLabel = '🟠 RECOVERING (PROBING E91)';
    icon = <Layers className="w-3.5 h-3.5 text-orange-400" />;
  } else if (mode === 'FAILED') {
    badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    badgeLabel = '🔴 SYSTEM FAILED';
    icon = <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border backdrop-blur-md flex items-center gap-2 ${badgeColor}`}>
        {icon}
        <span>{badgeLabel}</span>
      </div>
      {status.metrics.recovery_counter > 0 && (
        <span className="hidden lg:inline-block text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
          Recoveries: <strong className="text-cyan-300">{status.metrics.recovery_counter}</strong> ({status.metrics.last_recovery_duration_ms}ms)
        </span>
      )}
    </div>
  );
};
