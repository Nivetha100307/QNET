import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Zap,
  Atom,
  Radio,
  ShieldAlert,
  Network,
  BarChart3,
  ScrollText,
  ArrowLeftRight,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'System Dashboard', icon: LayoutDashboard },
    { id: 'scada', label: 'SCADA Operations', icon: Zap },
    { id: 'quantum', label: 'Quantum Monitoring', icon: Atom },
    { id: 'comm', label: 'Communication', icon: Radio },
    { id: 'security', label: 'Security SOC', icon: ShieldAlert },
    { id: 'topology', label: 'Network Topology', icon: Network },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'logs', label: 'Logs Explorer', icon: ScrollText },
    { id: 'comparison', label: 'Classical vs Quantum', icon: ArrowLeftRight },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 relative z-40 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-md shadow-teal-500/20 shrink-0">
              Q
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-sm font-bold tracking-wider text-slate-100 font-poppins">
                  QUANT
                </div>
                <div className="text-[10px] font-mono text-teal-400 tracking-tight">
                  QKD-SCADA OPS
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-teal-600/15 text-teal-400 border border-teal-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
            <div className="text-[11px] truncate">
              <div className="font-semibold text-slate-200">Zero-Trust Active</div>
              <div className="text-slate-500 font-mono text-[10px]">20/20 Pipeline Pass</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Zero-Trust Pipeline Active">
            <Cpu className="w-5 h-5 text-teal-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
