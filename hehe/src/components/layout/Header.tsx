import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  ShieldCheck,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Zap,
  Activity,
  Search,
  KeyRound
} from 'lucide-react';

interface HeaderProps {
  onOpenControlModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenControlModal }) => {
  const { activeTab, theme, toggleTheme, wsConnected } = useAppStore();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().split(' ')[4] + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'System Dashboard — Executive Overview';
      case 'scada': return 'SCADA Operations — Siemens WinCC Control Center';
      case 'quantum': return 'Quantum Key Distribution — E91 QKD Monitor';
      case 'comm': return 'Communication — Cisco SecureX Network Pipeline';
      case 'security': return 'Security Operations Center (SOC) — Zero-Trust';
      case 'topology': return 'Network Topology — React Flow Interactive Grid';
      case 'analytics': return 'Analytics — Azure Monitor Time-Series Suite';
      case 'logs': return 'Logs Explorer — Enterprise AG Grid Explorer';
      case 'comparison': return 'Classical vs Quantum Cryptography Comparison';
      case 'reports': return 'Reports & Compliance Audit Center';
      case 'settings': return 'System Settings & Connectivity Config';
      default: return 'Module 8 Monitoring Platform';
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Left: Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-teal-400 bg-teal-950/60 border border-teal-800/60 px-2.5 py-1 rounded-md">
          <Zap className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span>MODULE 8</span>
        </div>
        <span className="text-slate-600 font-mono">/</span>
        <h1 className="text-sm font-semibold text-slate-200 tracking-wide">
          {getBreadcrumbTitle(activeTab)}
        </h1>
      </div>

      {/* Right: Controls & Status Badges */}
      <div className="flex items-center space-x-4">
        {/* Quick Action Button */}
        {onOpenControlModal && (
          <button
            onClick={onOpenControlModal}
            className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all duration-150 active:scale-95"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Execute SCADA Command</span>
          </button>
        )}

        {/* E91 QKD Entanglement Badge */}
        <div className="hidden lg:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-lg text-xs font-mono">
          <span className="text-teal-400 font-bold">E91 S=2.82</span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400">1.45 kbps</span>
        </div>

        {/* Live UTC Clock */}
        <div className="font-mono text-xs text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
          {timeStr || '00:00:00 UTC'}
        </div>

        {/* WebSocket Connection Status */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
            wsConnected
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
              : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
          }`}
        >
          {wsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">LIVE WS</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">POLLING</span>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          title="Toggle Dark/Light Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};
