import React from 'react';
import { FileCode, Clock, Hash, Lock, Check } from 'lucide-react';

interface PacketInspectorProps {
  packetId?: string;
  sequenceNumber?: number;
  nonce?: string;
  hmacSignature?: string;
  timestampDriftSec?: number;
}

export const PacketInspector: React.FC<PacketInspectorProps> = ({
  packetId = 'pkt_849201',
  sequenceNumber = 12,
  nonce = 'qZ4kL8pW0a==',
  hmacSignature = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  timestampDriftSec = 0.42
}) => {
  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-200 font-bold font-sans">Live Packet Inspector</span>
        </div>
        <span className="text-[10px] text-cyan-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          ID: {packetId}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-slate-500 block text-[10px]">MONOTONIC SEQ</span>
          <span className="text-cyan-300 font-bold">#{sequenceNumber}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">TIMESTAMP DRIFT</span>
          <span className="text-emerald-400 font-bold">+{timestampDriftSec}s (Strict &le;5s)</span>
        </div>
      </div>

      <div>
        <span className="text-slate-500 block text-[10px]">GCM NONCE (BASE64)</span>
        <span className="text-amber-300 break-all">{nonce}</span>
      </div>

      <div>
        <span className="text-slate-500 block text-[10px]">HMAC-SHA256 SIGNATURE</span>
        <span className="text-purple-300 break-all text-[10px]">{hmacSignature}</span>
      </div>
    </div>
  );
};
