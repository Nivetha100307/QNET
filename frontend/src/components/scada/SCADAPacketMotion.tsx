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
  const targetNodes = React.useMemo(() => {
    if (destinationNode && destinationNode.includes(',')) {
      return destinationNode.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [destinationNode || 'Substation_A'];
  }, [destinationNode]);

  const isMultiNode = targetNodes.length > 1;

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-slate-400 font-sans font-semibold">
          {isMultiNode ? `Live GHZ SCADA Broadcast (${targetNodes.length} Nodes)` : 'Live SCADA Packet & ACK Transport Motion'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-purple-400 font-bold">{isMultiNode ? 'GHZ Group Link' : 'Quantum E91 Link'}</span>
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

      <div className="space-y-3 pt-1">
        {targetNodes.map((destNode, idx) => {
          const latency = 15 + idx * 7;
          return (
            <div key={`motion-${destNode}`} className="relative flex items-center justify-between py-2 px-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
              {/* Source Control Center */}
              <div className="flex items-center gap-2 z-10 min-w-[120px]">
                <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-200 font-bold block">{sourceNode}</span>
                  <span className="text-[8px] text-slate-500 block">Control HQ</span>
                </div>
              </div>

              {/* Transmission Link */}
              <div className="flex-1 relative mx-3 h-1.5 bg-slate-800 rounded-full flex items-center">
                <div
                  className={`h-full transition-all duration-500 ${
                    ackReceived ? 'bg-emerald-500' : 'bg-cyan-500'
                  }`}
                  style={{ width: isTransmitting || ackReceived ? '100%' : '30%' }}
                />

                {/* Forward Packet Motion */}
                {isTransmitting && (
                  <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-ping p-1 rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/50 flex items-center gap-1 text-[8px] font-bold">
                    <Zap className="w-3 h-3" />
                    <span>{command}</span>
                  </div>
                )}

                {/* Returning ACK Motion */}
                {ackReceived && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-full bg-emerald-400 text-slate-950 font-bold text-[8px] flex items-center gap-1 shadow-lg shadow-emerald-400/50 animate-bounce">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>ACK {latency}ms</span>
                  </div>
                )}
              </div>

              {/* Destination Substation RTU */}
              <div className="flex items-center gap-2 z-10 min-w-[120px] justify-end">
                <div className="text-right">
                  <span className="text-[10px] text-slate-200 font-bold block">{destNode}</span>
                  <span className="text-[8px] text-slate-500 block">Substation RTU</span>
                </div>
                <div className="p-1.5 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
