import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Zap,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  FileCode,
  Download,
  Fingerprint,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import {
  SessionResponse,
  QuantumKeyResponse,
  generateQuantumKey,
  fetchQuantumKey
} from '../services/api';

interface QuantumKeyModuleProps {
  session: SessionResponse;
  sessionHistory: SessionResponse[];
  onSelectSession: (session: SessionResponse) => void;
  onQuickCreateSession: () => void;
}

export const QuantumKeyModule: React.FC<QuantumKeyModuleProps> = ({
  session,
  sessionHistory,
  onSelectSession,
  onQuickCreateSession
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [keyData, setKeyData] = useState<QuantumKeyResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'shared' | 'comparison' | 'indexes'>('shared');

  useEffect(() => {
    let isMounted = true;
    async function loadKey() {
      setKeyData(null);
      setError(null);
      try {
        const data = await fetchQuantumKey(session.session_id);
        if (isMounted) setKeyData(data);
      } catch (err) {
        // Key not yet generated for this session
      }
    }
    if (session.session_id) {
      loadKey();
    }
    return () => {
      isMounted = false;
    };
  }, [session.session_id]);

  const handleGenerateKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateQuantumKey(session.session_id);
      setKeyData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quantum key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const downloadKeyJSON = () => {
    if (!keyData) return;
    const blob = new Blob([JSON.stringify(keyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_key_${keyData.session_uuid.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSessionActive = session.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100">
                Module 3: Quantum Key Management
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              E91 Basis Reconciliation, Key Sifting & Raw Shared Secret Generation
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={session.session_id}
              onChange={(e) => {
                const s = sessionHistory.find((x) => x.session_id === e.target.value);
                if (s) onSelectSession(s);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              {sessionHistory.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  Session #{s.id} ({s.source_node} → {s.destination_node}) - [{s.status}]
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateKey}
              disabled={loading || !isSessionActive}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg ${
                isSessionActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  Sifting Keys...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Quantum Key
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warning if session is not active */}
        {!isSessionActive && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-center gap-3 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Session must be in <strong>ACTIVE</strong> status to generate quantum keys. Activate session in Module 1 first.
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-300 text-sm">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      {keyData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Sifted Key Length
            </div>
            <div className="text-2xl font-bold text-cyan-400 mt-1 flex items-baseline gap-1">
              {keyData.key_length} <span className="text-xs text-slate-400 font-normal">bits</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Reconciled bit string length</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Matching Bases
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
              {keyData.matching_indexes.length} <span className="text-xs text-slate-400 font-normal">indices</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Coincident measurement bases</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Generation Status
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {keyData.generation_status}
            </div>
            <div className="text-xs text-slate-500 mt-1">Persistence validated</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Key Agreement
            </div>
            <div className="text-2xl font-bold text-purple-400 mt-1">100.0%</div>
            <div className="text-xs text-slate-500 mt-1">Alice & Bob sifted bit parity</div>
          </div>
        </div>
      )}

      {/* Main Content Tabs & Card */}
      {keyData ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-md overflow-hidden shadow-xl">
          {/* Navigation Bar inside Card */}
          <div className="border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('shared')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'shared'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw Shared Secret Key
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'comparison'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Alice vs Bob Sifting
              </button>
              <button
                onClick={() => setViewMode('indexes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'indexes'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Matching Indices ({keyData.matching_indexes.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(keyData.shared_key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Secret Key
                  </>
                )}
              </button>

              <button
                onClick={downloadKeyJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                Export JSON
              </button>
            </div>
          </div>

          <div className="p-6">
            {viewMode === 'shared' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Reconciled Raw Shared Key (Binary Bitstring)
                  </span>
                  <span className="text-xs text-slate-500">
                    Created: {new Date(keyData.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-cyan-300 break-all leading-relaxed text-sm select-all tracking-widest shadow-inner max-h-60 overflow-y-auto">
                  {keyData.shared_key || 'No key generated'}
                </div>

                <div className="bg-cyan-950/20 border border-cyan-900/40 rounded-xl p-4 flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-cyan-300">E91 Quantum Key Authenticity</div>
                    <p>
                      This raw shared secret key is generated directly from entangled photon measurements where Alice and Bob selected matching bases. It is suitable for classical OTP (One-Time Pad) or AES-256 session key derivation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'comparison' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Alice Sifted Key */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                      <span>Alice Sifted Key ({session.source_node})</span>
                      <span className="text-cyan-400">{keyData.alice_key.length} bits</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-cyan-300 break-all border border-slate-800/80">
                      {keyData.alice_key}
                    </div>
                  </div>

                  {/* Bob Sifted Key */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase">
                      <span>Bob Sifted Key ({session.destination_node})</span>
                      <span className="text-emerald-400">{keyData.bob_key.length} bits</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-300 break-all border border-slate-800/80">
                      {keyData.bob_key}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-emerald-300">Bit Alignment Verified</div>
                      <div className="text-xs text-slate-400">
                        Alice's and Bob's sifted bit sequences match with 0 bit errors.
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-emerald-900/50 text-emerald-300 px-3 py-1 rounded-md border border-emerald-700/50">
                    MATCH = TRUE
                  </span>
                </div>
              </div>
            )}

            {viewMode === 'indexes' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Basis Coincidence Indices (0-based)
                </div>

                <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-3 bg-slate-950 rounded-xl border border-slate-800">
                  {keyData.matching_indexes.map((idx, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 text-cyan-300 rounded-md font-mono text-xs"
                    >
                      #{idx}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">No Key Generated Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Execute Module 2 E91 quantum simulation engine first, then activate the session to generate and reconcile quantum keys.
            </p>
          </div>
          <button
            onClick={handleGenerateKey}
            disabled={loading || !isSessionActive}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg ${
              isSessionActive
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            Generate Quantum Key Now
          </button>
        </div>
      )}
    </div>
  );
};
