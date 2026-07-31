import React from 'react';

interface RouteConfidenceGaugeProps {
  score: number;
}

export const RouteConfidenceGauge: React.FC<RouteConfidenceGaugeProps> = ({ score }) => {
  const radius = 32;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-cyan-500/40">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#06b6d4"
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
        <span className="absolute text-[11px] font-black text-cyan-300 font-mono">
          {score.toFixed(0)}%
        </span>
      </div>
      <div>
        <span className="text-[10px] text-slate-400 font-mono block uppercase">Quantum Route</span>
        <span className="text-xs font-bold text-slate-200 font-sans">Confidence Gauge</span>
      </div>
    </div>
  );
};
