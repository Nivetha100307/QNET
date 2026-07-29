import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { QuantumMetrics } from '../../types';
import { KpiCard } from '../../components/cards/KpiCard';
import { EChartWrapper } from '../../components/charts/EChartWrapper';
import { IndustrialGauge } from '../../components/gauges/IndustrialGauge';
import {
  Atom,
  ShieldCheck,
  Zap,
  Activity,
  KeyRound,
  RefreshCw,
  Cpu
} from 'lucide-react';

export const QuantumDashboardPage: React.FC = () => {
  const [quantum, setQuantum] = useState<QuantumMetrics | null>(null);

  useEffect(() => {
    const fetchQuantum = async () => {
      try {
        const data = await api.getQuantum();
        setQuantum(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchQuantum();
    const interval = setInterval(fetchQuantum, 2500);
    return () => clearInterval(interval);
  }, []);

  const keyRateTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Secret Key Rate (kbps)', 'Entangled Pairs (/s)'], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: ['10m ago', '8m ago', '6m ago', '4m ago', '2m ago', 'Now'],
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: [
      { type: 'value', name: 'kbps', min: 1.0, max: 2.0, splitLine: { lineStyle: { color: '#1e293b' } } },
      { type: 'value', name: 'Pairs/s', splitLine: { show: false } }
    ],
    series: [
      {
        name: 'Secret Key Rate (kbps)',
        type: 'line',
        smooth: true,
        data: [1.38, 1.40, 1.42, 1.45, 1.46, 1.45],
        itemStyle: { color: '#14b8a6' },
        areaStyle: { color: 'rgba(20, 184, 166, 0.15)' }
      },
      {
        name: 'Entangled Pairs (/s)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: [12100, 12250, 12400, 12380, 12450, 12400],
        itemStyle: { color: '#38bdf8' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <Atom className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              E91 Quantum Key Distribution (QKD) Engine
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Entanglement-based quantum security channel between Substation Alice & Substation Bob
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ENTANGLED_SECURE (S = 2.82)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="CHSH Bell Score (S)"
          value={quantum?.chsh_bell_score || 2.82}
          status="healthy"
          icon={Atom}
          subtitle="S > 2.0 Proves Quantum Physics"
        />
        <KpiCard
          title="QBER Error Rate"
          value={`${quantum?.qber_pct || 1.2}%`}
          status="healthy"
          icon={ShieldCheck}
          subtitle="Quantum Bit Error Rate < 11.0%"
        />
        <KpiCard
          title="Bell State Fidelity"
          value={`${quantum?.fidelity_pct || 99.4}%`}
          status="healthy"
          icon={Activity}
          subtitle="Entanglement Purity"
        />
        <KpiCard
          title="Secret Key Rate"
          value={quantum?.secret_key_rate_kbps || 1.45}
          unit="kbps"
          status="info"
          icon={KeyRound}
          subtitle="12,400 Entangled Pairs/s"
        />
      </div>

      {/* Gauges & Rotation Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <IndustrialGauge title="CHSH Bell Parameter (S)" value={quantum?.chsh_bell_score || 2.82} min={1.5} max={3.0} unit=" S" warningThreshold={2.0} criticalThreshold={1.8} />
        <IndustrialGauge title="Quantum Bit Error Rate" value={quantum?.qber_pct || 1.2} min={0} max={15} unit="%" warningThreshold={8} criticalThreshold={11} />
        <IndustrialGauge title="Key Gen Progress" value={quantum?.key_generation_progress_pct || 84.5} min={0} max={100} unit="%" warningThreshold={95} criticalThreshold={99} />
      </div>

      {/* ECharts Key Generation Rate Graph */}
      <EChartWrapper
        title="E91 Quantum Key Generation Rate & Pair Yield"
        subtitle="HKDF session key expansion yield continuous stream"
        option={keyRateTrendOption}
        height="320px"
      />
    </div>
  );
};
