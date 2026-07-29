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
  ListOrdered
} from 'lucide-react';
import { 
  createSession, 
  activateSession, 
  endSession, 
  fetchSessions, 
  subscribeToWebsocket, 
  SessionResponse 
} from '../services/api';

const NODES = [
  'Control_Center',
  'Substation_A',
  'Substation_B',
  'Substation_C',
  'Substation_D'
];

export const QuantumSessionManager: React.FC = () => {
  const [sourceNode, setSourceNode] = useState<string>('Control_Center');
  const [destNode, setDestNode] = useState<string>('Substation_A');
  const [protocol, setProtocol] = useState<string>('E91');
  const [sessionType, setSessionType] = useState<string>('SIMULATION');

  const [activeSession, setActiveSession] = useState<SessionResponse | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessionHistory(data);
      if (data.length > 0) {
        // Pick the most recent non-terminated session if available
        const current = data.find(s => s.status !== 'TERMINATED') || data[0];
        setActiveSession(current);
      }
    } catch (err: any) {
      console.error('Failed to load sessions', err);
    }
  };

  useEffect(() => {
    loadSessions();

    const unsubscribe = subscribeToWebsocket((eventData) => {
      console.log('Realtime WS Event:', eventData);
      loadSessions();
    });

    return () => unsubscribe();
  }, []);

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (sourceNode === destNode) {
      setErrorMsg('Destination node cannot be equal to source node.');
      return;
    }

    setLoading(true);
    try {
      const newSession = await createSession({
        source_node: sourceNode,
        destination_node: destNode,
        protocol: protocol,
        session_type: sessionType
      });
      setActiveSession(newSession);
      setSuccessMsg(`Session ${newSession.session_id.substring(0, 8)}... initialized in READY state.`);
      await loadSessions();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize session');
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
      setErrorMsg(err.message || 'Failed to activate session');
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
      setErrorMsg(err.message || 'Failed to terminate session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-quantum-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-quantum-cyan/10 rounded-xl border border-quantum-cyan/30 text-quantum-cyan">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                QNetSecure <span className="text-xs px-2 py-0.5 rounded-full bg-quantum-cyan/20 text-quantum-cyan font-mono border border-quantum-cyan/40">Module 1</span>
              </h1>
              <p className="text-sm text-slate-400">
                AI-Enabled E91 Quantum SCADA Communication Network • Session & Network Initialization
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={loadSessions} 
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Status
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            PostgreSQL Connected
          </div>
        </div>
      </header>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Setup Form, Right Session Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Network className="w-5 h-5 text-quantum-cyan" />
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
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-quantum-cyan transition"
                >
                  {NODES.map(n => (
                    <option key={n} value={n}>{n.replace('_', ' ')}</option>
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
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-quantum-cyan transition"
                >
                  {NODES.map(n => (
                    <option key={n} value={n}>{n.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Protocol
                  </label>
                  <select
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-quantum-cyan transition font-mono"
                  >
                    <option value="E91">E91 (Ekert)</option>
                    <option value="BB84">BB84 (Future)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                    Mode
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value)}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-quantum-cyan transition font-mono"
                  >
                    <option value="SIMULATION">SIMULATION</option>
                    <option value="HARDWARE">HARDWARE</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3 bg-gradient-to-r from-quantum-cyan to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-semibold text-sm rounded-xl transition glow-cyan disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {loading ? 'Initializing Session...' : 'Initialize Session'}
              </button>
            </form>
          </div>

          {/* Node Health Status Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> SCADA Network Health
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {NODES.map(node => (
                <div key={node} className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300 font-medium">{node.replace('_', ' ')}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">HEALTHY</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Session & Channels Column */}
        <div className="lg:col-span-8 space-y-6">
          {activeSession ? (
            <>
              {/* Session Overview Header */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono text-slate-500">SESSION ID</span>
                    <h2 className="text-lg font-mono font-semibold text-quantum-cyan">
                      {activeSession.session_id}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider ${
                      activeSession.status === 'READY' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      activeSession.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {activeSession.status}
                    </span>

                    {activeSession.status === 'READY' && (
                      <button
                        onClick={handleActivate}
                        disabled={loading}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Activate
                      </button>
                    )}

                    {activeSession.status !== 'TERMINATED' && (
                      <button
                        onClick={handleTerminate}
                        disabled={loading}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold text-xs rounded-lg border border-rose-500/40 transition flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" /> Terminate
                      </button>
                    )}
                  </div>
                </div>

                {/* Session Topology Route */}
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800 font-mono">
                  <span className="text-xs text-slate-500 uppercase mr-2">Route Topology:</span>
                  {activeSession.route?.map((node, i) => (
                    <React.Fragment key={i}>
                      <span className="px-2 py-1 bg-slate-800 rounded text-quantum-cyan">{node}</span>
                      {i < activeSession.route.length - 1 && <span className="text-slate-500">➔</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Quantum & Classical Channel Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Quantum Channel Card */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-quantum-violet" />
                      <h3 className="font-semibold text-white">Quantum Channel</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {activeSession.quantum_channel?.status || 'CONNECTED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Latency</span>
                      <span className="text-sm font-mono text-slate-200">{activeSession.quantum_channel?.latency_ms} ms</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Photon Loss</span>
                      <span className="text-sm font-mono text-slate-200">{activeSession.quantum_channel?.photon_loss}%</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Bell Score</span>
                      <span className="text-sm font-mono text-slate-400">
                        {activeSession.quantum_channel?.bell_score ?? 'NULL (Module 2)'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">QBER</span>
                      <span className="text-sm font-mono text-slate-400">
                        {activeSession.quantum_channel?.qber ?? 'NULL'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Classical Channel Card */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-5 h-5 text-quantum-cyan" />
                      <h3 className="font-semibold text-white">Classical Channel</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {activeSession.classical_channel?.status || 'CONNECTED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Latency</span>
                      <span className="text-sm font-mono text-slate-200">{activeSession.classical_channel?.latency_ms} ms</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Authentication</span>
                      <span className="text-sm font-mono text-emerald-400">
                        {activeSession.classical_channel?.authentication_ready ? 'READY' : 'PENDING'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Message Count</span>
                      <span className="text-sm font-mono text-slate-200">{activeSession.message_count}</span>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Bytes Transferred</span>
                      <span className="text-sm font-mono text-slate-200">{activeSession.bytes_transferred} B</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Event Timeline */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ListOrdered className="w-5 h-5 text-quantum-cyan" />
                  <h3 className="font-semibold text-white">Session Event Timeline</h3>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                  {activeSession.timeline?.map((evt, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-mono text-quantum-cyan font-semibold">{evt.event}</span>
                        <p className="text-slate-400">{evt.details}</p>
                      </div>
                      <div className="text-right font-mono text-slate-500 text-[10px]">
                        <div>{new Date(evt.timestamp).toLocaleTimeString()}</div>
                        <span className="text-slate-400">{evt.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <Clock className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-medium text-slate-300">No Active Quantum Session</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Use the panel on the left to select Source and Destination SCADA nodes to initialize Module 1 secure network session.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
