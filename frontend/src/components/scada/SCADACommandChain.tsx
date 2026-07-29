import React from 'react';
import { UserCheck, ShieldCheck, Sliders, Key, Hash, Lock, CheckCircle2, Radio, Cpu, Check, Activity } from 'lucide-react';

interface SCADACommandChainProps {
  currentStepIndex: number;
}

export const SCADACommandChain: React.FC<SCADACommandChainProps> = ({ currentStepIndex }) => {
  const steps = [
    { id: 1, label: 'Operator', icon: UserCheck },
    { id: 2, label: 'RBAC', icon: ShieldCheck },
    { id: 3, label: 'Session (Mod 1)', icon: Sliders },
    { id: 4, label: 'E91 Key (Mod 3)', icon: Key },
    { id: 5, label: 'HKDF Key', icon: Hash },
    { id: 6, label: 'AES-GCM', icon: Lock },
    { id: 7, label: 'Replay Protection', icon: CheckCircle2 },
    { id: 8, label: 'Packet Schema', icon: Radio },
    { id: 9, label: 'Transport Layer', icon: Activity },
    { id: 10, label: 'Substation RTU', icon: Cpu },
    { id: 11, label: 'ACK Received', icon: Check },
    { id: 12, label: 'Telemetry Return', icon: Radio },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-slate-200 font-sans font-bold">End-to-End Command Execution Chain</span>
        <span className="text-[10px] text-cyan-400 font-mono">
          {currentStepIndex >= 0 ? `Executing Step #${currentStepIndex + 1} / 12` : 'Idle Readiness'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;

          let badgeClass = 'bg-slate-950 text-slate-500 border-slate-800/80';
          if (isCompleted) badgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-800/80 shadow-md shadow-emerald-950/30';
          if (isActive) badgeClass = 'bg-cyan-950 text-cyan-200 border-cyan-500 shadow-lg shadow-cyan-950/50 animate-pulse';

          return (
            <React.Fragment key={st.id}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold shrink-0 transition-all ${badgeClass}`}>
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'animate-bounce text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span>{st.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <span className={`text-[10px] ${isCompleted ? 'text-emerald-500 font-bold' : 'text-slate-700'}`}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
