import React from 'react';
import {
  Sliders,
  Atom,
  Key,
  ShieldCheck,
  Radio,
  ShieldAlert,
  Network,
  Lock,
  LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'module1', label: 'Module 1: Session Init', icon: Sliders, badge: 'Core' },
    { id: 'module2', label: 'Module 2: Quantum Engine', icon: Atom, badge: 'E91' },
    { id: 'module3', label: 'Module 3: Key Management', icon: Key, badge: 'QKD' },
    { id: 'module4', label: 'Module 4: Security Monitor', icon: ShieldCheck, badge: 'CHSH' },
    { id: 'module5', label: 'Module 5: SCADA Engine', icon: Radio, badge: 'AES-GCM' },
    { id: 'module6', label: 'Module 6: Zero-Trust & Attacks', icon: ShieldAlert, badge: '20-Stage' },
    { id: 'module7', label: 'Module 7: Repeaters & Swapping', icon: Network, badge: 'BSM' },
    { id: 'module8', label: 'Module 8: Privacy & Analytics', icon: Lock, badge: 'Cascade' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="p-5 space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">QNetSecure</h1>
            <span className="text-[10px] font-mono text-cyan-400">E91 Quantum Framework</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-900/50 to-blue-900/50 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                  isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
        QNetSecure v1.0 • Clean Architecture
      </div>
    </aside>
  );
};
