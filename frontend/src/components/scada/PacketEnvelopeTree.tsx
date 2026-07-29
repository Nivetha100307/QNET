import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, Folder, ShieldCheck } from 'lucide-react';

interface PacketEnvelopeTreeProps {
  packetId: string;
  sessionId: string;
  sourceNode: string;
  destinationNode: string;
  sequenceNumber: number;
  nonce: string;
  ciphertext: string;
  tag: string;
  signature: string;
}

export const PacketEnvelopeTree: React.FC<PacketEnvelopeTreeProps> = ({
  packetId,
  sessionId,
  sourceNode,
  destinationNode,
  sequenceNumber,
  nonce,
  ciphertext,
  tag,
  signature
}) => {
  const [expandedHeader, setExpandedHeader] = useState<boolean>(true);
  const [expandedPayload, setExpandedPayload] = useState<boolean>(true);
  const [expandedSecurity, setExpandedSecurity] = useState<boolean>(true);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 font-sans">
            SCADA Packet Hierarchy Inspector
          </h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
          ID: {packetId || 'pkt_849201'}
        </span>
      </div>

      <div className="space-y-2 text-[11px]">
        {/* Header Node */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setExpandedHeader(!expandedHeader)}
            className="flex items-center gap-2 text-cyan-300 font-bold w-full text-left"
          >
            {expandedHeader ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Folder className="w-4 h-4 text-cyan-400" />
            <span>Packet Header & Routing</span>
          </button>
          {expandedHeader && (
            <div className="pl-6 pt-2 space-y-1 text-slate-400">
              <div>Session UUID: <span className="text-slate-200">{sessionId}</span></div>
              <div>Source Node: <span className="text-cyan-300 font-bold">{sourceNode}</span></div>
              <div>Destination Node: <span className="text-emerald-300 font-bold">{destinationNode}</span></div>
              <div>Monotonic Sequence: <span className="text-purple-300 font-bold">#{sequenceNumber}</span></div>
            </div>
          )}
        </div>

        {/* Payload Node */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setExpandedPayload(!expandedPayload)}
            className="flex items-center gap-2 text-amber-300 font-bold w-full text-left"
          >
            {expandedPayload ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Encrypted Command Payload</span>
          </button>
          {expandedPayload && (
            <div className="pl-6 pt-2 space-y-1 text-slate-400">
              <div>GCM Nonce: <span className="text-amber-300 break-all">{nonce || 'Waiting...'}</span></div>
              <div>AES-256-GCM Ciphertext: <span className="text-cyan-300 break-all">{ciphertext || 'Waiting...'}</span></div>
            </div>
          )}
        </div>

        {/* Security Node */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setExpandedSecurity(!expandedSecurity)}
            className="flex items-center gap-2 text-emerald-300 font-bold w-full text-left"
          >
            {expandedSecurity ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Folder className="w-4 h-4 text-emerald-400" />
            <span>Integrity & Authentication Signatures</span>
          </button>
          {expandedSecurity && (
            <div className="pl-6 pt-2 space-y-1 text-slate-400">
              <div>GCM Authentication Tag: <span className="text-emerald-400 break-all">{tag || 'Waiting...'}</span></div>
              <div>HMAC-SHA256 Signature: <span className="text-purple-300 break-all text-[10px]">{signature || 'Waiting...'}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
