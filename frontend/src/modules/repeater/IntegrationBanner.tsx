import React from 'react';
import { Layers, ArrowRight, Atom, Network, Key, Lock, Target } from 'lucide-react';

export const IntegrationBanner: React.FC = () => {
  const steps = [
    { label: 'Module 2', title: 'E91 Bell Pairs', icon: Atom, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
    { label: 'Module 7', title: 'Repeaters & BSM Swapping', icon: Network, color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/20' },
    { label: 'Quantum Layer', title: 'End-to-End Entanglement', icon: Lock, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
    { label: 'Module 3', title: '256-Bit Shared Secret Key', icon: Key, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Objective Summary Line */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 shrink-0">
            <Target className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                Module 7 Objective
              </span>
              <span className="text-xs text-slate-400 font-mono">E91 SCADA Quantum Mesh</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 font-medium">
              Establish end-to-end entanglement between <span className="text-cyan-300 font-semibold">Control Center</span> &amp; <span className="text-emerald-400 font-semibold">Substation</span> using quantum repeaters &amp; Bell State Measurements.
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture Flow Integration */}
      <div>
        <div className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> System Architecture Flow Integration
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex-1 p-3 rounded-xl border ${step.border} ${step.bg} flex items-center gap-3 backdrop-blur-md`}>
                  <div className={`p-2 rounded-lg bg-slate-950/60 ${step.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono block text-slate-400 uppercase">{step.label}</span>
                    <span className="text-xs font-bold text-slate-100 block">{step.title}</span>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
