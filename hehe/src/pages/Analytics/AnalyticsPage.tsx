import React, { useState } from 'react';
import { EChartWrapper } from '../../components/charts/EChartWrapper';
import { BarChart3, Filter, Clock, Sliders } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedSubstation, setSelectedSubstation] = useState('ALL');

  const timeSeriesOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Telemetry Latency (ms)', 'Key Generation Yield (kbps)', 'QBER (%)'], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: ['00:00', '00:15', '00:30', '00:45', '01:00', '01:15', '01:30', '01:45', '02:00'],
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [
      {
        name: 'Telemetry Latency (ms)',
        type: 'line',
        smooth: true,
        data: [2.4, 2.1, 1.9, 1.85, 1.82, 1.85, 1.88, 1.84, 1.85],
        itemStyle: { color: '#14b8a6' }
      },
      {
        name: 'Key Generation Yield (kbps)',
        type: 'line',
        smooth: true,
        data: [1.38, 1.40, 1.42, 1.45, 1.46, 1.45, 1.44, 1.45, 1.45],
        itemStyle: { color: '#38bdf8' }
      },
      {
        name: 'QBER (%)',
        type: 'line',
        smooth: true,
        data: [1.4, 1.3, 1.25, 1.2, 1.18, 1.2, 1.21, 1.19, 1.2],
        itemStyle: { color: '#10b981' }
      }
    ]
  };

  const correlationOption = {
    tooltip: { trigger: 'item' },
    xAxis: { name: 'Throughput (kbps)', splitLine: { lineStyle: { color: '#1e293b' } } },
    yAxis: { name: 'Latency (ms)', splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [
      {
        name: 'Correlation Points',
        type: 'scatter',
        symbolSize: 10,
        data: [
          [110, 2.4], [115, 2.2], [120, 2.0], [125, 1.9], [128, 1.85],
          [130, 1.82], [132, 1.80], [135, 1.78], [140, 1.75]
        ],
        itemStyle: { color: '#06b6d4' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <BarChart3 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Azure Monitor Historical Analytics & Correlation Engine
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Multi-metric time-series trend analysis, latency correlation & device filtering
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl focus:outline-none focus:border-teal-500"
          >
            <option value="1h">Time Range: Last 1 Hour</option>
            <option value="6h">Time Range: Last 6 Hours</option>
            <option value="24h">Time Range: Last 24 Hours</option>
            <option value="7d">Time Range: Last 7 Days</option>
          </select>

          <select
            value={selectedSubstation}
            onChange={(e) => setSelectedSubstation(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl focus:outline-none focus:border-teal-500"
          >
            <option value="ALL">Substation: ALL</option>
            <option value="SUB_NORTH">Substation North</option>
            <option value="SUB_SOUTH">Substation South</option>
            <option value="SUB_WEST">Substation West</option>
          </select>
        </div>
      </div>

      {/* Time Series Charts */}
      <EChartWrapper
        title="Multi-Metric Historical Performance Time-Series"
        subtitle="Latency vs Key Yield vs QBER over time"
        option={timeSeriesOption}
        height="350px"
      />

      {/* Correlation Scatter Graph */}
      <EChartWrapper
        title="Network Throughput vs Encryption Latency Correlation"
        subtitle="Confirms zero-trust overhead remains constant under heavy packet load"
        option={correlationOption}
        height="320px"
      />
    </div>
  );
};
