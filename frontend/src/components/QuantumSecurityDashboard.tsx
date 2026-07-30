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
  Grid,
  Clock,
  ArrowRight,
  Lock,
  Layers,
  HelpCircle,
  FileCode,
  Check,
  X
} from 'lucide-react';
import {
  SessionResponse,
  SecurityAnalysisResponse,
  analyzeSecurity,
  fetchSecurityReport,
  EventBus
} from '../services';

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
  const [repeaterRestored, setRepeaterRestored] = useState<boolean>(false);

  const handleRestoreViaRepeater = async () => {
    setLoading(true);
    try {
      // Simulate Module 7 Entanglement Swapping & BSM Restoration
      await new Promise((res) => setTimeout(res, 800));
      if (report) {
        setReport({
          ...report,
          chsh_value: 2.63,
          qber: 0.035,
          fidelity: 0.965,
          bell_test_result: 'PASS',
          security_status: 'Quantum Channel Verified',
          security_score: 92,
          bell_correlations: {
            ...(report.bell_correlations as any),
            gamma: 0.93,
            correlations: { a1b1: 0.93, a1b2: -0.93, a2b1: 0.93, a2b2: 0.93 }
          } as any
        });
        setRepeaterRestored(true);
      }
    } catch (err: any) {
      setError('Failed to restore entanglement via Module 7 quantum repeaters');
    } finally {
      setLoading(false);
    }
  };

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

    const unsubscribe = EventBus.on('*', (msgData: any) => {
      const msg = msgData.data || msgData;
      const eventName = msgData.event || msg.event;
      if (msg.session_id === session.session_id || msg.session_uuid === session.session_id) {
        const timestamp = new Date().toLocaleTimeString();
        if (eventName === 'SECURITY_ANALYSIS_STARTED') {
          setLiveLogs((prev) => [{ timestamp, event: 'ANALYSIS_STARTED', details: 'Initializing E91 Physical Quantum Channel Engine...' }, ...prev]);
        } else if (eventName === 'BELL_TEST_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'COINCIDENCE_COMPLETED', details: 'Photon coincidence counts & Bell correlation matrix calculated.' }, ...prev]);
        } else if (eventName === 'CHSH_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'CHSH_EVALUATED', details: `CHSH S = ${msg.chsh_value?.toFixed(3)} (${msg.bell_test_result})` }, ...prev]);
        } else if (eventName === 'QBER_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'QBER_CHECKED', details: `QBER = ${(msg.qber * 100).toFixed(2)}%` }, ...prev]);
        } else if (eventName === 'FIDELITY_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'FIDELITY_ESTIMATED', details: `Depolarizing Fidelity F = ${(msg.fidelity * 100).toFixed(1)}%` }, ...prev]);
        } else if (eventName === 'SECURITY_REPORT_READY') {
          setLiveLogs((prev) => [{ timestamp, event: 'REPORT_READY', details: `Protocol Decision: ${msg.security_status} (Score ${msg.security_score}/100)` }, ...prev]);
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
      setError(err.message || 'Failed to execute E91 quantum security analysis');
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
    a.download = `e91_security_report_${report.session_uuid.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isSessionActive = session.status === 'ACTIVE';

  // Extract coincidence measurement matrix
  const coincidencesData = report?.bell_correlations?.coincidences || {
    a1b1: { n_plus_plus: 487, n_plus_minus: 16, n_minus_plus: 12, n_minus_minus: 485, total_coincidences: 1000, expectation: 0.944 },
    a1b2: { n_plus_plus: 18, n_plus_minus: 479, n_minus_plus: 482, n_minus_minus: 21, total_coincidences: 1000, expectation: -0.922 },
    a2b1: { n_plus_plus: 490, n_plus_minus: 14, n_minus_plus: 11, n_minus_minus: 485, total_coincidences: 1000, expectation: 0.950 },
    a2b2: { n_plus_plus: 486, n_plus_minus: 15, n_minus_plus: 14, n_minus_minus: 485, total_coincidences: 1000, expectation: 0.942 }
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('Verified')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.3)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> QUANTUM CHANNEL VERIFIED
        </span>
      );
    } else if (status.includes('Degraded')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> QUANTUM CHANNEL DEGRADED
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(244,63,94,0.3)]">
          <ShieldX className="w-4 h-4 text-rose-400 animate-pulse" /> QUANTUM CHANNEL REJECTED
        </span>
      );
    }
  };

  const isGate1Pass = report ? report.bell_test_result === 'PASS' && Math.abs(report.chsh_value) > 2.0 : false;
  const isGate2Pass = report ? report.qber < 0.11 : false;
  const isChannelVerified = report ? report.security_status.includes('Verified') : false;
  const isChannelRejected = report ? report.security_status.includes('Rejected') || !isGate1Pass : false;

  const pipelineSteps = [
    'Environmental Conditions',
    'Bell Pair Source',
    'Alice & Bob Random Basis Selection',
    'Coincidence Measurement Matrix',
    'Expectation Values',
    'CHSH Computation',
    'Bell Test',
    'QBER Analysis',
    'Fidelity Assessment',
    'E91 Protocol Decision',
    'Shared Secret Key',
    'Module 5 Secure SCADA Authorization'
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                  Module 4: E91 Quantum Security Monitor &amp; Decision Engine
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Unified Physical Channel Simulation: Environmental Inputs $\rightarrow$ Bell Coincidences $\rightarrow$ CHSH $\rightarrow$ QBER $\rightarrow$ Fidelity $\rightarrow$ Decision Engine
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={session.session_id}
              onChange={(e) => {
                const s = sessionHistory.find((x) => x.session_id === e.target.value);
                if (s) onSelectSession(s);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg ${
                isSessionActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" />
                  Running Quantum Physics Pipeline...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-emerald-300" />
                  Run E91 Security Pipeline
                </>
              )}
            </button>
          </div>
        </div>

        {!isSessionActive && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center gap-3 text-amber-300 text-xs font-mono">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              Session must be in <strong>ACTIVE</strong> status with completed key sifting to execute Module 4 security analysis.
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-950/50 border border-rose-800 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-xs font-mono">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* NETWORK HEALTH OVERVIEW CARD & EDUCATIONAL TOOLTIP */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              SCADA Progressive Quantum Network Health Overview
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 group relative cursor-pointer">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="underline decoration-cyan-500/40">Physics Simulation Guide</span>
            {/* Tooltip Hover Box */}
            <div className="absolute right-0 top-6 w-80 p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-slate-300 text-[11px] font-sans shadow-2xl z-50 hidden group-hover:block">
              This simulation demonstrates progressive degradation of quantum entanglement due to fiber attenuation and environmental noise. Long-distance channels require Quantum Repeaters and Bell State Measurements to restore end-to-end entanglement.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          {/* Substation A */}
          <div
            onClick={() => {
              const target = sessionHistory.find((s) => s.destination_node === 'Substation_A');
              if (target) onSelectSession(target);
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              session.destination_node === 'Substation_A'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-sans font-bold">SUBSTATION A (15 km)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-emerald-400 font-bold flex items-center justify-between text-xs">
              <span>🟢 Excellent</span>
              <span className="text-[10px] text-slate-400">S ≈ 2.77</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-sans">QBER: 1.0% | Score: 98</span>
          </div>

          {/* Substation B */}
          <div
            onClick={() => {
              const target = sessionHistory.find((s) => s.destination_node === 'Substation_B');
              if (target) onSelectSession(target);
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              session.destination_node === 'Substation_B'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-sans font-bold">SUBSTATION B (30 km)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-emerald-400 font-bold flex items-center justify-between text-xs">
              <span>🟢 Healthy</span>
              <span className="text-[10px] text-slate-400">S ≈ 2.60</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-sans">QBER: 4.0% | Score: 90</span>
          </div>

          {/* Substation C */}
          <div
            onClick={() => {
              const target = sessionHistory.find((s) => s.destination_node === 'Substation_C');
              if (target) onSelectSession(target);
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              session.destination_node === 'Substation_C'
                ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-sans font-bold">SUBSTATION C (50 km)</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="text-amber-400 font-bold flex items-center justify-between text-xs">
              <span>🟡 Degraded</span>
              <span className="text-[10px] text-slate-400">S ≈ 2.32</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-sans">QBER: 9.0% | Score: 78</span>
          </div>

          {/* Substation D */}
          <div
            onClick={() => {
              const target = sessionHistory.find((s) => s.destination_node === 'Substation_D');
              if (target) onSelectSession(target);
            }}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              session.destination_node === 'Substation_D'
                ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-slate-400 font-sans font-bold">SUBSTATION D (80 km)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div className="text-rose-400 font-bold flex items-center justify-between text-xs">
              <span>🔴 Repeater Req.</span>
              <span className="text-[10px] text-slate-400">S &lt; 2.0</span>
            </div>
            <span className="text-[10px] text-slate-500 block mt-1 font-sans">QBER: &gt;11% | Score: &lt;50</span>
          </div>
        </div>
      </div>

      {/* STEP 9: COMPLETE 12-STAGE PIPELINE FLOW HEADER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            E91 Physical Security Pipeline Progression
          </span>
          <span className="text-[10px] text-slate-500 font-mono">12 Sequential Quantum Stages</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 py-1 text-[11px] font-mono">
          {pipelineSteps.map((stepName, idx) => (
            <React.Fragment key={idx}>
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border whitespace-nowrap ${
                report
                  ? isChannelRejected && idx >= 9
                    ? 'bg-rose-950/50 text-rose-300 border-rose-800/80'
                    : 'bg-slate-950 text-cyan-300 border-slate-800'
                  : 'bg-slate-950/60 text-slate-400 border-slate-800/60'
              }`}>
                <span className="text-[9px] w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <span>{stepName}</span>
              </div>
              {idx < pipelineSteps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-700 shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main E91 Visual Security Pipeline Layout */}
      {report && (
        <div className="space-y-6">
          {/* Top Banner: Protocol Decision & Bell Test Badge */}
          <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-500 ${
            isChannelRejected
              ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
              : 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl border font-extrabold text-lg flex items-center gap-2 ${
                isGate1Pass
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]'
              }`}>
                <span>GATE 1 BELL TEST:</span>
                <span className="font-mono uppercase">{report.bell_test_result}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 uppercase">E91 Protocol Decision:</span>
                  {getStatusBadge(report.security_status)}
                </div>
                <div className="text-xs text-slate-300 font-mono mt-1">
                  CHSH S = <strong>{report.chsh_value.toFixed(3)}</strong> | QBER = <strong className={isGate2Pass ? 'text-emerald-400' : 'text-rose-400'}>{(report.qber * 100).toFixed(2)}%</strong> {isGate2Pass ? '(Pass)' : '(Exceeds 11% Limit)'} | Fidelity = <strong>{(report.fidelity * 100).toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <button
                onClick={downloadReportJSON}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-right">
                <span className="text-[10px] text-slate-500 block">WEIGHTED SECURITY SCORE</span>
                <span className={`text-2xl font-extrabold ${report.security_score >= 80 ? 'text-emerald-400' : report.security_score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {report.security_score} <span className="text-xs text-slate-500">/ 100</span>
                </span>
              </div>
            </div>
          </div>

          {/* SUBSTATION C WARNING BANNER */}
          {(session.destination_node === 'Substation_C' || report.security_status.includes('Degraded')) && !repeaterRestored && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/60 text-amber-300 text-xs font-mono flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                <div>
                  <span className="font-bold block text-sm">Channel Approaching Operational Limit</span>
                  <span className="text-[11px] text-amber-200/80 font-sans">
                    High optical attenuation over 50 km (Substation C). Entanglement visibility degraded, but key generation remains operational.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SUBSTATION D / REJECTION MODULE 7 REPEATER RESTORATION BANNER */}
          {isChannelRejected && !repeaterRestored && (
            <div className="p-5 rounded-2xl bg-rose-950/60 border border-rose-500/80 text-rose-200 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-extrabold text-sm block text-rose-100">
                    Long-Distance Attenuation Detected (80 km) — Quantum Repeaters Required
                  </span>
                  <span className="text-xs text-rose-300/90 font-sans mt-0.5 block">
                    Recommendation: Activate Module 7 Quantum Repeaters to perform BSM entanglement swapping and restore end-to-end security.
                  </span>
                </div>
              </div>

              <button
                onClick={handleRestoreViaRepeater}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 whitespace-nowrap flex items-center gap-2 border border-emerald-400/40 transition-all shrink-0"
              >
                <Zap className="w-4 h-4 text-emerald-300" />
                Restore via Module 7
              </button>
            </div>
          )}

          {/* MODULE 7 RESTORATION SUCCESS ALERT */}
          {repeaterRestored && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center gap-3 shadow-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-sm text-emerald-300 block">Entanglement Restored Using Quantum Repeaters</span>
                <span className="text-[11px] font-sans text-emerald-200/90">
                  Module 7 Bell State Measurements (BSM) successfully swapped entanglement across intermediate repeater nodes. S = 2.63, QBER = 3.5%, Security Score = 92/100.
                </span>
              </div>
            </div>
          )}

          {/* STAGE 1: Environmental & Hardware Inputs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  Environmental &amp; Optical Hardware Conditions
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20 font-bold">
                Channel Visibility γ = {(report.bell_correlations as any)?.gamma || (1.0 - report.qber * 2.0).toFixed(4)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">FIBER DISTANCE</span>
                <span className="text-cyan-300 font-bold text-sm">
                  {(report.bell_correlations as any)?.environmental?.distance_km || 20} km
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">FIBER ATTENUATION</span>
                <span className="text-slate-200 font-bold text-sm">
                  {(report.bell_correlations as any)?.environmental?.fiber_loss_db_per_km || 0.20} dB/km
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">DETECTOR EFFICIENCY</span>
                <span className="text-emerald-300 font-bold text-sm">
                  {(((report.bell_correlations as any)?.environmental?.detector_efficiency || 0.95) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[10px] block">PHASE NOISE</span>
                <span className="text-purple-300 font-bold text-sm">
                  {(((report.bell_correlations as any)?.environmental?.phase_noise || 0.02) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* STAGE 2: Photon Coincidence Counts Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  E91 Coincidence Measurements Table (N++, N+-, N-+, N--)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                1024 Shots per Basis Pair
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="py-2.5 px-3">E91 Basis Pair</th>
                    <th className="py-2.5 px-3 text-cyan-400 font-bold">N++ (0,0)</th>
                    <th className="py-2.5 px-3 text-slate-400">N+- (0,1)</th>
                    <th className="py-2.5 px-3 text-slate-400">N-+ (1,0)</th>
                    <th className="py-2.5 px-3 text-cyan-400 font-bold">N-- (1,1)</th>
                    <th className="py-2.5 px-3 text-slate-300">Total Coincidences</th>
                    <th className="py-2.5 px-3 text-emerald-400 font-bold">Expectation E(a,b)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {Object.entries(coincidencesData).map(([pair, data]: [string, any]) => {
                    const eVal = typeof data === 'object' && data.expectation !== undefined ? data.expectation : data;
                    const nPP = typeof data === 'object' && data.n_plus_plus !== undefined ? data.n_plus_plus : 485;
                    const nPM = typeof data === 'object' && data.n_plus_minus !== undefined ? data.n_plus_minus : 15;
                    const nMP = typeof data === 'object' && data.n_minus_plus !== undefined ? data.n_minus_plus : 14;
                    const nMM = typeof data === 'object' && data.n_minus_minus !== undefined ? data.n_minus_minus : 486;
                    const nTot = typeof data === 'object' && data.total_coincidences !== undefined ? data.total_coincidences : 1024;

                    const labelMap: Record<string, string> = {
                      a1b1: 'a1, b1 (0°, 22.5°)',
                      a1b2: 'a1, b2 (0°, -22.5°)',
                      a2b1: 'a2, b1 (45°, 22.5°)',
                      a2b2: 'a2, b2 (45°, -22.5°)',
                      ZZ: 'ZZ Basis Pair',
                      ZX: 'ZX Basis Pair',
                      XZ: 'XZ Basis Pair',
                      XX: 'XX Basis Pair'
                    };

                    return (
                      <tr key={pair} className="hover:bg-slate-950/60">
                        <td className="py-2.5 px-3 font-bold text-slate-200">
                          {labelMap[pair] || pair}
                        </td>
                        <td className="py-2.5 px-3 text-cyan-300">{nPP}</td>
                        <td className="py-2.5 px-3 text-slate-400">{nPM}</td>
                        <td className="py-2.5 px-3 text-slate-400">{nMP}</td>
                        <td className="py-2.5 px-3 text-cyan-300">{nMM}</td>
                        <td className="py-2.5 px-3 text-slate-300">{nTot}</td>
                        <td className={`py-2.5 px-3 font-bold ${eVal > 0.5 ? 'text-emerald-400' : eVal < -0.5 ? 'text-cyan-400' : 'text-amber-400'}`}>
                          {eVal > 0 ? `+${eVal.toFixed(4)}` : eVal.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400">
              <strong className="text-purple-300">Expectation Formula:</strong> E(a,b) = (N++ + N-- - N+- - N-+) / N_total
            </div>
          </div>

          {/* STAGE 3 & 4: Gatekeepers (CHSH & QBER) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gate 1: CHSH Bell Test */}
            <div className={`p-5 rounded-2xl border shadow-xl space-y-3 ${
              isGate1Pass ? 'bg-slate-900/90 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/50'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                    Gate 1: CHSH Bell Inequality Test
                  </h3>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                  isGate1Pass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {report.bell_test_result}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400">Calculated CHSH Parameter S:</span>
                  <span className="text-2xl font-extrabold text-cyan-400">{report.chsh_value.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Entanglement Boundary:</span>
                  <span className="text-slate-200">|S| &gt; 2.0 (Tsirelson: 2.8284)</span>
                </div>

                <div className={`p-2.5 rounded-lg border text-[11px] font-sans ${
                  isGate1Pass ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-bold'
                }`}>
                  {isGate1Pass
                    ? '✓ PASS: Bell inequality violated (|S| > 2.0). Non-local quantum entanglement verified.'
                    : '❌ FAIL: Bell inequality NOT violated (|S| <= 2.0). Quantum key rejected immediately.'}
                </div>
              </div>
            </div>

            {/* Gate 2: QBER Error Rate */}
            <div className={`p-5 rounded-2xl border shadow-xl space-y-3 ${
              isGate2Pass ? 'bg-slate-900/90 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/50'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold text-xs flex items-center justify-center">
                    4
                  </span>
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                    Gate 2: Quantum Bit Error Rate (QBER)
                  </h3>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                  isGate2Pass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {isGate2Pass ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400">Derived QBER Ratio:</span>
                  <span className="text-2xl font-extrabold text-amber-400">{(report.qber * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>E91 Security Threshold:</span>
                  <span className="text-slate-200">QBER &lt; 11.0%</span>
                </div>

                <div className={`p-2.5 rounded-lg border text-[11px] font-sans ${
                  isGate2Pass ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-bold'
                }`}>
                  {isGate2Pass
                    ? '✓ PASS: Error rate is below 11.0% bound. Eavesdropping risk acceptable.'
                    : '❌ FAIL: QBER error rate exceeds 11.0% threshold. Session aborted.'}
                </div>
              </div>
            </div>
          </div>

          {/* STAGE 5: Quality Assessment (Fidelity) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold text-xs flex items-center justify-center">
                  5
                </span>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  Quality Assessment: Depolarizing Quantum State Fidelity
                </h3>
              </div>
              <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/30 font-bold">
                F = {(report.fidelity * 100).toFixed(1)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">DERIVED STATE FIDELITY</span>
                <span className="text-purple-300 font-extrabold text-xl">{(report.fidelity * 100).toFixed(1)}%</span>
                <span className="text-[10px] text-slate-500 block font-sans">
                  Formula: F = (1 + γ) / 2 (Depolarizing channel assumption)
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">WEIGHTED SECURITY SCORE</span>
                <span className="text-emerald-400 font-extrabold text-xl">{report.security_score} / 100</span>
                <span className="text-[10px] text-slate-500 block font-sans">
                  40% CHSH + 35% QBER + 25% Fidelity weighted score
                </span>
              </div>
            </div>
          </div>

          {/* STEP 10: FINAL DECISION CARD ACCORDING TO PROMPT SPECIFICATIONS */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md shadow-2xl space-y-5 font-mono text-xs ${
            isChannelRejected
              ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <Award className={`w-6 h-6 ${isChannelRejected ? 'text-rose-400' : 'text-emerald-400'}`} />
                <h3 className="text-base font-extrabold font-sans uppercase tracking-wide">
                  Final E91 Quantum Security Protocol Decision Card
                </h3>
              </div>
              {getStatusBadge(report.security_status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <span className="text-slate-400 text-[10px] uppercase block font-sans font-bold">
                  Physical Entanglement &amp; Channel Metrics Checklist:
                </span>
                <div className="space-y-2 font-semibold text-xs">
                  <div className={`flex items-center gap-2.5 ${isGate1Pass ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isGate1Pass ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
                    <span>{isGate1Pass ? 'Bell Inequality Violated' : 'Bell Inequality Not Violated'}</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-slate-200">
                    <span className="text-cyan-400 font-bold">CHSH S = {report.chsh_value.toFixed(3)}</span>
                  </div>

                  <div className={`flex items-center gap-2.5 ${isGate1Pass ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isGate1Pass ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
                    <span>{isGate1Pass ? 'Bell Test Passed' : 'Bell Test Failed'}</span>
                  </div>

                  <div className={`flex items-center gap-2.5 ${isGate2Pass ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isGate2Pass ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
                    <span>QBER = {(report.qber * 100).toFixed(1)}%</span>
                  </div>

                  <div className="flex items-center gap-2.5 text-purple-300">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span>Fidelity = {(report.fidelity * 100).toFixed(1)}%</span>
                  </div>

                  <div className={`flex items-center gap-2.5 ${isChannelVerified ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isChannelVerified ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
                    <span>{isChannelVerified ? 'Quantum Entanglement Verified' : 'Quantum Entanglement Not Verified'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-l border-slate-800/80 pl-6">
                <span className="text-slate-400 text-[10px] uppercase block font-sans font-bold">
                  Downstream Key Acceptance &amp; SCADA Action:
                </span>
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-sm font-bold">
                    {isChannelRejected ? <X className="w-4 h-4 text-rose-400" /> : <Check className="w-4 h-4 text-emerald-400" />}
                    <span>
                      {isChannelRejected ? 'Raw Key Discarded' : 'Shared Secret Key Accepted'}
                    </span>
                  </div>

                  <div className={`p-3.5 rounded-xl border text-xs font-sans font-bold flex items-center gap-2.5 ${
                    isChannelRejected
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  }`}>
                    <Zap className={`w-4 h-4 ${isChannelRejected ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <span>
                      {isChannelRejected
                        ? 'Module 5 Secure SCADA Blocked'
                        : 'Module 5 Secure SCADA Enabled'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            Run E91 Security Pipeline Now
          </button>
        </div>
      )}
    </div>
  );
};
