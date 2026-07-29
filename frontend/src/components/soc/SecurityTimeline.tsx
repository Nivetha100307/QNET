import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';

export interface TimelineEventItem {
  timestamp: string;
  stageName: string;
  status: 'PASSED' | 'FAILED' | 'INFO';
}

interface SecurityTimelineProps {
  events: TimelineEventItem[];
}

export const SecurityTimeline: React.FC<SecurityTimelineProps> = ({ events }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <Clock className="w-4 h-4 text-cyan-400" />
        <span className="text-slate-200 font-bold font-sans">Security Execution Milestone Timeline</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-none">
        {events.map((ev, idx) => (
          <React.Fragment key={idx}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
              <span className="text-[10px] text-slate-500">{ev.timestamp}</span>
              <span className="text-slate-200 font-bold">{ev.stageName}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            {idx < events.length - 1 && (
              <span className="text-slate-700 font-mono">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
