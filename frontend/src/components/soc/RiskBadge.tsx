import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, ShieldX } from 'lucide-react';

interface RiskBadgeProps {
  level: string; // "LOW", "MEDIUM", "HIGH", "CRITICAL"
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const normalized = level.toUpperCase();

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = ShieldCheck;

  if (normalized === 'LOW') {
    colorClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    Icon = ShieldCheck;
  } else if (normalized === 'MEDIUM') {
    colorClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    Icon = AlertTriangle;
  } else if (normalized === 'HIGH') {
    colorClasses = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    Icon = ShieldAlert;
  } else if (normalized === 'CRITICAL') {
    colorClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    Icon = ShieldX;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold font-mono tracking-wider ${colorClasses}`}>
      <Icon className="w-3.5 h-3.5" />
      RISK: {normalized}
    </span>
  );
};
