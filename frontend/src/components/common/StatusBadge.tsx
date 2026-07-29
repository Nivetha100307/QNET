import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (['READY', 'ACTIVE', 'CONNECTED', 'SECURE', 'PASS', 'HEALTHY', 'ALLOW', 'ONLINE'].includes(normalized)) {
    colorClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (['WARNING', 'DEGRADED', 'MEDIUM', 'RETRY'].includes(normalized)) {
    colorClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (['TERMINATED', 'DISCONNECTED', 'COMPROMISED', 'FAIL', 'BLOCK', 'HIGH', 'CRITICAL'].includes(normalized)) {
    colorClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-bold font-mono tracking-wide ${colorClasses}`}>
      {status}
    </span>
  );
};
