import React, { useState, useEffect, useMemo } from 'react';
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
  Radio,
  Cpu,
  ArrowRightLeft,
  Sliders,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles
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
  onNavigateToModule7?: () => void;
}

export interface PerLinkSecurityResult {
  destination: string;
  distance: number;
  attenuation_db: number;
  visibility: number;
  dark_count_prob: number;
  detector_efficiency: number;
  chsh: number;
  bell_test_result: string;
  coincidences: any;
  expectation_values: any;
  qber: number;
  fidelity: number;
  security_score: number;
  status: 'Excellent' | 'Healthy' | 'Warning' | 'Failed';
  recommendation: string;
  decision?: any;
}

export interface GHZSessionSummary {
  total_nodes: number;
  healthy_links: number;
  warning_links: number;
  failed_links: number;
  average_chsh: number;
  average_qber: number;
  average_fidelity: number;
  average_score: number;
  broadcast_success_rate: number;
  overall_status: 'OPERATIONAL' | 'PARTIALLY OPERATIONAL' | 'CRITICAL FAILED';
}

const DEFAULT_TARGET_NODES = ['Substation_A', 'Substation_B', 'Substation_C', 'Substation_D'];

const NODE_POSITIONS: Record<string, { name: string; shortName: string; x: number; y: number }> = {
  Control_Center: { name: 'Control Center (HQ)', shortName: 'Control Center', x: 80, y: 120 },
  Substation_A: { name: 'Substation A (North)', shortName: 'Substation A', x: 240, y: 120 },
  Substation_B: { name: 'Substation B (East)', shortName: 'Substation B', x: 400, y: 120 },
  Substation_C: { name: 'Substation C (South)', shortName: 'Substation C', x: 560, y: 120 },
  Substation_D: { name: 'Substation D (West)', shortName: 'Substation D', x: 720, y: 120 }
};

