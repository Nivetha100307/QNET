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
  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between text-[11px] border-b border-slate-800 pb-2">
        <span className="text-slate-400 font-sans font-semibold">Live SCADA Network Trajectory</span>
        <span className="text-cyan-400 font-mono">E91 Channel Active</span>
      </div>

      <div className="relative flex items-center justify-between py-4 px-2">
        {/* Source Node */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Radio className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-300 font-bold">{sourceNode}</span>
          <span className="text-[9px] text-slate-500">Transmitter</span>
        </div>

        {/* Channel Link & Moving Packet */}
        <div className="flex-1 relative mx-4 h-1 bg-slate-800 rounded-full flex items-center">
          <div className={`h-full transition-all duration-300 ${
            decision === 'ALLOW' ? 'bg-emerald-500' : decision === 'BLOCK' ? 'bg-rose-500' : 'bg-cyan-500'
          }`} style={{ width: isSimulating ? '100%' : '50%' }} />

          {/* Animated Travelling Packet Icon */}
          {isSimulating && (
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 animate-ping p-1.5 rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/50">
              <Zap className="w-3.5 h-3.5" />
            </div>
          )}

          {/* Adversary Eve Node (If Attack Selected) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 flex flex-col items-center">
            <div className={`p-1.5 rounded-lg border ${
              isSimulating ? 'bg-rose-950 border-rose-800 text-rose-400 animate-bounce' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <span className="text-[8px] text-rose-400 font-bold mt-0.5">EVE ({attackType})</span>
          </div>
        </div>

        {/* Destination Node */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 shadow-lg shadow-purple-950/50">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-300 font-bold">{destinationNode}</span>
          <span className="text-[9px] text-slate-500">Receiver</span>
        </div>
      </div>
    </div>
  );
};
