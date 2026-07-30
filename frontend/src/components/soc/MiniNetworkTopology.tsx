import React from 'react';
import { ShieldAlert, Radio, Cpu, Zap } from 'lucide-react';

interface MiniNetworkTopologyProps {
  sourceNode: string;
  destinationNode: string;
  isSimulating: boolean;
  attackType: string;
  decision: 'ALLOW' | 'BLOCK' | 'PENDING';
}

export const MiniNetworkTopology: React.FC<MiniNetworkTopologyProps> = ({
  sourceNode,
  destinationNode,
  isSimulating,
  attackType,
  decision
}) => {
  const isMultiNode = destinationNode.includes(',');
  const subCount = isMultiNode ? destinationNode.split(',').length : 1;

  const formattedDestLabel = isMultiNode
    ? `${subCount} Target Substations (Sub A – Sub D)`
    : (destinationNode || 'Substation_A');

  return (
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between text-[11px] border-b border-slate-800/80 pb-2">
        <span className="text-slate-300 font-sans font-bold">Live SCADA Network Trajectory</span>
        <span className="text-cyan-400 font-mono text-[10px] bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
          E91 Channel Active
        </span>
      </div>

      <div className="relative flex items-center justify-between py-6 px-1">
        {/* Source Node */}
        <div className="flex flex-col items-center gap-1 z-10 min-w-[90px]">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400 shadow-md shadow-cyan-950/50">
            <Radio className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-200 font-bold font-sans mt-0.5">{sourceNode || 'Control_Center'}</span>
          <span className="text-[9px] text-slate-400 font-mono">Transmitter</span>
        </div>

        {/* Optical Channel Link & Moving Packet */}
        <div className="flex-1 relative mx-3 h-1.5 bg-slate-800/90 rounded-full flex items-center">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              decision === 'ALLOW' ? 'bg-emerald-500' : decision === 'BLOCK' ? 'bg-rose-500' : 'bg-cyan-500'
            }`}
            style={{ width: isSimulating ? '100%' : '60%' }}
          />

          {/* Animated Travelling Packet Icon */}
          {isSimulating && (
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-pulse p-1 rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/80">
              <Zap className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Adversary Eve Node (Positioned cleanly above optical link) */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            <div className={`px-2 py-0.5 rounded-md border text-[9px] font-bold flex items-center gap-1 shadow-md ${
              isSimulating
                ? 'bg-rose-950 border-rose-600 text-rose-300 animate-bounce shadow-rose-950/80'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>EVE ({attackType})</span>
            </div>
          </div>
        </div>

        {/* Destination Node */}
        <div className="flex flex-col items-center gap-1 z-10 min-w-[110px]">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-700 text-purple-400 shadow-md shadow-purple-950/50">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-200 font-bold font-sans mt-0.5 text-center px-1">
            {formattedDestLabel}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">Receiver</span>
        </div>
      </div>
    </div>
  );
};
