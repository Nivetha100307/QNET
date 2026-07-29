import React from 'react';
import { ReactFlowTopology } from '../../components/topology/ReactFlowTopology';
import { Network, Atom, ShieldCheck, Cpu } from 'lucide-react';

export const NetworkTopologyPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <Network className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Interactive SCADA Grid Network Topology (React Flow)
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Live particle flow, link status, zoom/pan navigation & node click drawer details
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 font-mono text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-cyan-400">Quantum Link (E91 QKD)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400">Classical (IEC 61850 / Modbus)</span>
          </div>
        </div>
      </div>

      {/* React Flow Topology Canvas */}
      <ReactFlowTopology />
    </div>
  );
};
