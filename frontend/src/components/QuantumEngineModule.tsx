import React, { useState, useEffect } from 'react';
import {
  Atom,
  Cpu,
  Zap,
  Code,
  Terminal,
  CheckCircle2,
  Activity,
  FileText,
  BarChart3,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Play,
  PlusCircle,
  Layers
} from 'lucide-react';
import {
  SessionResponse,
  QuantumMeasurementResponse,
  startQuantumMeasurement,
  fetchQuantumMeasurement
} from '../services/api';

interface QuantumEngineModuleProps {
  session: SessionResponse;
  sessionHistory: SessionResponse[];
  onSelectSession: (session: SessionResponse) => void;
  onQuickCreateSession: () => void;
  onMeasurementExecuted?: () => void;
}

export const QuantumEngineModule: React.FC<QuantumEngineModuleProps> = ({
  session,
  sessionHistory,
  onSelectSession,
  onQuickCreateSession,
  onMeasurementExecuted
}) => {
  const [shots, setShots] = useState<number>(1024);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [measurement, setMeasurement] = useState<QuantumMeasurementResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'outcomes' | 'qasm' | 'circuit'>('outcomes');
  const [copied, setCopied] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const pageSize = 50;

  // Fetch initial measurement if already recorded for this session
  useEffect(() => {
    let isMounted = true;
    async function loadExisting() {
      setMeasurement(null);
      try {
        const data = await fetchQuantumMeasurement(session.session_id);
        if (isMounted) setMeasurement(data);
      } catch (err) {
        // Measurement not yet executed for this session
      }
    }
    if (session.session_id) {
      loadExisting();
    }
    return () => {
      isMounted = false;
    };
  }, [session.session_id]);

  const handleRunEngine = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await startQuantumMeasurement(session.session_id, shots);
      setMeasurement(result);
      setPage(1);
      if (onMeasurementExecuted) onMeasurementExecuted();
    } catch (err: any) {
      setError(err.message || 'Failed to execute quantum simulation engine');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute basis alignment statistics
  const stats = React.useMemo(() => {
    if (!measurement || !measurement.alice_basis || measurement.alice_basis.length === 0) {
      return null;
    }
    const total = measurement.alice_basis.length;
    let matchCount = 0;
    let matchingBitAgreement = 0;
    let zMatchCount = 0;
    let xMatchCount = 0;

    for (let i = 0; i < total; i++) {
      const aBasis = measurement.alice_basis[i];
      const bBasis = measurement.bob_basis[i];
      if (aBasis === bBasis) {
        matchCount++;
        if (aBasis === 'Z') zMatchCount++;
        if (aBasis === 'X') xMatchCount++;
        if (measurement.alice_bits[i] === measurement.bob_bits[i]) {
          matchingBitAgreement++;
        }
      }
    }

    const matchPercentage = ((matchCount / total) * 100).toFixed(1);
    const fidelity = matchCount > 0 ? ((matchingBitAgreement / matchCount) * 100).toFixed(1) : '0.0';

    return {
      total,
      matchCount,
      mismatchCount: total - matchCount,
      matchPercentage,
      zMatchCount,
      xMatchCount,
      matchingBitAgreement,
      fidelity
    };
  }, [measurement]);

  // Paginated outcomes table
  const paginatedRows = React.useMemo(() => {
    if (!measurement) return [];
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const rows = [];
    for (let i = start; i < Math.min(end, measurement.alice_basis.length); i++) {
      rows.push({
        index: i + 1,
        aliceBasis: measurement.alice_basis[i],
        bobBasis: measurement.bob_basis[i],
        basisMatched: measurement.alice_basis[i] === measurement.bob_basis[i],
        aliceBit: measurement.alice_bits[i],
        bobBit: measurement.bob_bits[i],
        bitMatched: measurement.alice_bits[i] === measurement.bob_bits[i]
      });
    }
    return rows;
  }, [measurement, page]);

  const totalPages = measurement ? Math.ceil(measurement.alice_basis.length / pageSize) : 1;

  const isTerminated = session.status === 'TERMINATED';

  return (
    <div className="space-y-6">
      {/* Session Selector & Quick Action Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Select Active Session:
          </span>
          <select
            value={session.session_id}
            onChange={(e) => {
              const selected = sessionHistory.find((s) => s.session_id === e.target.value);
              if (selected) onSelectSession(selected);
            }}
            className="bg-slate-950 text-cyan-300 font-mono text-sm px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-400"
          >
            {sessionHistory.map((s) => (
              <option key={s.session_id} value={s.session_id}>
                [{s.status}] {s.source_node} ➔ {s.destination_node} ({s.session_id.substring(0, 8)}...)
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onQuickCreateSession}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Quick Create New Active Session</span>
        </button>
      </div>

      {/* Terminated Warning Banner */}
      {isTerminated && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-amber-200 text-sm">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-semibold text-amber-300">Session {session.session_id.substring(0, 8)}... is TERMINATED.</span>
              <p className="text-xs text-amber-200/80">
                Quantum Engine cannot run on a terminated session. Click the button on the right to instantly create a new active session!
              </p>
            </div>
          </div>
          <button
            onClick={onQuickCreateSession}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-lg shadow-lg transition flex-shrink-0 flex items-center space-x-1.5"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Create New Active Session</span>
          </button>
        </div>
      )}

      {/* Top Banner & Control Panel */}
      <div className="bg-slate-900/80 backdrop-blur border border-cyan-500/30 rounded-xl p-6 shadow-xl shadow-cyan-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
                <Atom className={`w-6 h-6 ${loading ? 'animate-spin text-cyan-300' : ''}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  Module 2: E91 Quantum Measurement Engine
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                    {measurement ? measurement.execution_backend : 'AerSimulator Ready'}
                  </span>
                </h2>
                <p className="text-sm text-slate-400">
                  Simulate Bell State (|Φ+⟩) entanglement and execute basis measurements for QKD session{' '}
                  <span className="font-mono text-cyan-400">{session.session_id.substring(0, 8)}...</span> ({session.source_node} ➔ {session.destination_node})
                </p>
              </div>
            </div>
          </div>

          {/* Engine Execution Inputs */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Shots Count:
              </label>
              <select
                value={shots}
                onChange={(e) => setShots(Number(e.target.value))}
                disabled={loading || isTerminated}
                className="bg-slate-900 text-cyan-300 text-sm font-mono px-3 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-cyan-500"
              >
                <option value={64}>64 Shots</option>
                <option value={256}>256 Shots</option>
                <option value={1024}>1024 Shots (Default)</option>
                <option value={4096}>4096 Shots</option>
                <option value={10000}>10000 Shots (Max)</option>
              </select>
            </div>

            <button
              onClick={handleRunEngine}
              disabled={loading || isTerminated}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 shadow-xl ${
                isTerminated
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : loading
                  ? 'bg-cyan-600/50 text-cyan-200 border border-cyan-400/30 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 border border-cyan-300/60 shadow-cyan-500/30 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Simulating Quantum Circuit...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Quantum Engine</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message alert */}
        {error && (
          <div className="mt-4 p-3 bg-red-950/80 border border-red-500/50 rounded-lg flex items-center space-x-3 text-red-300 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analytics Summary Cards (when measurement is available) */}
      {measurement && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
            <div className="p-3 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Bell Pairs / Shots</div>
              <div className="text-2xl font-bold font-mono text-slate-100">{stats.total}</div>
              <div className="text-xs text-cyan-400 font-mono">Backend: {measurement.execution_backend}</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Basis Matching Ratio</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{stats.matchPercentage}%</div>
              <div className="text-xs text-slate-400">
                {stats.matchCount} matched / {stats.mismatchCount} discarded
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Entanglement Fidelity</div>
              <div className="text-2xl font-bold font-mono text-blue-400">{stats.fidelity}%</div>
              <div className="text-xs text-slate-400">
                {stats.matchingBitAgreement} / {stats.matchCount} bit agreement
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Simulation Time</div>
              <div className="text-2xl font-bold font-mono text-purple-300">{measurement.simulation_time_ms} ms</div>
              <div className="text-xs text-purple-400 font-mono">Qiskit Aer Execution</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Results Tabs & Viewer */}
      {measurement ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Tab Headers */}
          <div className="flex border-b border-slate-800 bg-slate-950/60">
            <button
              onClick={() => setActiveTab('outcomes')}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'outcomes'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Raw Measurement Outcomes</span>
            </button>

            <button
              onClick={() => setActiveTab('qasm')}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'qasm'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>OpenQASM 2.0 Circuit</span>
            </button>

            <button
              onClick={() => setActiveTab('circuit')}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold text-sm transition-colors border-b-2 ${
                activeTab === 'circuit'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Text Circuit Diagram</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'outcomes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Showing shots <span className="font-mono text-cyan-400">{(page - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-mono text-cyan-400">
                      {Math.min(page * pageSize, measurement.alice_basis.length)}
                    </span>{' '}
                    of <span className="font-mono text-cyan-400">{measurement.alice_basis.length}</span>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-mono text-slate-400">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Outcomes Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                        <th className="p-3">Shot #</th>
                        <th className="p-3">Alice Basis</th>
                        <th className="p-3">Bob Basis</th>
                        <th className="p-3">Basis Match</th>
                        <th className="p-3">Alice Bit</th>
                        <th className="p-3">Bob Bit</th>
                        <th className="p-3">Sifting Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm font-mono">
                      {paginatedRows.map((row) => (
                        <tr key={row.index} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-slate-400">#{row.index}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              row.aliceBasis === 'Z' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              Basis {row.aliceBasis}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              row.bobBasis === 'Z' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              Basis {row.bobBasis}
                            </span>
                          </td>
                          <td className="p-3">
                            {row.basisMatched ? (
                              <span className="text-xs text-emerald-400 font-sans flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>MATCH</span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 font-sans">DISCARDED</span>
                            )}
                          </td>
                          <td className="p-3 text-cyan-300 font-bold">{row.aliceBit}</td>
                          <td className="p-3 text-cyan-300 font-bold">{row.bobBit}</td>
                          <td className="p-3">
                            {row.basisMatched ? (
                              row.bitMatched ? (
                                <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  KEY BIT PASSED ({row.aliceBit})
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  BIT MISMATCH
                                </span>
                              )
                            ) : (
                              <span className="text-slate-600 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'qasm' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">OpenQASM 2.0 Representation</span>
                  <button
                    onClick={() => copyToClipboard(measurement.circuit_qasm || '')}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto leading-relaxed shadow-inner">
                  {measurement.circuit_qasm || '// OpenQASM code unavailable'}
                </pre>
              </div>
            )}

            {activeTab === 'circuit' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">Qiskit Text Circuit Diagram</span>
                  <button
                    onClick={() => copyToClipboard(measurement.circuit_diagram || '')}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Diagram'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre shadow-inner">
                  {measurement.circuit_diagram || 'Circuit diagram unavailable'}
                </pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="p-4 bg-cyan-500/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-cyan-400">
            <Atom className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">No Quantum Measurements Executed Yet</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
              Click <span className="text-cyan-400 font-semibold">"Run Quantum Engine"</span> above to simulate E91 Bell-pair generation, basis measurement, and raw bit outcome generation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
