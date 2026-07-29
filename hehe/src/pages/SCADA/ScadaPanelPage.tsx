import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ScadaSummaryData } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { IndustrialGauge } from '../../components/gauges/IndustrialGauge';
import { EChartWrapper } from '../../components/charts/EChartWrapper';
import { BreakerControlModal } from '../../components/dialogs/BreakerControlModal';
import {
  Zap,
  Cpu,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders
} from 'lucide-react';

export const ScadaPanelPage: React.FC = () => {
  const [scadaData, setScadaData] = useState<ScadaSummaryData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { breakerStateOverrides, toggleBreakerState, lastDecision } = useAppStore();

  useEffect(() => {
    const fetchScada = async () => {
      try {
        const data = await api.getScada();
        setScadaData(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchScada();
    const interval = setInterval(fetchScada, 2000);
    return () => clearInterval(interval);
  }, []);

  const powerTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Power Output (kW)', 'Frequency (Hz)'], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: ['10m', '8m', '6m', '4m', '2m', 'Now'],
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: [
      { type: 'value', name: 'kW', splitLine: { lineStyle: { color: '#1e293b' } } },
      { type: 'value', name: 'Hz', min: 49.5, max: 50.5, splitLine: { show: false } }
    ],
    series: [
      {
        name: 'Power Output (kW)',
        type: 'line',
        smooth: true,
        data: [1180, 1192, 1205, 1198, 1202, 1200],
        itemStyle: { color: '#06b6d4' },
        areaStyle: { color: 'rgba(6, 182, 212, 0.15)' }
      },
      {
        name: 'Frequency (Hz)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: [50.02, 50.01, 49.99, 50.01, 50.0, 50.01],
        itemStyle: { color: '#10b981' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Control Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 font-poppins">
              Siemens WinCC SCADA Operation Panel
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Authenticated & Encrypted via E91 QKD HKDF-SHA256 Session Keys
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-teal-500/20 flex items-center space-x-2 transition-all active:scale-95"
        >
          <Sliders className="w-4 h-4" />
          <span>Execute SCADA Control Command</span>
        </button>
      </div>

      {/* Industrial Gauges Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <IndustrialGauge title="Substation Voltage (V)" value={230.4} min={200} max={250} unit="V" warningThreshold={240} criticalThreshold={245} />
        <IndustrialGauge title="Feeder Current (A)" value={42.1} min={0} max={100} unit="A" warningThreshold={75} criticalThreshold={90} />
        <IndustrialGauge title="Generator Output (kW)" value={scadaData?.generator_output_kw || 1200} min={0} max={1500} unit="kW" warningThreshold={1350} criticalThreshold={1450} />
        <IndustrialGauge title="Grid Frequency (Hz)" value={scadaData?.frequency_hz || 50.01} min={48} max={52} unit="Hz" warningThreshold={51} criticalThreshold={51.5} />
      </div>

      {/* Equipment Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Breaker BRK_12 Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200">Circuit Breaker BRK_12</span>
            <span
              className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                breakerStateOverrides['BRK_12'] === 'OPEN'
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
              }`}
            >
              {breakerStateOverrides['BRK_12'] || 'OPEN'}
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Substation:</span>
              <span className="text-slate-200">SUB_NORTH</span>
            </div>
            <div className="flex justify-between">
              <span>Coil Status:</span>
              <span className="text-emerald-400">NORMAL</span>
            </div>
            <div className="flex justify-between">
              <span>Zero-Trust Risk:</span>
              <span className="text-teal-400">LOW (100.0)</span>
            </div>
          </div>

          <button
            onClick={() => toggleBreakerState('BRK_12')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 py-1.5 rounded-xl text-xs font-medium transition-colors"
          >
            Toggle Breaker State (Direct HMI)
          </button>
        </div>

        {/* Transformer Status Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200">Transformer Tap 01</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
              78.4% LOAD
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Tap Position:</span>
              <span className="text-slate-200">POSITION 04</span>
            </div>
            <div className="flex justify-between">
              <span>Oil Temp:</span>
              <span className="text-emerald-400">48.5 °C</span>
            </div>
            <div className="flex justify-between">
              <span>Power Factor:</span>
              <span className="text-teal-400">0.98 PF</span>
            </div>
          </div>
        </div>

        {/* Generator Status Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-200">Generator Unit 01</span>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
              SYNCHRONIZED
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Active Power:</span>
              <span className="text-slate-200">1200.0 kW</span>
            </div>
            <div className="flex justify-between">
              <span>Rotor Speed:</span>
              <span className="text-emerald-400">3000 RPM</span>
            </div>
            <div className="flex justify-between">
              <span>Sync Frequency:</span>
              <span className="text-teal-400">50.01 Hz</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Power & Frequency Trend Graph */}
      <EChartWrapper
        title="Grid Power Output & Frequency Stability"
        subtitle="Siemens WinCC continuous electrical parameter telemetry graph"
        option={powerTrendOption}
        height="320px"
      />

      {/* Modal execution launcher */}
      {isModalOpen && <BreakerControlModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
