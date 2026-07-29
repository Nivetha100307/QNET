import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Activity,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Download,
  Award,
  BarChart2,
  Gauge,
  Grid,
  Clock,
  Layers
} from 'lucide-react';
import {
  SessionResponse,
  SecurityAnalysisResponse,
  analyzeSecurity,
  fetchSecurityReport,
  subscribeToWebsocket
} from '../services/api';

interface QuantumSecurityDashboardProps {
  session: SessionResponse;
  sessionHistory: SessionResponse[];
  onSelectSession: (session: SessionResponse) => void;
  onQuickCreateSession: () => void;
}

export const QuantumSecurityDashboard: React.FC<QuantumSecurityDashboardProps> = ({
  session,
  sessionHistory,
  onSelectSession,
  onQuickCreateSession
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SecurityAnalysisResponse | null>(null);
  const [liveLogs, setLiveLogs] = useState<{ timestamp: string; event: string; details: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      setReport(null);
      setError(null);
      try {
        const data = await fetchSecurityReport(session.session_id);
        if (isMounted) setReport(data);
      } catch (err) {
        // Report not yet generated for this session
      }
    }
    if (session.session_id) {
      loadReport();
    }

    const unsubscribe = subscribeToWebsocket((msg) => {
      if (msg.session_id === session.session_id || msg.data?.session_id === session.session_id) {
        const timestamp = new Date().toLocaleTimeString();
        if (msg.event === 'SECURITY_ANALYSIS_STARTED') {
          setLiveLogs((prev) => [{ timestamp, event: 'ANALYSIS_STARTED', details: 'Initializing quantum security engine...' }, ...prev]);
        } else if (msg.event === 'BELL_TEST_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'BELL_TEST_COMPLETED', details: 'Bell correlation matrix calculated.' }, ...prev]);
        } else if (msg.event === 'CHSH_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'CHSH_COMPLETED', details: `CHSH S = ${msg.chsh_value?.toFixed(3)} (${msg.bell_test_result})` }, ...prev]);
        } else if (msg.event === 'QBER_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'QBER_COMPLETED', details: `QBER = ${(msg.qber * 100).toFixed(2)}%` }, ...prev]);
        } else if (msg.event === 'FIDELITY_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'FIDELITY_COMPLETED', details: `Estimated Fidelity = ${msg.fidelity?.toFixed(3)}` }, ...prev]);
        } else if (msg.event === 'SECURITY_REPORT_READY') {
          setLiveLogs((prev) => [{ timestamp, event: 'REPORT_READY', details: `Security Status: ${msg.security_status} (Score ${msg.security_score}/100)` }, ...prev]);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [session.session_id]);

  const handleRunSecurityAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeSecurity(session.session_id);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to execute quantum security analysis');
    } finally {
      setLoading(false);
    }
  };

  const downloadReportJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_security_report_${report.session_uuid.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSessionActive = session.status === 'ACTIVE';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SECURE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> SECURE
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> WARNING
          </span>
        );
      case 'COMPROMISED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
            <ShieldX className="w-4 h-4 text-rose-400" /> COMPROMISED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-100">
                Module 4: Quantum Security Monitor
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              CHSH Entanglement Test, QBER Error Ratio, State Fidelity & Security Decision Engine
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={session.session_id}
              onChange={(e) => {
                const s = sessionHistory.find((x) => x.session_id === e.target.value);
                if (s) onSelectSession(s);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {sessionHistory.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  Session #{s.id} ({s.source_node} → {s.destination_node}) - [{s.status}]
                </option>
              ))}
            </select>

            <button
              onClick={handleRunSecurityAnalysis}
              disabled={loading || !isSessionActive}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-lg ${
                isSessionActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  Analyzing Quantum Channel...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Run Security Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {!isSessionActive && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg flex items-center gap-3 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Session must be in <strong>ACTIVE</strong> status with completed key sifting to run security analysis.
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-950/50 border border-rose-800 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-sm">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Security Metrics Dashboard Grid */}
      {report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Security Status & Score */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Security Status
                </span>
                {getStatusBadge(report.security_status)}
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-100">{report.security_score}</span>
                  <span className="text-xs text-slate-400">/ 100 Score</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full mt-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      report.security_score >= 80
                        ? 'bg-emerald-400'
                        : report.security_score >= 60
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, report.security_score))}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">Evaluated via Decision Engine</div>
            </div>

            {/* CHSH Parameter */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  CHSH Parameter (S)
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                  report.bell_test_result === 'PASS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {report.bell_test_result}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-cyan-400 mt-2">
                {report.chsh_value.toFixed(3)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Classical Limit: ≤ 2.0 | Max Quantum: 2.828
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (Math.abs(report.chsh_value) / 2.8284) * 100)}%` }}
                />
              </div>
            </div>

            {/* QBER Progress Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
              <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Quantum Bit Error Rate (QBER)
              </div>
              <div className="text-3xl font-extrabold text-amber-400 mt-2">
                {(report.qber * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-slate-400 mt-1">
                QKD Threshold: ≤ 11.0%
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    report.qber <= 0.11 ? 'bg-emerald-400' : report.qber <= 0.15 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, (report.qber / 0.20) * 100)}%` }}
                />
              </div>
            </div>

            {/* Quantum State Fidelity */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md">
              <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                State Fidelity (F)
              </div>
              <div className="text-3xl font-extrabold text-purple-400 mt-2">
                {report.fidelity.toFixed(3)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Bell Purity: {report.fidelity >= 0.85 ? 'HIGH' : report.fidelity >= 0.70 ? 'MODERATE' : 'LOW'}
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-purple-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, report.fidelity * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Bell Correlation Matrix Heatmap & Report Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bell Correlation Matrix Table */}
            <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Grid className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-semibold text-slate-200">
                    Measured Bell Correlation Matrix E(a,b)
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {report.measurement_count} total shots
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(report.bell_correlations || { ZZ: 0.98, ZX: -0.71, XZ: 0.70, XX: 0.97 }).map(([pair, val]) => (
                  <div
                    key={pair}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center space-y-2"
                  >
                    <div className="text-xs font-mono text-slate-400 font-semibold uppercase">
                      Basis Pair ({pair[0]} - {pair[1]})
                    </div>
                    <div className={`text-2xl font-bold font-mono ${
                      val > 0.5 ? 'text-emerald-400' : val < -0.5 ? 'text-cyan-400' : 'text-amber-300'
                    }`}>
                      {val > 0 ? `+${val.toFixed(3)}` : val.toFixed(3)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Expectation Value E
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-center justify-between">
                <span>Analysis Duration: <strong>{report.analysis_time_ms} ms</strong></span>
                <button
                  onClick={downloadReportJSON}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Export Full Security JSON
                </button>
              </div>
            </div>

            {/* Live Event Timeline */}
            <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-semibold text-slate-200">
                    Live Security Analysis Log
                  </h3>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {liveLogs.length > 0 ? (
                    liveLogs.map((log, i) => (
                      <div key={i} className="text-xs border-l-2 border-emerald-500/60 pl-3 py-1 space-y-0.5">
                        <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                          <span>{log.event}</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="text-slate-200">{log.details}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 text-center py-8">
                      Ready. Trigger analysis above to stream live WebSocket events.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!report && (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">No Security Report Generated Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Execute Module 2 E91 quantum simulation engine and Module 3 key sifting first, then click below to run full security validation.
            </p>
          </div>
          <button
            onClick={handleRunSecurityAnalysis}
            disabled={loading || !isSessionActive}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg ${
              isSessionActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            Run Security Analysis Now
          </button>
        </div>
      )}
    </div>
  );
};
