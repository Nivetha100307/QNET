import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ComparisonData } from '../../types';
import { EChartWrapper } from '../../components/charts/EChartWrapper';
import { ArrowLeftRight, ShieldCheck, Zap, Lock } from 'lucide-react';

export const ComparisonPage: React.FC = () => {
  const [compData, setCompData] = useState<ComparisonData | null>(null);

  useEffect(() => {
    const fetchComp = async () => {
      try {
        const data = await api.getComparison();
        setCompData(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchComp();
  }, []);

  const radarOption = {
    tooltip: { trigger: 'item' },
    legend: { data: ['Classical Cryptography (RSA/ECDH)', 'E91 Quantum SCADA Engine'], textStyle: { color: '#94a3b8' } },
    radar: {
      indicator: [
        { name: 'Key Security', max: 100 },
        { name: 'Attack Detection', max: 100 },
        { name: 'Key Refresh Rate', max: 100 },
        { name: 'Quantum Proof', max: 100 },
        { name: 'Forward Secrecy', max: 100 },
        { name: 'Low Latency', max: 100 }
      ],
      axisLine: { lineStyle: { color: '#334155' } },
      splitLine: { lineStyle: { color: '#1e293b' } },
      splitArea: { areaStyle: { color: ['rgba(15, 23, 42, 0.6)', 'rgba(30, 41, 59, 0.6)'] } }
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [60, 40, 50, 20, 70, 75],
            name: 'Classical Cryptography (RSA/ECDH)',
            itemStyle: { color: '#64748b' },
            areaStyle: { color: 'rgba(100, 116, 139, 0.2)' }
          },
          {
            value: [100, 98, 95, 100, 100, 92],
            name: 'E91 Quantum SCADA Engine',
            itemStyle: { color: '#14b8a6' },
            areaStyle: { color: 'rgba(20, 184, 166, 0.3)' }
          }
        ]
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <ArrowLeftRight className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Classical Cryptography vs. E91 Quantum Key SCADA Comparison
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Side-by-side comparative analysis of mathematical security vs physical quantum entanglement
            </p>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <EChartWrapper
        title="Security Capability Radar Matrix"
        subtitle="100% Quantum-Proof Advantage & Information-Theoretic Security"
        option={radarOption}
        height="350px"
      />

      {/* Comparison Table Grid */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Side-by-Side Parameter Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Parameter</th>
                <th className="py-2.5 px-3 text-slate-400">Classical SCADA (RSA / ECDH)</th>
                <th className="py-2.5 px-3 text-teal-400">E91 Quantum SCADA (QUANT)</th>
                <th className="py-2.5 px-3 text-emerald-400">Quantum Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {compData?.metrics?.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-slate-200 font-sans font-semibold">{m.parameter}</td>
                  <td className="py-3 px-3 text-slate-400">{m.classical}</td>
                  <td className="py-3 px-3 text-teal-300 font-bold">{m.quantum}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{m.advantage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
