import React, { useEffect, useState } from 'react';

interface TrustGaugeProps {
  score: number; // 0 to 100
  size?: number;
}

export const TrustGauge: React.FC<TrustGaugeProps> = ({ score, size = 120 }) => {
  const [displayScore, setDisplayScore] = useState<number>(100);

  useEffect(() => {
    // Smooth step-by-step trust degradation/recovery animation
    const interval = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev === score) {
          clearInterval(interval);
          return score;
        }
        const delta = prev < score ? 1 : -1;
        return prev + delta;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [score]);

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  let colorClass = 'stroke-emerald-400';
  let textClass = 'text-emerald-400';

  if (displayScore < 50) {
    colorClass = 'stroke-rose-500';
    textClass = 'text-rose-500';
  } else if (displayScore < 80) {
    colorClass = 'stroke-amber-400';
    textClass = 'text-amber-400';
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-900"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-300 ${colorClass}`}
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-2xl font-extrabold font-mono ${textClass}`}>
          {displayScore.toFixed(0)}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">
          Trust Score
        </span>
      </div>
    </div>
  );
};
