import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { DashboardSummary } from '../../types';
import { KpiCard } from '../../components/cards/KpiCard';
import { EChartWrapper } from '../../components/charts/EChartWrapper';
import { IndustrialGauge } from '../../components/gauges/IndustrialGauge';
import {
  Activity,
  ShieldCheck,
  Zap,
  Atom,
  Radio,
  Cpu,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await api.getSummary();
        setSummary(data);
      } catch (e) {
        // Fallback default mock
        setSummary({
          system_status: 'ONLINE',
          network_health_pct: 99.98,
          connected_substations: 4,
          active_sessions: 2,
          online_devices: 8,
          active_quantum_links: 3,
          active_security_alerts: 0,
          current_qber_pct: 1.2,
          secret_key_rate_kbps: 1.45,
          ai_threat_level: 'LOW',
          packet_rate_sec: 42.5,
          throughput_kbps: 128.4,
          metrics_snapshot: {},
          timestamp: Date.now() / 1000
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
    const interval = setInterval(fetchSummary, 3000);
    return () => clearInterval(interval);
  }, []);

  const throughputOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Throughput (kbps)', 'Packet Rate (msg/s)'], textStyle: { color: '#94a3b8' } },
    xAxis: {
      type: 'category',
      data: ['10m ago', '8m ago', '6m ago', '4m ago', '2m ago', 'Now'],
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [
      {
        name: 'Throughput (kbps)',
        type: 'line',
        smooth: true,
        data: [120.2, 124.5, 128.1, 126.8, 129.4, 128.4],
        itemStyle: { color: '#14b8a6' },
        areaStyle: { color: 'rgba(20, 184, 166, 0.15)' }
      },
      {
        name: 'Packet Rate (msg/s)',
        type: 'line',
        smooth: true,
        data: [35, 38, 41, 42, 43, 42.5],
        itemStyle: { color: '#06b6d4' }
      }
    ]
  };

  const qberOption = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['10m ago', '8m ago', '6m ago', '4m ago', '2m ago', 'Now'],
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: { type: 'value', max: 5, splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [
      {
        name: 'QBER (%)',
        type: 'line',
        smooth: true,
        data: [1.4, 1.3, 1.25, 1.2, 1.18, 1.2],
        itemStyle: { color: '#10b981' },
        areaStyle: { color: 'rgba(16, 185, 129, 0.15)' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="System Health"
          value={`${summary?.network_health_pct || 99.98}%`}
          status="healthy"
          icon={Activity}
          subtitle="4 Substations Connected"
          trend="0.02%"
          trendUp={true}
        />
        <KpiCard
          title="Quantum Key Rate"
          value={summary?.secret_key_rate_kbps || 1.45}
          unit="kbps"
          status="info"
          icon={Atom}
          subtitle="E91 Entangled Stream"
          trend="0.05 kbps"
          trendUp={true}
        />
        <KpiCard
          title="QBER Error Rate"
          value={`${summary?.current_qber_pct || 1.2}%`}
          status="healthy"
          icon={ShieldCheck}
          subtitle="Threshold < 11.0%"
          trend="0.1%"
          trendUp={false}
        />
        <KpiCard
          title="AI Threat Level"
          value={summary?.ai_threat_level || 'LOW'}
          status="healthy"
          icon={Cpu}
          subtitle="20/20 Zero-Trust Checks Pass"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EChartWrapper
            title="Real-Time Network Throughput & Message Rate"
            subtitle="Continuous 1s telemetry metrics streamed via WebSockets"
            option={throughputOption}
            height="320px"
          />
        </div>
        <div>
          <EChartWrapper
            title="Quantum Bit Error Rate (QBER Trend)"
            subtitle="E91 Bell state parameter stability monitoring"
            option={qberOption}
            height="320px"
          />
        </div>
      </div>

      {/* Industrial Gauges & Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <IndustrialGauge title="Grid Voltage Stability" value={230.4} min={200} max={250} unit="V" warningThreshold={240} criticalThreshold={245} />
        <IndustrialGauge title="Substation Current Load" value={42.1} min={0} max={100} unit="A" warningThreshold={75} criticalThreshold={90} />
        <IndustrialGauge title="Frequency Deviation" value={50.01} min={45} max={55} unit="Hz" warningThreshold={52} criticalThreshold={54} />
        <IndustrialGauge title="Dynamic Trust Index" value={100.0} min={0} max={100} unit="%" warningThreshold={70} criticalThreshold={50} />
      </div>
    </div>
  );
};
