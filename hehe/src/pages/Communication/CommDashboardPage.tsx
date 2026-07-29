import React from 'react';
import { KpiCard } from '../../components/cards/KpiCard';
import { PacketFlowAnimation } from '../../components/communication/PacketFlowAnimation';
import { EChartWrapper } from '../../components/charts/EChartWrapper';
import {
  Radio,
  Clock,
  ArrowDownUp,
  ShieldCheck,
  Server,
  Layers
} from 'lucide-react';

export const CommDashboardPage: React.FC = () => {
  const latencyOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Encryption Latency (ms)', 'Decryption Latency (ms)'], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: ['10m', '8m', '6m', '4m', '2m', 'Now'],
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: { type: 'value', name: 'ms', splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [
      {
        name: 'Encryption Latency (ms)',
        type: 'line',
        smooth: true,
        data: [1.2, 1.15, 1.1, 1.08, 1.05, 1.05],
        itemStyle: { color: '#14b8a6' }
      },
      {
        name: 'Decryption Latency (ms)',
        type: 'line',
        smooth: true,
        data: [0.85, 0.82, 0.8, 0.78, 0.78, 0.8],
        itemStyle: { color: '#06b6d4' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Cisco SecureX Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Cisco SecureX Network Communication Pipeline
            </h2>
            <p className="text-xs font-mono text-slate-400">
              AES-256-GCM encrypted SCADA packet stream with zero-trust integrity verification
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Packets Transmitted" value="142,850" status="healthy" icon={ArrowDownUp} subtitle="0 Packet Loss" />
        <KpiCard title="Queue Size" value="0" unit="msg" status="healthy" icon={Layers} subtitle="Buffer Latency < 0.1ms" />
        <KpiCard title="Encryption Latency" value="1.05" unit="ms" status="info" icon={Clock} subtitle="AES-256-GCM Hardware Accel" />
        <KpiCard title="Decryption Latency" value="0.80" unit="ms" status="info" icon={Clock} subtitle="Constant-time verification" />
      </div>

      {/* Live Stage Packet Flow Lifecycle */}
      <PacketFlowAnimation />

      {/* Latency Performance ECharts Graph */}
      <EChartWrapper
        title="Encryption & Decryption Latency Profile"
        subtitle="Sub-millisecond cryptoprocessor overhead per SCADA command packet"
        option={latencyOption}
        height="320px"
      />
    </div>
  );
};
