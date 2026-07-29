import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Settings, Moon, Sun, Wifi, ShieldCheck, KeyRound } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, wsConnected } = useAppStore();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <Settings className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              System Configuration & Preferences
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Manage WebSocket connection endpoints, theme preferences, and security thresholds
            </p>
          </div>
        </div>
      </div>

      {/* Theme Settings Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Appearance & UI Theme
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-200">Theme Mode</div>
            <div className="text-xs text-slate-400">Toggle between Dark Slate Industrial and Light Theme</div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Connectivity Settings Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          WebSocket & API Endpoint Configuration
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-sans">Live WebSocket Stream URL:</label>
            <input
              type="text"
              readOnly
              value="ws://127.0.0.1:8000/ws"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-teal-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-sans">FastAPI REST API Base:</label>
            <input
              type="text"
              readOnly
              value="http://127.0.0.1:8000/api"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-teal-400"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-sans">Telemetry Refresh Interval:</label>
            <input
              type="text"
              readOnly
              value="1.0 SECOND (REAL-TIME STREAMING)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
