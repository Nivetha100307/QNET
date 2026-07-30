import React from 'react';
import { Clock, CheckCircle2, Zap } from 'lucide-react';

export interface TimelineEvent {
  timestamp: string;
  title: string;
  detail: string;
  status: 'SUCCESS' | 'INFO' | 'WARNING';
}

interface EventTimelineProps {
  events: TimelineEvent[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Event Timeline & Audit Log
          </h3>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20">
          Sequential Telemetry
        </span>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-60 overflow-y-auto space-y-3 font-mono text-xs">
        {events.map((ev, idx) => (
          <div key={idx} className="flex items-start gap-3 border-b border-slate-900 pb-2.5 last:border-0 last:pb-0">
            <span className="text-cyan-400 font-bold shrink-0 text-[11px]">{ev.timestamp}</span>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-200">{ev.title}</span>
              </div>
              <p className="text-[11px] text-slate-400">{ev.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
