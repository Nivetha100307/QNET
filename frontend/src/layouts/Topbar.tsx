import React, { useState, useEffect } from 'react';
import { RefreshCw, Cpu } from 'lucide-react';
import { EventBus } from '../core/EventBus';
import { wsService } from '../core/websocket';

interface TopbarProps {
  activeTab: string;
  onRefresh?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ activeTab, onRefresh }) => {
  const [wsConnected, setWsConnected] = useState<boolean>(wsService.isConnected());

  useEffect(() => {
    // Ensure initial connection attempt
    wsService.connect();
    setWsConnected(wsService.isConnected());

    const unsub = EventBus.on('WS_STATUS', (data) => {
      setWsConnected(Boolean(data.connected));
    });
    return () => unsub();
  }, []);

  const getModuleTitle = (tab: string) => {
    switch (tab) {
      case 'module1': return 'Module 1: Session & Network Initialization';
      case 'module2': return 'Module 2: E91 Quantum Engine';
      case 'module3': return 'Module 3: Quantum Key Management';
      case 'module4': return 'Module 4: Quantum Security Monitor';
      case 'module5': return 'Module 5: Secure SCADA Communication';
      case 'module6': return 'Module 6: Zero-Trust & Attack Simulator';
      case 'module7': return 'Module 7: Repeaters & Entanglement Swapping';
      case 'module8': return 'Module 8: Privacy Amplification & AI Analytics';
      default: return 'QNetSecure Quantum SCADA System';
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
      <div>
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          {getModuleTitle(activeTab)}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/30">
            Active
          </span>
        </h2>
        <p className="text-[11px] text-slate-400">
          AI-Enabled E91 Quantum SCADA Communication Network
        </p>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        )}

        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
          wsConnected
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          {wsConnected ? 'WebSocket Live' : 'WS Reconnecting'}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5" /> AerSimulator
        </div>
      </div>
    </header>
  );
};
