import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity, Wifi, CheckCircle2 } from 'lucide-react';

interface ThreatPanelProps {
  replayAttempts?: number;
  tamperCount?: number;
  spoofCount?: number;
  ackStatus?: string;
  queueDepth?: number;
  threatSeverity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const ThreatPanel: React.FC<ThreatPanelProps> = ({
  replayAttempts = 0,
  tamperCount = 0,
  spoofCount = 0,
  ackStatus = 'CONFIRMED',
  queueDepth = 0,
  threatSeverity = 'LOW'
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100 font-sans">
            Real-Time Threat & Transport Monitor
          </h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
          threatSeverity === 'LOW' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
        }`}>
          SEVERITY: {threatSeverity}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">REPLAY ATTEMPTS</span>
          <span className="text-emerald-400 font-bold">{replayAttempts} (Blocked)</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">TAMPER DETECTS</span>
          <span className="text-emerald-400 font-bold">{tamperCount} (Zero Bit Flips)</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">SPOOF ATTEMPTS</span>
          <span className="text-emerald-400 font-bold">{spoofCount} (Whitelisted)</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">ACK STATUS</span>
          <span className="text-cyan-300 font-bold">{ackStatus}</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">QUEUE DEPTH</span>
          <span className="text-purple-300 font-bold">{queueDepth} Packets</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">RETRY COUNTER</span>
          <span className="text-emerald-400 font-bold">0 / 3 Retries</span>
        </div>
      </div>
    </div>
  );
};