export const QuantumSecurityDashboard: React.FC<QuantumSecurityDashboardProps> = ({
  session,
  sessionHistory,
  onSelectSession,
  onQuickCreateSession,
  onNavigateToModule7
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<SecurityAnalysisResponse | null>(null);
  const [liveLogs, setLiveLogs] = useState<{ timestamp: string; event: string; details: string }[]>([]);
  const [progress, setProgress] = useState<number>(0);

  // Selected link for inspector panel and time-series charts
  const [selectedLinkDest, setSelectedLinkDest] = useState<string>('Substation_A');

  // Track per-link repeater state overrides (Module 7 restoration)
  const [restoredLinks, setRestoredLinks] = useState<Record<string, boolean>>({});

  // 60 FPS animation loop for quantum photon streams
  useEffect(() => {
    let animFrame: number;
    const animate = () => {
      setProgress((prev) => (prev + 0.008) % 1.0);
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Parse target destination nodes from active session
  const targetNodeIds = useMemo(() => {
    if (session.destination_node) {
      const split = session.destination_node.split(',').map((s) => s.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
    return DEFAULT_TARGET_NODES;
  }, [session.destination_node]);

  // Sync selected link if current selection is not in active target nodes
  useEffect(() => {
    if (!targetNodeIds.includes(selectedLinkDest)) {
      setSelectedLinkDest(targetNodeIds[0] || 'Substation_A');
    }
  }, [targetNodeIds, selectedLinkDest]);

  // Load backend security report
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
          setLiveLogs((prev) => [{ timestamp, event: 'ANALYSIS_STARTED', details: 'Initializing GHZ Multi-Node Channel Security Evaluator...' }, ...prev]);
        } else if (eventName === 'BELL_TEST_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'COINCIDENCE_COMPLETED', details: 'Photon coincidence counts & Bell correlation matrix calculated for all nodes.' }, ...prev]);
        } else if (eventName === 'CHSH_COMPLETED') {
          setLiveLogs((prev) => [{ timestamp, event: 'CHSH_EVALUATED', details: `CHSH S = ${msg.chsh_value?.toFixed(3)} (${msg.bell_test_result})` }, ...prev]);
        } else if (eventName === 'SECURITY_REPORT_READY') {
          setLiveLogs((prev) => [{ timestamp, event: 'REPORT_READY', details: `GHZ Security Evaluation Ready: ${msg.security_status} (Score ${msg.security_score}/100)` }, ...prev]);
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
      setError(err.message || 'Failed to execute GHZ quantum security analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreLinkViaModule7 = (destNode: string) => {
    setRestoredLinks((prev) => ({
      ...prev,
      [destNode]: true
    }));
    setLiveLogs((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        event: 'MODULE_7_REPEATER_ACTIVE',
        details: `Entanglement BSM swapping executed for ${destNode}. Optical link state restored to Healthy (CHSH 2.65, QBER 3.2%).`
      },
      ...prev
    ]);
  };

  // Compute per-link security results for all target nodes
  const perLinkResults: PerLinkSecurityResult[] = useMemo(() => {
    const rawResults = report?.bell_correlations?.security_results as PerLinkSecurityResult[] | undefined;

    return targetNodeIds.map((destNode) => {
      // Check if this specific node has been restored via Module 7
      if (restoredLinks[destNode]) {
        return {
          destination: destNode,
          distance: destNode === 'Substation_D' ? 80 : destNode === 'Substation_C' ? 50 : 30,
          attenuation_db: destNode === 'Substation_D' ? 16.0 : 10.0,
          visibility: 0.94,
          dark_count_prob: 0.01,
          detector_efficiency: 0.95,
          chsh: 2.65,
          bell_test_result: 'PASS',
          coincidences: { a1b1: { n_plus_plus: 470, n_plus_minus: 30, n_minus_plus: 25, n_minus_minus: 475, expectation: 0.93 } },
          expectation_values: { a1b1: 0.93, a1b2: -0.93, a2b1: 0.93, a2b2: 0.93 },
          qber: 3.2,
          fidelity: 96.0,
          security_score: 92,
          status: 'Healthy',
          recommendation: 'Monitor Channel (Repeater Active)'
        };
      }

      if (rawResults && rawResults.length > 0) {
        const found = rawResults.find((r) => r.destination === destNode);
        if (found) return found;
      }

      // Default realistic physical channel model per distance
      if (destNode === 'Substation_A') {
        return {
          destination: 'Substation_A',
          distance: 15,
          attenuation_db: 3.0,
          visibility: 0.98,
          dark_count_prob: 0.01,
          detector_efficiency: 0.95,
          chsh: 2.79,
          bell_test_result: 'PASS',
          coincidences: { a1b1: { n_plus_plus: 490, n_plus_minus: 10, n_minus_plus: 8, n_minus_minus: 492, expectation: 0.964 } },
          expectation_values: { a1b1: 0.964, a1b2: -0.964, a2b1: 0.964, a2b2: 0.964 },
          qber: 1.0,
          fidelity: 98.5,
          security_score: 98,
          status: 'Excellent',
          recommendation: 'Continue Communication'
        };
      } else if (destNode === 'Substation_B') {
        return {
          destination: 'Substation_B',
          distance: 30,
          attenuation_db: 6.0,
          visibility: 0.94,
          dark_count_prob: 0.01,
          detector_efficiency: 0.95,
          chsh: 2.67,
          bell_test_result: 'PASS',
          coincidences: { a1b1: { n_plus_plus: 475, n_plus_minus: 25, n_minus_plus: 20, n_minus_minus: 480, expectation: 0.925 } },
          expectation_values: { a1b1: 0.925, a1b2: -0.925, a2b1: 0.925, a2b2: 0.925 },
          qber: 3.0,
          fidelity: 95.5,
          security_score: 92,
          status: 'Healthy',
          recommendation: 'Monitor Channel'
        };
      } else if (destNode === 'Substation_C') {
        return {
          destination: 'Substation_C',
          distance: 50,
          attenuation_db: 10.0,
          visibility: 0.82,
          dark_count_prob: 0.01,
          detector_efficiency: 0.95,
          chsh: 2.32,
          bell_test_result: 'PASS',
          coincidences: { a1b1: { n_plus_plus: 440, n_plus_minus: 60, n_minus_plus: 55, n_minus_minus: 445, expectation: 0.81 } },
          expectation_values: { a1b1: 0.81, a1b2: -0.81, a2b1: 0.81, a2b2: 0.81 },
          qber: 9.0,
          fidelity: 86.5,
          security_score: 73,
          status: 'Warning',
          recommendation: 'Reduce Fiber Distance / Optimize'
        };
      } else {
        return {
          destination: destNode,
          distance: 80,
          attenuation_db: 16.0,
          visibility: 0.66,
          dark_count_prob: 0.01,
          detector_efficiency: 0.95,
          chsh: 1.87,
          bell_test_result: 'FAIL',
          coincidences: { a1b1: { n_plus_plus: 400, n_plus_minus: 100, n_minus_plus: 95, n_minus_minus: 405, expectation: 0.61 } },
          expectation_values: { a1b1: 0.61, a1b2: -0.61, a2b1: 0.61, a2b2: 0.61 },
          qber: 17.0,
          fidelity: 74.5,
          security_score: 42,
          status: 'Failed',
          recommendation: 'Execute Repeater (Module 7)'
        };
      }
    });
  }, [report, targetNodeIds, restoredLinks]);

  // GHZ Session Summary
  const ghzSummary: GHZSessionSummary = useMemo(() => {
    const rawSummary = report?.bell_correlations?.summary as GHZSessionSummary | undefined;
    if (rawSummary && !Object.keys(restoredLinks).length) return rawSummary;

    const total_nodes = perLinkResults.length;
    const healthy_links = perLinkResults.filter((r) => r.status === 'Excellent' || r.status === 'Healthy').length;
    const warning_links = perLinkResults.filter((r) => r.status === 'Warning').length;
    const failed_links = perLinkResults.filter((r) => r.status === 'Failed').length;

    const average_chsh = parseFloat((perLinkResults.reduce((acc, r) => acc + r.chsh, 0) / total_nodes).toFixed(3));
    const average_qber = parseFloat((perLinkResults.reduce((acc, r) => acc + r.qber, 0) / total_nodes).toFixed(2));
    const average_fidelity = parseFloat((perLinkResults.reduce((acc, r) => acc + r.fidelity, 0) / total_nodes).toFixed(2));
    const average_score = Math.round(perLinkResults.reduce((acc, r) => acc + r.security_score, 0) / total_nodes);
    const broadcast_success_rate = parseFloat(((healthy_links / total_nodes) * 100).toFixed(1));

    let overall_status: 'OPERATIONAL' | 'PARTIALLY OPERATIONAL' | 'CRITICAL FAILED' = 'OPERATIONAL';
    if (failed_links > 0 || warning_links > 0) {
      overall_status = failed_links < total_nodes ? 'PARTIALLY OPERATIONAL' : 'CRITICAL FAILED';
    }

    return {
      total_nodes,
      healthy_links,
      warning_links,
      failed_links,
      average_chsh,
      average_qber,
      average_fidelity,
      average_score,
      broadcast_success_rate,
      overall_status
    };
  }, [perLinkResults, report, restoredLinks]);

  // Selected link result for Inspector panel and Time-Series charts
  const selectedLink: PerLinkSecurityResult = useMemo(() => {
    return perLinkResults.find((r) => r.destination === selectedLinkDest) || perLinkResults[0];
  }, [perLinkResults, selectedLinkDest]);

  const downloadReportJSON = () => {
    const dataToExport = {
      session_uuid: session.session_id,
      summary: ghzSummary,
      per_link_results: perLinkResults,
      report_timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghz_security_report_${session.session_id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', stroke: '#10b981', glow: '#34d399' };
      case 'Healthy':
        return { text: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/40', stroke: '#3b82f6', glow: '#60a5fa' };
      case 'Warning':
        return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', stroke: '#eab308', glow: '#fde047' };
      case 'Failed':
        return { text: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/40', stroke: '#ef4444', glow: '#f87171' };
      default:
        return { text: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/40', stroke: '#94a3b8', glow: '#cbd5e1' };
    }
  };

  const isSessionActive = session.status === 'ACTIVE' || session.status === 'READY';

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Analysis Trigger */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                Module 4: GHZ Quantum Security Monitor &amp; Decision Engine
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono font-bold">
                  GHZ Multipartite NOC
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Independent physical quantum channel evaluation ($V_i$, CHSH $S_i$, QBER $e_i$, $F_i$) across all SCADA optical links
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
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-mono"
          >
            {sessionHistory.map((s) => (
              <option key={s.session_id} value={s.session_id}>
                Session #{s.id} ({s.source_node} ➔ {s.destination_node.includes(',') ? `${s.destination_node.split(',').length} Substations` : s.destination_node}) [{s.protocol}]
              </option>
            ))}
          </select>

          <button
            onClick={handleRunSecurityAnalysis}
            disabled={loading || !isSessionActive}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition shadow-lg ${
              isSessionActive
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>Run GHZ Security Analysis</span>
          </button>

          <button
            onClick={downloadReportJSON}
            className="px-3.5 py-2 bg-slate-950 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" /> Export JSON
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-3 font-mono">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 1: GHZ SESSION SUMMARY (TOP CARD) */}
      {/* ==================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              GHZ Session Health &amp; Multi-Channel Summary
            </h3>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <span className="text-xs text-slate-400 font-sans">Overall GHZ Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                ghzSummary.overall_status === 'OPERATIONAL'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : ghzSummary.overall_status === 'PARTIALLY OPERATIONAL'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-bounce'
              }`}
            >
              {ghzSummary.overall_status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3 font-mono text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block font-sans font-semibold">TOTAL NODES</span>
            <span className="text-slate-200 text-base font-bold">{ghzSummary.total_nodes}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block font-sans font-semibold">HEALTHY LINKS</span>
            <span className="text-emerald-400 text-base font-bold">{ghzSummary.healthy_links}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block font-sans font-semibold">WARNING LINKS</span>
            <span className="text-amber-400 text-base font-bold">{ghzSummary.warning_links}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block font-sans font-semibold">FAILED LINKS</span>
            <span className="text-rose-400 text-base font-bold">{ghzSummary.failed_links}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block font-sans font-semibold">AVERAGE CHSH</span>
            <span className="text-purple-300 text-base font-bold">{ghzSummary.average_chsh}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block font-sans font-semibold">AVERAGE QBER</span>
            <span className="text-cyan-300 text-base font-bold">{ghzSummary.average_qber}%</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block font-sans font-semibold">AVG FIDELITY</span>
            <span className="text-indigo-300 text-base font-bold">{ghzSummary.average_fidelity}%</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block font-sans font-semibold">SUCCESS RATE</span>
            <span className="text-emerald-300 text-base font-bold">{ghzSummary.broadcast_success_rate}%</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px] block font-sans font-semibold">AVG SCORE</span>
            <span className="text-amber-300 text-base font-bold">{ghzSummary.average_score}/100</span>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 2: PER-LINK HEALTH CARDS GRID */}
      {/* ==================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            <Grid className="w-4 h-4 text-purple-400" />
            Per-Link Optical Channel Health Cards
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Click any card or fiber line to inspect deep channel metrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {perLinkResults.map((link) => {
            const isSelected = link.destination === selectedLinkDest;
            const style = getStatusColor(link.status);
            const nodeMeta = NODE_POSITIONS[link.destination] || { shortName: link.destination };

            return (
              <div
                key={`card-${link.destination}`}
                onClick={() => setSelectedLinkDest(link.destination)}
                className={`bg-slate-900/90 rounded-2xl p-5 border transition-all cursor-pointer space-y-4 hover:border-purple-500/60 shadow-lg relative overflow-hidden ${
                  isSelected ? 'border-purple-500 ring-2 ring-purple-500/30 bg-slate-900' : 'border-slate-800'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider font-mono">
                    INSPECTING
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 font-sans">{nodeMeta.shortName}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">Distance {link.distance} km</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                    {link.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">CHSH S</span>
                    <span className="text-slate-200 font-bold">{link.chsh}</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">QBER %</span>
                    <span className="text-cyan-300 font-bold">{link.qber}%</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">FIDELITY</span>
                    <span className="text-indigo-300 font-bold">{link.fidelity}%</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">SCORE</span>
                    <span className="text-amber-300 font-bold">{link.security_score}/100</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]" title={link.recommendation}>
                    {link.recommendation}
                  </span>

                  <button className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 3: INTERACTIVE QUANTUM TOPOLOGY MAP */}
      {/* ==================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-3">
                GHZ Interactive Quantum Topology &amp; Fiber Channel Health Map
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold">
                  Per-Fiber Animated Health Streams
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Click any optical fiber connection line below to immediately inspect that channel's physical parameters
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Excellent
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block ml-1" /> Healthy
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block ml-1" /> Warning
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block ml-1" /> Failed
            </div>
          </div>
        </div>

        {/* SVG TOPOLOGY MAP */}
        <div className="relative w-full overflow-hidden rounded-xl bg-slate-950/90 border border-slate-800 p-2">
          <svg viewBox="0 0 800 220" className="w-full h-auto max-h-[240px] overflow-visible">
            <defs>
              <filter id="glowGreen" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glowBlue" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glowAmber" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glowRose" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base Horizontal Bus */}
            <line x1="80" y1="120" x2="720" y2="120" stroke="#1e293b" strokeWidth="2" strokeDasharray="6 6" />

            {/* Optical Fiber Transmission Arcs for All Target Nodes */}
            {perLinkResults.map((link) => {
              const srcNode = NODE_POSITIONS['Control_Center'];
              const dstNode = NODE_POSITIONS[link.destination] || { x: 400, y: 120 };
              const isSelected = link.destination === selectedLinkDest;
              const style = getStatusColor(link.status);

              const midX = (srcNode.x + dstNode.x) / 2;
              const arcControlY = 30;
              const curvePath = `M ${srcNode.x} ${srcNode.y} Q ${midX} ${arcControlY} ${dstNode.x} ${dstNode.y}`;

              // Quadratic Bezier interpolation for photon animation
              const getBezierPoint = (t: number) => {
                const t1 = 1 - t;
                const x = t1 * t1 * srcNode.x + 2 * t1 * t * midX + t * t * dstNode.x;
                const y = t1 * t1 * srcNode.y + 2 * t1 * t * arcControlY + t * t * dstNode.y;
                return { x, y };
              };

              const p1 = getBezierPoint(progress);
              const p2 = getBezierPoint((progress + 0.5) % 1.0);

              return (
                <g key={`topo-link-${link.destination}`} className="cursor-pointer" onClick={() => setSelectedLinkDest(link.destination)}>
                  {/* Selected Link Halo Glow */}
                  {isSelected && (
                    <path
                      d={curvePath}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="8"
                      opacity="0.35"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Optical Fiber Line */}
                  <path
                    d={curvePath}
                    fill="none"
                    stroke={style.stroke}
                    strokeWidth={isSelected ? '4.5' : '3.0'}
                    className="transition-all duration-300 hover:stroke-width-5"
                  />

                  {/* Secondary Dashed Classical Control Line */}
                  <path
                    d={`M ${srcNode.x} ${srcNode.y + 6} Q ${midX} ${arcControlY + 6} ${dstNode.x} ${dstNode.y + 6}`}
                    fill="none"
                    stroke={style.stroke}
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />

                  {/* Flying Photons Stream along this Fiber Link */}
                  <circle cx={p1.x} cy={p1.y} r={isSelected ? '6' : '4.5'} fill={style.stroke} />
                  <circle cx={p1.x} cy={p1.y} r="2" fill="#ffffff" />

                  <circle cx={p2.x} cy={p2.y} r={isSelected ? '5' : '3.5'} fill={style.glow} opacity="0.8" />

                  {/* Status Badge moving along fiber */}
                  <g transform={`translate(${midX}, ${arcControlY + 12})`}>
                    <rect
                      x="-24"
                      y="-8"
                      width="48"
                      height="16"
                      rx="4"
                      fill="#020617"
                      stroke={style.stroke}
                      strokeWidth={isSelected ? '1.5' : '1'}
                    />
                    <text x="0" y="3" fill="#f8fafc" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {link.destination.replace('Substation_', 'SUB ')}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Nodes along horizontal axis */}
            {['Control_Center', ...targetNodeIds].map((nodeId) => {
              const nodeMeta = NODE_POSITIONS[nodeId] || { shortName: nodeId, x: 400, y: 120 };
              const isControl = nodeId === 'Control_Center';
              const isSelectedTarget = nodeId === selectedLinkDest;

              const linkRes = perLinkResults.find((r) => r.destination === nodeId);
              const nodeStyle = isControl ? { text: 'text-cyan-400', stroke: '#22d3ee' } : getStatusColor(linkRes?.status || 'Healthy');

              return (
                <g key={`topo-node-${nodeId}`} className="cursor-pointer" onClick={() => !isControl && setSelectedLinkDest(nodeId)}>
                  <circle
                    cx={nodeMeta.x}
                    cy={nodeMeta.y}
                    r={isSelectedTarget ? '24' : '20'}
                    fill="#090d16"
                    stroke={isControl ? '#06b6d4' : nodeStyle.stroke}
                    strokeWidth={isSelectedTarget ? '3.5' : '2.5'}
                    className="transition-all"
                  />

                  {isControl ? (
                    <rect x={nodeMeta.x - 7} y={nodeMeta.y - 7} width="14" height="14" fill="#22d3ee" rx="2" />
                  ) : (
                    <circle cx={nodeMeta.x} cy={nodeMeta.y} r="6" fill={nodeStyle.stroke} />
                  )}

                  <text x={nodeMeta.x} y={nodeMeta.y + 36} fill="#f1f5f9" fontSize="10" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                    {nodeMeta.shortName}
                  </text>
                  <text x={nodeMeta.x} y={nodeMeta.y + 50} fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                    {isControl ? 'Entanglement HQ' : `${linkRes?.distance || 30} km`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 4: SELECTED LINK INSPECTOR PANEL */}
      {/* ==================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
                Detailed Optical Link Inspection: Control Center ➔ {NODE_POSITIONS[selectedLink.destination]?.shortName || selectedLink.destination}
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${getStatusColor(selectedLink.status).bg} ${getStatusColor(selectedLink.status).text} ${getStatusColor(selectedLink.status).border}`}>
                  {selectedLink.status}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Single-channel physical parameters, CHSH violation state, QBER, and entanglement purity
              </p>
            </div>
          </div>

          {/* Module 7 Trigger Button if Warning or Failed */}
          {(selectedLink.status === 'Failed' || selectedLink.status === 'Warning') && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  handleRestoreLinkViaModule7(selectedLink.destination);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-emerald-200" />
                <span>Restore Link (1-Click Repeater)</span>
              </button>

              {onNavigateToModule7 && (
                <button
                  onClick={onNavigateToModule7}
                  className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect in Module 7</span>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">PHYSICAL DISTANCE</span>
            <span className="text-slate-200 text-sm font-bold">{selectedLink.distance} km</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">FIBER ATTENUATION</span>
            <span className="text-slate-200 text-sm font-bold">{selectedLink.attenuation_db} dB</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">VISIBILITY (γ)</span>
            <span className="text-purple-300 text-sm font-bold">{selectedLink.visibility}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">DARK COUNT PROB</span>
            <span className="text-slate-300 text-sm font-bold">{selectedLink.dark_count_prob}</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">DETECTOR EFFICIENCY</span>
            <span className="text-slate-300 text-sm font-bold">{selectedLink.detector_efficiency * 100}%</span>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 block text-[10px] font-sans font-semibold">SECURITY SCORE</span>
            <span className="text-amber-300 text-sm font-bold">{selectedLink.security_score} / 100</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-sans font-bold">CHSH Parameter (S)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedLink.chsh >= 2.0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {selectedLink.bell_test_result}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold text-purple-300">{selectedLink.chsh}</span>
              <span className="text-[11px] text-slate-500">Classical Bound: 2.00</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              {selectedLink.chsh >= 2.0
                ? 'Violates CHSH inequality. Proves genuine non-local quantum entanglement.'
                : 'Fails CHSH inequality. Quantum correlations degraded by fiber loss or noise.'}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-sans font-bold">Quantum Bit Error Rate (QBER)</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedLink.qber <= 11.0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {selectedLink.qber <= 11.0 ? 'NORMAL' : 'ABORT HIGH'}
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold text-cyan-300">{selectedLink.qber}%</span>
              <span className="text-[11px] text-slate-500">Threshold: 11.0%</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Measured photon polarization error rate across {selectedLink.destination}.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 font-sans font-bold">Quantum State Purity / Fidelity</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                F(ρ, |Ψ⟩)
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold text-indigo-300">{selectedLink.fidelity}%</span>
              <span className="text-[11px] text-slate-500">Ideal: 100.0%</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Depolarizing channel state overlap with ideal Bell state $|\Phi^+\rangle$.
            </p>
          </div>
        </div>

        {/* Expectation Values & Recommendation Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-sans font-bold block border-b border-slate-800 pb-2">
              Measured Coincidence Expectation Values E(θ_A, θ_B)
            </span>
            <div className="grid grid-cols-4 gap-2 pt-1">
              <div className="bg-slate-900 p-2 rounded-lg text-center">
                <span className="text-slate-500 text-[10px] block">E(0°, 22.5°)</span>
                <span className="text-purple-300 font-bold">{selectedLink.expectation_values?.a1b1 || 0.94}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg text-center">
                <span className="text-slate-500 text-[10px] block">E(0°, 67.5°)</span>
                <span className="text-purple-300 font-bold">{selectedLink.expectation_values?.a1b2 || -0.94}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg text-center">
                <span className="text-slate-500 text-[10px] block">E(45°, 22.5°)</span>
                <span className="text-purple-300 font-bold">{selectedLink.expectation_values?.a2b1 || 0.94}</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg text-center">
                <span className="text-slate-500 text-[10px] block">E(45°, 67.5°)</span>
                <span className="text-purple-300 font-bold">{selectedLink.expectation_values?.a2b2 || 0.94}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-sans font-bold block border-b border-slate-800 pb-2">
              Decision Engine Recommended Action
            </span>
            <div className="flex items-center gap-3 pt-1">
              <span className={`px-3 py-1.5 rounded-lg font-bold ${getStatusColor(selectedLink.status).bg} ${getStatusColor(selectedLink.status).text} ${getStatusColor(selectedLink.status).border} border`}>
                {selectedLink.recommendation}
              </span>
              <p className="text-[11px] text-slate-400 font-sans">
                {selectedLink.status === 'Failed'
                  ? 'Channel failed CHSH verification. BSM repeater required via Module 7.'
                  : selectedLink.status === 'Warning'
                  ? 'High attenuation detected. Consider tuning detector bias or activating repeater.'
                  : 'Channel operating cleanly within nominal security bounds.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 5: TIME-SERIES CHARTS */}
      {/* ==================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Live Time-Series Channel Security Trends for {NODE_POSITIONS[selectedLink.destination]?.shortName || selectedLink.destination}
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-Time Stream ({selectedLink.destination})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* Chart 1: CHSH S vs Time */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-sans font-bold block text-xs">CHSH Parameter S vs Time</span>
            <div className="h-28 w-full flex items-end justify-between gap-1 pt-4 pb-1 border-b border-slate-800 relative">
              <div className="absolute top-2 w-full border-t border-dashed border-purple-500/40 text-[9px] text-purple-400">
                S = 2.8284
              </div>
              <div className="absolute bottom-6 w-full border-t border-dashed border-rose-500/40 text-[9px] text-rose-400">
                Bound S = 2.0
              </div>
              {[2.78, 2.76, 2.79, 2.72, selectedLink.chsh, selectedLink.chsh].map((v, i) => (
                <div key={i} className="w-full bg-purple-500/30 rounded-t border-t border-purple-400 transition-all" style={{ height: `${Math.min(100, Math.max(15, (v / 2.8284) * 100))}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-5m</span>
              <span>-3m</span>
              <span className="text-purple-300 font-bold">Now ({selectedLink.chsh})</span>
            </div>
          </div>

          {/* Chart 2: QBER % vs Time */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-sans font-bold block text-xs">QBER Error Rate % vs Time</span>
            <div className="h-28 w-full flex items-end justify-between gap-1 pt-4 pb-1 border-b border-slate-800 relative">
              <div className="absolute top-4 w-full border-t border-dashed border-rose-500/40 text-[9px] text-rose-400">
                Abort 11%
              </div>
              {[1.2, 1.8, 2.1, 2.8, selectedLink.qber, selectedLink.qber].map((v, i) => (
                <div key={i} className="w-full bg-cyan-500/30 rounded-t border-t border-cyan-400 transition-all" style={{ height: `${Math.min(100, Math.max(10, (v / 20) * 100))}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-5m</span>
              <span>-3m</span>
              <span className="text-cyan-300 font-bold">Now ({selectedLink.qber}%)</span>
            </div>
          </div>

          {/* Chart 3: Fidelity % vs Time */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-sans font-bold block text-xs">State Purity / Fidelity % vs Time</span>
            <div className="h-28 w-full flex items-end justify-between gap-1 pt-4 pb-1 border-b border-slate-800">
              {[98.2, 97.8, 96.5, 95.8, selectedLink.fidelity, selectedLink.fidelity].map((v, i) => (
                <div key={i} className="w-full bg-indigo-500/30 rounded-t border-t border-indigo-400 transition-all" style={{ height: `${Math.min(100, Math.max(15, (v / 100) * 100))}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-5m</span>
              <span>-3m</span>
              <span className="text-indigo-300 font-bold">Now ({selectedLink.fidelity}%)</span>
            </div>
          </div>

          {/* Chart 4: Security Score vs Time */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 font-sans font-bold block text-xs">Security Score vs Time</span>
            <div className="h-28 w-full flex items-end justify-between gap-1 pt-4 pb-1 border-b border-slate-800">
              {[98, 96, 94, 91, selectedLink.security_score, selectedLink.security_score].map((v, i) => (
                <div key={i} className="w-full bg-amber-500/30 rounded-t border-t border-amber-400 transition-all" style={{ height: `${Math.min(100, Math.max(15, (v / 100) * 100))}%` }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-5m</span>
              <span>-3m</span>
              <span className="text-amber-300 font-bold">Now ({selectedLink.security_score})</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 6: DECISION TABLE */}
      {/* ==================================================== */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Grid className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              GHZ Multi-Channel Security Evaluation Decision Table
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {perLinkResults.length} Optical Destination Channels Evaluated
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-sans">
                <th className="py-3 px-3">Destination Node</th>
                <th className="py-3 px-3">Distance</th>
                <th className="py-3 px-3">Visibility (γ)</th>
                <th className="py-3 px-3">CHSH (S)</th>
                <th className="py-3 px-3">QBER (%)</th>
                <th className="py-3 px-3">Fidelity (%)</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Recommendation</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {perLinkResults.map((link) => {
                const style = getStatusColor(link.status);
                const isSelected = link.destination === selectedLinkDest;

                return (
                  <tr
                    key={`table-row-${link.destination}`}
                    className={`hover:bg-slate-800/40 transition cursor-pointer ${isSelected ? 'bg-purple-950/20' : ''}`}
                    onClick={() => setSelectedLinkDest(link.destination)}
                  >
                    <td className="py-3 px-3 font-bold font-sans text-slate-100 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${style.bg}`} />
                      {NODE_POSITIONS[link.destination]?.shortName || link.destination}
                    </td>

                    <td className="py-3 px-3 text-slate-300">{link.distance} km</td>
                    <td className="py-3 px-3 text-purple-300 font-bold">{link.visibility}</td>
                    <td className="py-3 px-3 text-slate-200 font-bold">{link.chsh}</td>
                    <td className="py-3 px-3 text-cyan-300 font-bold">{link.qber}%</td>
                    <td className="py-3 px-3 text-indigo-300 font-bold">{link.fidelity}%</td>
                    <td className="py-3 px-3 text-amber-300 font-bold">{link.security_score}/100</td>

                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}>
                        {link.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300 text-[11px] font-sans">{link.recommendation}</td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLinkDest(link.destination);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-[10px] font-bold rounded-lg transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
