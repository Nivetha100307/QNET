import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SecurityMetrics } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { KpiCard } from '../../components/cards/KpiCard';
import { IndustrialGauge } from '../../components/gauges/IndustrialGauge';
import { EChartWrapper } from '../../components/charts/EChartWrapper';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
  AlertOctagon,
  Power,
  RefreshCw
} from 'lucide-react';

export const SocSecurityPage: React.FC = () => {
  const [security, setSecurity] = useState<SecurityMetrics | null>(null);
  const { isolatedDevices, toggleDeviceIsolation, addSecurityAlert } = useAppStore();

  useEffect(() => {
    const fetchSecurity = async () => {
      try {
        const data = await api.getSecurity();
        setSecurity(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSecurity();
    const interval = setInterval(fetchSecurity, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleIsolateToggle = (deviceId: string) => {
    const isIsolated = isolatedDevices.includes(deviceId);
    toggleDeviceIsolation(deviceId);
    api.updateTrustScore(deviceId, isIsolated ? 'RESET' : 'PENALIZE', 50);
    addSecurityAlert({
      type: isIsolated ? 'DEVICE_RECONNECTED' : 'DEVICE_ISOLATED',
      description: `Operator toggled device isolation status for ${deviceId}`,
      severity: isIsolated ? 'LOW' : 'CRITICAL'
    });
  };

  const authDoughnutOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', textStyle: { color: '#94a3b8' } },
    series: [
      {
        name: 'Authentication Status',
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: '#0f172a', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: security?.auth_success_count || 52, name: 'Success (HMAC-SHA256)', itemStyle: { color: '#10b981' } },
          { value: security?.auth_failure_count || 0, name: 'Failures', itemStyle: { color: '#ef4444' } },
          { value: security?.replay_attacks_blocked || 0, name: 'Replay Blocked', itemStyle: { color: '#f59e0b' } }
        ]
      }
    ]
  };

  const registeredDevices = [
    { id: 'BRK_12', name: 'Substation North Circuit Breaker', substation: 'SUB_NORTH', trust: 100, role: 'BREAKER' },
    { id: 'RELAY_04', name: 'Substation South Protection Relay', substation: 'SUB_SOUTH', trust: 100, role: 'RELAY' },
    { id: 'TRANS_TAP_01', name: 'Substation West Transformer Tap', substation: 'SUB_WEST', trust: 98, role: 'TRANSFORMER' },
    { id: 'GEN_MAIN_01', name: 'Master Substation Generator', substation: 'HQ_CORE', trust: 96, role: 'GENERATOR' }
  ];

  return (
    <div className="space-y-6">
      {/* SOC Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <ShieldAlert className="w-6 h-6 animate-pulse text-teal-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Zero-Trust Security Operations Center (SOC)
            </h2>
            <p className="text-xs font-mono text-slate-400">
              20-Stage Security Decision Engine & Dynamic Trust Quarantine Control
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>THREAT LEVEL: LOW (LOW RISK)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Threat Risk Score" value={security?.risk_score || 12.5} unit="/100" status="healthy" icon={ShieldAlert} subtitle="Low Threat Profile" />
        <KpiCard title="Active QKD Sessions" value={security?.active_sessions_count || 2} status="healthy" icon={Lock} subtitle="AES-256-GCM Sessions" />
        <KpiCard title="Replays Blocked" value={security?.replay_attacks_blocked || 0} status="healthy" icon={AlertOctagon} subtitle="Monotonic Nonces Checked" />
        <KpiCard title="Auth Successes" value={security?.auth_success_count || 52} status="healthy" icon={UserCheck} subtitle="Constant-time Digest Pass" />
      </div>

      {/* Gauges & Doughnut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <IndustrialGauge title="Overall Grid Trust Score" value={100.0} min={0} max={100} unit="%" warningThreshold={70} criticalThreshold={50} />
        </div>
        <div className="lg:col-span-2">
          <EChartWrapper title="HMAC Authentication Success vs Failure Rate" subtitle="Constant-time signature audit breakdown" option={authDoughnutOption} height="230px" />
        </div>
      </div>

      {/* Device Isolation & Quarantine Control Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Zero-Trust Entity Inventory & Emergency Isolation Controls
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Devices with trust score below 50.0 are automatically isolated by the policy engine
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Device ID</th>
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Substation</th>
                <th className="py-2.5 px-3">Trust Score</th>
                <th className="py-2.5 px-3">Isolation Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {registeredDevices.map((dev) => {
                const isIsolated = isolatedDevices.includes(dev.id);
                return (
                  <tr key={dev.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-teal-400 font-bold">{dev.id}</td>
                    <td className="py-3 px-3 text-slate-200 font-sans">{dev.name}</td>
                    <td className="py-3 px-3 text-slate-400">{dev.substation}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{isIsolated ? '0.0' : `${dev.trust}.0`} / 100</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isIsolated
                            ? 'bg-rose-950 text-rose-400 border-rose-800'
                            : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        }`}
                      >
                        {isIsolated ? 'ISOLATED (QUARANTINE)' : 'ACTIVE (HEALTHY)'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleIsolateToggle(dev.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-sans font-medium transition-colors border ${
                          isIsolated
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                            : 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border-rose-800'
                        }`}
                      >
                        {isIsolated ? 'Reconnect Device' : 'Quarantine & Isolate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
