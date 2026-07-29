import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  status?: 'healthy' | 'warning' | 'critical' | 'info';
  icon?: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  status = 'healthy',
  icon: Icon,
  trend,
  trendUp
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
      case 'warning': return 'border-amber-500/30 text-amber-400 bg-amber-500/10';
      case 'critical': return 'border-rose-500/30 text-rose-400 bg-rose-500/10';
      case 'info': return 'border-teal-500/30 text-teal-400 bg-teal-500/10';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md hover:border-slate-700 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl border ${getStatusColor()}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline space-x-1.5">
        <span className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
          {value}
        </span>
        {unit && <span className="text-xs font-mono text-slate-400">{unit}</span>}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {trend && (
            <span className={`font-mono font-medium ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
