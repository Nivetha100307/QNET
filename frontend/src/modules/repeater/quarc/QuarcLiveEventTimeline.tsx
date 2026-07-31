import React from 'react';

export interface QuarcEventLog {
  time: string;
  text: string;
  type?: 'success' | 'info' | 'warn';
}

interface QuarcLiveEventTimelineProps {
  events: QuarcEventLog[];
}

export const QuarcLiveEventTimeline: React.FC<QuarcLiveEventTimelineProps> = ({ events }) => {
  const defaultEvents: QuarcEventLog[] = [
    { time: '09:31:24', text: 'Clusters re-evaluated (4 active)', type: 'success' },
    { time: '09:31:25', text: 'Best route: Cluster A ➔ Substation B', type: 'info' },
    { time: '09:31:26', text: 'Bell pair reserved on link R2 ➔ R4', type: 'info' },
    { time: '09:31:27', text: 'BSM operation started @ R6', type: 'warn' },
    { time: '09:31:28', text: 'Photon transmitted: Cluster B ➔ Substation B', type: 'success' },
  ];

  const logs = events.length > 0 ? events : defaultEvents;

  return (
    <div className="bg-slate-950/90 p-3.5 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <span className="text-xs font-bold text-slate-200 font-sans uppercase tracking-wider">
          LIVE EVENT TIMELINE
        </span>
      </div>

      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[10px] bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-slate-400 font-mono font-bold shrink-0">{log.time}</span>
            <span className="text-slate-200 truncate">{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
