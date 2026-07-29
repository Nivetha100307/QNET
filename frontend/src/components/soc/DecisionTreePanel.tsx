import React from 'react';
import { CheckCircle2, XCircle, ChevronRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { StageInfo } from './StageCard';

interface DecisionTreePanelProps {
  stages: StageInfo[];
  decision: 'ALLOW' | 'BLOCK' | 'PENDING';
  trustScore: number;
}

export const DecisionTreePanel: React.FC<DecisionTreePanelProps> = ({
  stages,
  decision,
  trustScore
}) => {
  const keyTreeMilestones = [
    { name: 'Identity Verification', stageNum: 1 },
    { name: 'HMAC Authentication', stageNum: 2 },
    { name: 'RBAC Authorization', stageNum: 3 },
    { name: 'Sequence Anti-Replay', stageNum: 7 },
    { name: 'Integrity Verification', stageNum: 11 },
    { name: 'Dynamic Trust Score', stageNum: 18 },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-slate-300 font-sans font-semibold">Zero-Trust Decision Rationale Tree</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          decision === 'ALLOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
        }`}>
          {decision}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 py-2">
        {keyTreeMilestones.map((m, idx) => {
          const stg = stages.find((s) => s.number === m.stageNum);
          const passed = stg?.status === 'PASSED';
          const failed = stg?.status === 'FAILED';

          return (
            <React.Fragment key={m.stageNum}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                passed
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  : failed
                  ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                {passed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {failed && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                <span>{m.name}</span>
              </div>
              {idx < keyTreeMilestones.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-700" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
        <span>Evaluated Score: <strong className="text-cyan-400">{trustScore.toFixed(1)}</strong></span>
        <span>Decision Action: <strong className={decision === 'ALLOW' ? 'text-emerald-400' : 'text-rose-400'}>{decision}</strong></span>
      </div>
    </div>
  );
};
