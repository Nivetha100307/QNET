import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Cpu,
  Radio,
  Activity,
  Play,
  Square,
  RefreshCw,
  Network,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ListOrdered,
  Atom,
  Sliders,
  Key,
  ShieldAlert,
  Lock,
  X
} from 'lucide-react';

import {
  createSession,
  activateSession,
  endSession,
  fetchSessions,
  SessionResponse,
  wsService,
  EventBus
} from '../services';

import { MainLayout } from '../layouts/MainLayout';
import { QuantumEngineModule } from './QuantumEngineModule';
import { QuantumKeyModule } from './QuantumKeyModule';
import { QuantumSecurityDashboard } from './QuantumSecurityDashboard';
import { SCADAEngineModule } from './SCADAEngineModule';
import { ZeroTrustAttackModule } from './ZeroTrustAttackModule';
import { EntanglementSwappingModule } from './EntanglementSwappingModule';
import { CascadePrivacyModule } from './CascadePrivacyModule';

const NODES = [
  'Control_Center',
  'Substation_A',
  'Substation_B',
  'Substation_C',
  'Substation_D'
];

const getInitialTabFromPath = (): string => {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('module2') || path.includes('quantum')) return 'module2';
  if (path.includes('module3') || path.includes('key')) return 'module3';
  if (path.includes('module4') || path.includes('security')) return 'module4';
  if (path.includes('module5') || path.includes('scada')) return 'module5';
  if (path.includes('module6') || path.includes('zero-trust') || path.includes('attack')) return 'module6';
  if (path.includes('module7') || path.includes('repeater') || path.includes('swapping')) return 'module7';
  if (path.includes('module8') || path.includes('cascade') || path.includes('privacy')) return 'module8';
  return 'module1';
};

