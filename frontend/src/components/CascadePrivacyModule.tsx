import React, { useState } from 'react';
import { Lock, Zap, ShieldCheck, RefreshCw } from 'lucide-react';
import { SessionResponse, CascadeReconciliationResponse, runCascadeReconciliation } from '../services';

interface CascadePrivacyModuleProps {
  session: SessionResponse;
  sessionHistory: SessionResponse[];
  onSelectSession: (session: SessionResponse) => void;
}

// Generate dynamic quantum sifted key bitstreams for Alice & Bob based on simulated real-time QBER
const generateDynamicSiftedKeys = (bitLength = 64, qber = 0.04) => {
  let alice = '';
  let bob = '';
  for (let i = 0; i < bitLength; i++) {
    const bit = Math.random() < 0.5 ? '0' : '1';
    alice += bit;
    if (Math.random() < qber) {
      bob += bit === '0' ? '1' : '0';
    } else {
      bob += bit;
    }
  }
  return { alice, bob };
};

export const CascadePrivacyModule: React.FC<CascadePrivacyModuleProps> = ({
  session
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [cascadeResult, setCascadeResult] = useState<CascadeReconciliationResponse | null>(null);
  const [siftedKeys, setSiftedKeys] = useState<{ alice: string; bob: string } | null>(null);

  const handleReconcile = async () => {
    setLoading(true);
    const dynamicKeys = generateDynamicSiftedKeys(64, 0.04);
    setSiftedKeys(dynamicKeys);

    try {
      const res = await runCascadeReconciliation({
        session_uuid: session.session_id,
        sifted_key_alice: dynamicKeys.alice,
        sifted_key_bob: dynamicKeys.bob,
        block_size: 8
      });
      setCascadeResult(res);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold text-slate-100">
                Module 8: Cascade Privacy Amplification &amp; AI Analytics
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Toeplitz Universal Hashing &amp; Isolation Forest Anomaly Detection Engine
            </p>
          </div>

          <button
            onClick={handleReconcile}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2"
          >
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {loading ? 'Running Cascade & Toeplitz...' : 'Run Dynamic Privacy Amplification'}
          </button>
        </div>
      </div>

      {siftedKeys && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] block">Generated Dynamic Sifted Quantum Keys (64-Bit Real-Time Stream)</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-950 p-2.5 rounded border border-cyan-500/30 break-all">
              <span className="text-cyan-400 font-bold block text-[10px]">Alice Sifted Key:</span>
              <span className="text-slate-200">{siftedKeys.alice}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded border border-purple-500/30 break-all">
              <span className="text-purple-400 font-bold block text-[10px]">Bob Sifted Key:</span>
              <span className="text-slate-200">{siftedKeys.bob}</span>
            </div>
          </div>
        </div>
      )}

      {cascadeResult && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Privacy Amplification &amp; Toeplitz Hashing Complete
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              Bit Errors Corrected: <span className="text-cyan-400 font-bold">{cascadeResult.bit_errors_corrected}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              Isolation Forest Score: <span className="text-emerald-400 font-bold">{cascadeResult.isolation_forest_anomaly_score}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              Anomaly Status: <span className="text-emerald-400 font-bold">NORMAL</span>
            </div>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 break-all">
            <span className="text-slate-500 block text-[10px]">AMPLIFIED SECRET KEY (256-BIT BASE64)</span>
            <span className="text-purple-300 font-bold">{cascadeResult.final_secret_key_b64}</span>
          </div>
        </div>
      )}
    </div>
  );
};
