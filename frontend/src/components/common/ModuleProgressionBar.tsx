import React from 'react';
import { Sliders, Atom, Key, ShieldCheck, Radio, ShieldAlert, Network, Lock } from 'lucide-react';

interface ModuleProgressionBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ModuleProgressionBar: React.FC<ModuleProgressionBarProps> = ({ activeTab, onTabChange }) => {
  const modules = [
    { id: 'module1', name: 'Module 1', label: 'Session Init', icon: Sliders },
    { id: 'module2', name: 'Module 2', label: 'E91 Engine', icon: Atom },
    { id: 'module3', name: 'Module 3', label: 'Shared Key', icon: Key },
    { id: 'module4', name: 'Module 4', label: 'Security Monitor', icon: ShieldCheck },
    { id: 'module5', name: 'Module 5', label: 'AES SCADA', icon: Radio },
    { id: 'module6', name: 'Module 6', label: 'Zero-Trust SOC', icon: ShieldAlert },
    { id: 'module7', name: 'Module 7', label: 'Repeaters & BSM', icon: Network },
    { id: 'module8', name: 'Module 8', label: 'Cascade & AI', icon: Lock },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md">
      <div className="flex items-center justify-between overflow-x-auto gap-2 scrollbar-none">
        {modules.map((m, idx) => {
          const Icon = m.icon;
          const isActive = activeTab === m.id;
          return (
            <React.Fragment key={m.id}>
              <button
                onClick={() => onTabChange(m.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 border border-cyan-400/40'
                    : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300 animate-pulse' : 'text-slate-400'}`} />
                <span>{m.name}: {m.label}</span>
              </button>
              {idx < modules.length - 1 && (
                <span className="text-slate-700 font-mono text-xs">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