export const QuantumSessionManager: React.FC = () => {
  const [activeModuleTab, setActiveModuleTab] = useState<string>(getInitialTabFromPath());

  const [sourceNode, setSourceNode] = useState<string>('Control_Center');
  const [destNode, setDestNode] = useState<string>('Substation_A');
  const [protocol, setProtocol] = useState<string>('E91');
  const [sessionType, setSessionType] = useState<string>('SIMULATION');

  const [activeSession, setActiveSession] = useState<SessionResponse | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [nodeHealth, setNodeHealth] = useState<Record<string, { status: string; ping_ms: number }>>({
    'Control_Center': { status: 'HEALTHY', ping_ms: 1.2 },
    'Substation_A': { status: 'HEALTHY', ping_ms: 1.8 },
    'Substation_B': { status: 'HEALTHY', ping_ms: 2.4 },
    'Substation_C': { status: 'HEALTHY', ping_ms: 3.1 },
    'Substation_D': { status: 'HEALTHY', ping_ms: 4.0 },
  });

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessionHistory(data);
      if (data.length > 0) {
        setActiveSession((prev) => {
          if (!prev) return data.find((s) => s.status !== 'TERMINATED') || data[0];
          const updatedPrev = data.find((s) => s.session_id === prev.session_id);
          return updatedPrev || data.find((s) => s.status !== 'TERMINATED') || data[0];
        });
      }
    } catch (err: any) {
      console.error('Failed to load sessions', err);
    }
  };

  useEffect(() => {
    loadSessions();

    // Connect single WebSocket client
    wsService.connect();

    const unsubTelemetry = EventBus.on('TELEMETRY_UPDATE', (eventData) => {
      if (eventData.node_health) {
        setNodeHealth(eventData.node_health);
      }
      setActiveSession((prev) => {
        if (!prev || prev.session_id !== eventData.session_id) return prev;
        return {
          ...prev,
          quantum_channel: {
            ...prev.quantum_channel,
            ...eventData.quantum_channel,
          },
          classical_channel: {
            ...prev.classical_channel,
            ...eventData.classical_channel,
          },
          message_count: eventData.message_count,
          bytes_transferred: eventData.bytes_transferred,
        };
      });
    });

    const unsubSessionCreated = EventBus.on('SESSION_CREATED', () => loadSessions());
    const unsubSessionActivated = EventBus.on('SESSION_ACTIVATED', () => loadSessions());
    const unsubSessionTerminated = EventBus.on('SESSION_TERMINATED', () => loadSessions());

    return () => {
      unsubTelemetry();
      unsubSessionCreated();
      unsubSessionActivated();
      unsubSessionTerminated();
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveModuleTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
    window.history.pushState(null, '', `/${tab}`);
  };

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceNode === destNode) {
      setErrorMsg('Destination node cannot be equal to source node.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const newSession = await createSession({
        source_node: sourceNode,
        destination_node: destNode,
        protocol: protocol,
        session_type: sessionType,
      });
      setActiveSession(newSession);
      setSuccessMsg(`Session ${newSession.session_id.substring(0, 8)} initialized successfully.`);
      await loadSessions();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setErrorMsg('Backend endpoint unavailable. Please ensure Uvicorn backend server is running.');
      } else {
        setErrorMsg(msg || 'Failed to initialize session');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreateSession = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const created = await createSession({
        source_node: 'Substation_A',
        destination_node: 'Control_Center',
        protocol: 'E91',
        session_type: 'SIMULATION',
      });
      const activated = await activateSession(created.session_id);
      setActiveSession(activated);
      setSuccessMsg(`Active session ${activated.session_id.substring(0, 8)} created.`);
      await loadSessions();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setErrorMsg('Backend endpoint unavailable. Please ensure Uvicorn backend server is running.');
      } else {
        setErrorMsg(msg || 'Failed to create active session');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!activeSession) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const updated = await activateSession(activeSession.session_id);
      setActiveSession(updated);
      setSuccessMsg(`Session ${updated.session_id.substring(0, 8)} activated.`);
      await loadSessions();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setErrorMsg('Backend endpoint unavailable. Please ensure Uvicorn backend server is running.');
      } else {
        setErrorMsg(msg || 'Failed to activate session');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!activeSession) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const updated = await endSession(activeSession.session_id);
      setActiveSession(updated);
      setSuccessMsg(`Session ${updated.session_id.substring(0, 8)} terminated.`);
      await loadSessions();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setErrorMsg('Backend endpoint unavailable. Please ensure Uvicorn backend server is running.');
      } else {
        setErrorMsg(msg || 'Failed to terminate session');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout
      activeTab={activeModuleTab}
      onTabChange={handleTabChange}
      onRefresh={loadSessions}
    >
      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Module 1 View */}
      {activeModuleTab === 'module1' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                <Network className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-white">Initialize Secure Session</h2>
              </div>

              <form onSubmit={handleInitialize} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Source Node
                  </label>
                  <select
                    value={sourceNode}
                    onChange={(e) => setSourceNode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {NODES.map((node) => (
                      <option key={`src-${node}`} value={node}>{node}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Destination Node
                  </label>
                  <select
                    value={destNode}
                    onChange={(e) => setDestNode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {NODES.map((node) => (
                      <option key={`dst-${node}`} value={node}>{node}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Protocol
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={protocol}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm font-mono text-cyan-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                      Type
                    </label>
                    <select
                      value={sessionType}
                      onChange={(e) => setSessionType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="SIMULATION">SIMULATION</option>
                      <option value="HARDWARE">HARDWARE</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Start & Initialize Session
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {activeSession ? (
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                        {activeSession.session_id}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                        {activeSession.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeSession.status === 'READY' && (
                      <button
                        onClick={handleActivate}
                        disabled={loading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" /> Activate Session
                      </button>
                    )}
                    {activeSession.status !== 'TERMINATED' && (
                      <button
                        onClick={handleTerminate}
                        disabled={loading}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5" /> Terminate Session
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">SOURCE NODE</span>
                    <span className="text-cyan-300 font-bold">{activeSession.source_node}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">DESTINATION NODE</span>
                    <span className="text-emerald-300 font-bold">{activeSession.destination_node}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">MESSAGES DISPATCHED</span>
                    <span className="text-purple-300 font-bold">{activeSession.message_count}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">BYTES TRANSFERRED</span>
                    <span className="text-amber-300 font-bold">{activeSession.bytes_transferred} B</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 p-12 rounded-2xl border border-dashed border-slate-800 text-center space-y-4">
                <Network className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-lg font-medium text-slate-300">No Session Selected</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Initialize a new session on the left to start quantum SCADA communications.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fallback Banner for Modules 2-8 when no session exists */}
      {activeModuleTab !== 'module1' && !activeSession && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
          <Network className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-slate-100">No Active Quantum Session</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            An active quantum communication session is required for this module. Click below to create and activate a session instantly.
          </p>
          <button
            onClick={handleQuickCreateSession}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-cyan-300" />
            Initialize & Activate Quantum Session
          </button>
        </div>
      )}

      {/* Module 2 View */}
      {activeModuleTab === 'module2' && activeSession && (
        <QuantumEngineModule
          session={activeSession}
          sessionHistory={sessionHistory}
          onSelectSession={setActiveSession}
          onQuickCreateSession={handleQuickCreateSession}
          onMeasurementExecuted={loadSessions}
        />
      )}

      {/* Module 3 View */}
      {activeModuleTab === 'module3' && activeSession && (
        <QuantumKeyModule
          session={activeSession}
          sessionHistory={sessionHistory}
          onSelectSession={setActiveSession}
          onQuickCreateSession={handleQuickCreateSession}
        />
      )}

      {/* Module 4 View */}
      {activeModuleTab === 'module4' && activeSession && (
        <QuantumSecurityDashboard
          session={activeSession}
          sessionHistory={sessionHistory}
          onSelectSession={setActiveSession}
          onQuickCreateSession={handleQuickCreateSession}
        />
      )}

      {/* Module 5 View */}
      {activeModuleTab === 'module5' && activeSession && (
        <SCADAEngineModule
          session={activeSession}
          sessionHistory={sessionHistory}
          onSelectSession={setActiveSession}
          onQuickCreateSession={handleQuickCreateSession}
          onNavigateToModule6={() => handleTabChange('module6')}
        />
      )}

      {/* Module 6 View */}
      {activeModuleTab === 'module6' && activeSession && (
        <ZeroTrustAttackModule
          session={activeSession}
          sessionHistory={sessionHistory}
          onSelectSession={setActiveSession}
        />
      )}

      {/* Module 7 View */}
      {activeModuleTab === 'module7' && activeSession && (
        <EntanglementSwappingModule
          session={activeSession}
          sessionHistory={sessionHistory}
          onSelectSession={setActiveSession}
        />
      )}

      {/* Module 8 View */}
      {activeModuleTab === 'module8' && activeSession && (
        <CascadePrivacyModule
          session={activeSession}
          sessionHistory={sessionHistory}
          onSelectSession={setActiveSession}
        />
      )}
    </MainLayout>
  );
};
