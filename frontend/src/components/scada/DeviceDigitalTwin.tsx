import React from 'react';
import { Cpu, Zap, Activity, ShieldCheck, Thermometer, Radio } from 'lucide-react';

interface DeviceDigitalTwinProps {
  device: string;
  voltage: number;
  current: number;
  frequency: number;
  temperature: number;
  breakerState: string;
  relayState: string;
  trustScore: number;
}

export const DeviceDigitalTwin: React.FC<DeviceDigitalTwinProps> = ({
  device,
  voltage,
  current,
  frequency,
  temperature,
  breakerState,
  relayState,
  trustScore
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-slate-100 font-sans">
            Substation RTU Digital Twin ({device})
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
          ONLINE (v3.4.2)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> VOLTAGE
          </span>
          <span className="text-amber-300 font-bold text-sm">{voltage.toFixed(1)} V</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" /> CURRENT
          </span>
          <span className="text-cyan-300 font-bold text-sm">{current.toFixed(1)} A</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans flex items-center gap-1">
            <Radio className="w-3 h-3 text-purple-400" /> FREQUENCY
          </span>
          <span className="text-purple-300 font-bold text-sm">{frequency.toFixed(2)} Hz</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-rose-400" /> TEMPERATURE
          </span>
          <span className="text-rose-300 font-bold text-sm">{temperature.toFixed(0)}°C</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 font-sans text-xs">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">BREAKER STATE</span>
          <span className={`font-bold font-mono ${breakerState === 'CLOSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {breakerState}
          </span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">RELAY STATUS</span>
          <span className="text-cyan-300 font-bold font-mono">{relayState}</span>
        </div>
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px]">TRUST SCORE</span>
          <span className="text-emerald-400 font-bold font-mono">{trustScore.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
