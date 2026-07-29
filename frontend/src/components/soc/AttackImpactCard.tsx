import React from 'react';
import { AlertTriangle, ShieldX, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

interface AttackImpactCardProps {
  attackType: string;
  detected: boolean;
  trustScoreImpact: number;
  mitigationAction: string;
  details: string;
}

export const AttackImpactCard: React.FC<AttackImpactCardProps> = ({
  attackType,
  detected,
  trustScoreImpact,
  mitigationAction,
  details
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100 font-sans">Attack Impact & Mitigation Breakdown</h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
          detected ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
        }`}>
          DETECTED = {detected ? 'TRUE' : 'FALSE'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">ATTACK VECTOR</span>
          <span className="text-amber-300 font-bold">{attackType}</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">TRUST PENALTY</span>
          <span className="text-rose-400 font-bold">{trustScoreImpact} Points</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">RISK ESCALATION</span>
          <span className="text-orange-400 font-bold">LOW → HIGH</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">MITIGATION</span>
          <span className="text-cyan-300 font-bold truncate block" title={mitigationAction}>{mitigationAction}</span>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300">
        <span className="text-slate-500 block text-[10px] mb-1 font-sans">ADVERSARIAL DIAGNOSTICS:</span>
        <p className="text-xs text-slate-200">{details}</p>
      </div>
    </div>
  );
};
