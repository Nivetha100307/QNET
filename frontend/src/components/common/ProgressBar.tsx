import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  colorClass?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  colorClass = 'bg-cyan-400',
  className = ''
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80 ${className}`}>
      <div
        className={`h-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
