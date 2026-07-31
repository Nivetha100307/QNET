import React from 'react';

export interface TimelineLogItem {
  time: string;
  text: string;
  done: boolean;
}

interface TimelineProps {
  logs: TimelineLogItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ logs }) => {
  return (
    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs">
      <span className="text-xs font-bold text-slate-400 font-sans block mb-2">Live QuARC Event Log Timeline:</span>
      <div className="max-h-32 overflow-y-auto space-y-1.5 pr-2">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-slate-400">{log.time}</span>
            <span className="text-slate-200 font-bold">{log.text}</span>
            <span className="text-emerald-400 font-bold">✔</span>
          </div>
        ))}
      </div>
    </div>
  );
};
