import React from 'react';
import { Award, CheckCircle2, ShieldAlert, Clock, ShieldCheck } from 'lucide-react';

interface PipelineSummaryCardProps {
  attackType: string;
  packetId: string;
  trustScore: number;
  riskLevel: string;
  latencyMs: number;
  decision: 'ALLOW' | 'BLOCK';
}

export const PipelineSummaryCard: React.FC<PipelineSummaryCardProps> = ({
  attackType,
  packetId,
  trustScore,
  riskLevel,
  latencyMs,
  decision
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-5 shadow-2xl space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
            End-of-Pipeline Final Summary
          </h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wider border ${
          decision === 'ALLOW' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
        }`}>
          {decision === 'ALLOW' ? '🟢 ALLOW' : '🔴 BLOCK'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">ATTACK TYPE</span>
          <span className="text-slate-200 font-bold">{attackType}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">PACKET ID</span>
          <span className="text-cyan-300 font-bold">{packetId}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">EVALUATED TRUST</span>
          <span className="text-emerald-400 font-bold">{trustScore.toFixed(1)} / 100</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">RISK RATING</span>
          <span className="text-amber-400 font-bold">{riskLevel}</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">TOTAL LATENCY</span>
          <span className="text-purple-300 font-bold">{latencyMs} ms</span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">REPLAY CHECKS</span>
          <span className="text-emerald-400 font-bold">PASSED</span>
        </div>
      </div>
    </div>
  );
};
