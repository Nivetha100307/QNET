import React from 'react';
import { Radio, Cpu, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

interface SCADAPacketMotionProps {
  isTransmitting: boolean;
  ackReceived: boolean;
  sourceNode: string;
  destinationNode: string;
  command: string;
  onForwardToZeroTrust?: () => void;
}

export const SCADAPacketMotion: React.FC<SCADAPacketMotionProps> = ({
  isTransmitting,
  ackReceived,
  sourceNode,
  destinationNode,
  command,
  onForwardToZeroTrust
}) => {
  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-slate-400 font-sans font-semibold">Live SCADA Packet & ACK Transport Motion</span>
        <div className="flex items-center gap-2">
          <span className="text-cyan-400">Quantum E91 Link</span>
          {onForwardToZeroTrust && (
            <button
              onClick={onForwardToZeroTrust}
              className="px-2.5 py-1 rounded bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-bold font-sans flex items-center gap-1 transition-all shadow-md shadow-purple-950/50"
            >
              Verify in Module 6 <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex items-center justify-between py-4 px-2">
        {/* Source Control Center */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 shadow-lg shadow-cyan-950/50">
            <Radio className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-300 font-bold">{sourceNode}</span>
          <span className="text-[9px] text-slate-500">Control Center</span>
        </div>

        {/* Transmission Link */}
        <div className="flex-1 relative mx-4 h-1.5 bg-slate-800 rounded-full flex items-center">
          <div
            className={`h-full transition-all duration-500 ${
              ackReceived ? 'bg-emerald-500' : 'bg-cyan-500'
            }`}
            style={{ width: isTransmitting || ackReceived ? '100%' : '30%' }}
          />

          {/* Forward Packet Motion */}
          {isTransmitting && (
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-ping p-1.5 rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/50 flex items-center gap-1 text-[9px] font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>{command}</span>
            </div>
          )}

          {/* Returning ACK Motion */}
          {ackReceived && (
            <div className="absolute top-1/2 -translate-y-1/2 right-4 p-1.5 rounded-full bg-emerald-400 text-slate-950 font-bold text-[9px] flex items-center gap-1 shadow-lg shadow-emerald-400/50 animate-bounce">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ACK OK</span>
            </div>
          )}
        </div>

        {/* Destination Substation RTU */}
        <div className="flex flex-col items-center gap-1 z-10">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 shadow-lg shadow-purple-950/50">
            <Cpu className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-slate-300 font-bold">{destinationNode}</span>
          <span className="text-[9px] text-slate-500">Substation RTU</span>
        </div>
      </div>
    </div>
  );
};
