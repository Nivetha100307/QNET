import React from 'react';
import { Lock, Hash, Key, Clock, ShieldCheck, Copy, Check } from 'lucide-react';

interface EncryptionInspectorProps {
  ciphertext: string;
  nonce: string;
  tag: string;
  signature: string;
  encryptionTimeMs?: number;
}

export const EncryptionInspector: React.FC<EncryptionInspectorProps> = ({
  ciphertext,
  nonce,
  tag,
  signature,
  encryptionTimeMs = 14
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 font-sans">
            Cryptographic Encryption Inspector
          </h3>
        </div>
        <span className="text-[10px] text-cyan-400 font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {encryptionTimeMs} ms
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">HKDF SALT</span>
          <span className="text-purple-300 font-bold">QNetSecure_SCADA_Salt</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">ITERATIONS</span>
          <span className="text-cyan-300 font-bold">1,000 Iterations (32-byte DK)</span>
        </div>
      </div>

      <div className="space-y-3 text-[11px]">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">AES-256-GCM NONCE (96-BIT BASE64)</span>
          <span className="text-amber-300 font-bold break-all">{nonce || 'Waiting...'}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">AUTHENTICATION TAG (128-BIT BASE64)</span>
          <span className="text-emerald-400 font-bold break-all">{tag || 'Waiting...'}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">AES-256-GCM CIPHERTEXT</span>
          <span className="text-cyan-300 font-bold break-all">{ciphertext || 'Waiting for encryption...'}</span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-500 block text-[10px] font-sans">HMAC-SHA256 SIGNATURE</span>
          <span className="text-purple-300 font-bold break-all text-[10px]">{signature || 'Waiting...'}</span>
        </div>
      </div>
    </div>
  );
};
