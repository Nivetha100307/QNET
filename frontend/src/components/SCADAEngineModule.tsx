import React, { useState, useEffect } from 'react';
import {
  Radio,
  Cpu,
  Lock,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

import {
  SessionResponse,
  SCADAPacketResponse,
  sendSCADACommand,
  fetchSCADAHistory
} from '../services';

import { SCADASystemRibbon } from './scada/SCADASystemRibbon';
import { SCADACommandChain } from './scada/SCADACommandChain';
import { SCADAPacketMotion } from './scada/SCADAPacketMotion';
import { EncryptionInspector } from './scada/EncryptionInspector';
import { PacketEnvelopeTree } from './scada/PacketEnvelopeTree';
import { DeviceDigitalTwin } from './scada/DeviceDigitalTwin';
import { SCADAPipelineProgress } from './scada/SCADAPipelineProgress';
import { SCADALayerInfo } from './scada/SCADALayerCard';
import { ThreatPanel } from './scada/ThreatPanel';
import { SCADATransportTimeline, TransportTimelineStep } from './scada/SCADATransportTimeline';
import { SCADAAuditPanel } from './scada/SCADAAuditPanel';

interface SCADAEngineModuleProps {
  session: SessionResponse;
  sessionHistory: SessionResponse[];
  onSelectSession: (session: SessionResponse) => void;
  onQuickCreateSession?: () => void;
  onNavigateToModule6?: () => void;
}

const createDynamicLayers = (): SCADALayerInfo[] => [
  { number: 1, name: 'Operator Identity', category: 'JWT Check', status: 'WAITING', latencyMs: Math.round(6 + Math.abs(Math.sin(1.1)) * 4) },
  { number: 2, name: 'RBAC Authorization', category: 'Role Matrix', status: 'WAITING', latencyMs: Math.round(5 + Math.abs(Math.sin(2.2)) * 3) },
  { number: 3, name: 'Quantum Key Retrieval', category: 'Module 3 Key', status: 'WAITING', latencyMs: Math.round(11 + Math.abs(Math.sin(3.3)) * 6) },
  { number: 4, name: 'HKDF Key Derivation', category: 'SHA-256 Salt', status: 'WAITING', latencyMs: Math.round(9 + Math.abs(Math.sin(4.4)) * 4) },
  { number: 5, name: 'AES-256-GCM Encipher', category: 'GCM Cipher', status: 'WAITING', latencyMs: Math.round(13 + Math.abs(Math.sin(5.5)) * 5) },
  { number: 6, name: 'GCM Nonce & Tag', category: '96b/128b Tag', status: 'WAITING', latencyMs: Math.round(7 + Math.abs(Math.sin(6.6)) * 4) },
  { number: 7, name: 'HMAC Signature', category: 'Constant-Time', status: 'WAITING', latencyMs: Math.round(14 + Math.abs(Math.sin(7.7)) * 6) },
  { number: 8, name: 'Replay Protection', category: 'Seq Monotonic', status: 'WAITING', latencyMs: Math.round(6 + Math.abs(Math.sin(8.8)) * 3) },
  { number: 9, name: 'Packet Validation', category: 'Pydantic v2', status: 'WAITING', latencyMs: Math.round(10 + Math.abs(Math.sin(9.9)) * 5) },
  { number: 10, name: 'Transport Layer ACK', category: 'Reliable Delivery', status: 'WAITING', latencyMs: Math.round(16 + Math.abs(Math.sin(10.1)) * 8) },
  { number: 11, name: 'SCADA Safety Rules', category: 'Syntax Check', status: 'WAITING', latencyMs: Math.round(8 + Math.abs(Math.sin(11.2)) * 4) },
  { number: 12, name: 'Device Verification', category: 'RTU Online', status: 'WAITING', latencyMs: Math.round(12 + Math.abs(Math.sin(12.3)) * 5) },
  { number: 13, name: 'Encrypted Telemetry', category: 'Real-Time Stream', status: 'WAITING', latencyMs: Math.round(10 + Math.abs(Math.sin(13.4)) * 5) },
  { number: 14, name: 'Immutable Audit Log', category: 'Event Log', status: 'WAITING', latencyMs: Math.round(6 + Math.abs(Math.sin(14.5)) * 4) },
  { number: 15, name: 'Threat Monitor Check', category: 'Anomaly Detection', status: 'WAITING', latencyMs: Math.round(9 + Math.abs(Math.sin(15.6)) * 4) },
];

export const SCADAEngineModule: React.FC<SCADAEngineModuleProps> = ({
  session,
  sessionHistory,
  onSelectSession,
  onQuickCreateSession,
  onNavigateToModule6
}) => {
  const devices = ['RELAY_04', 'BRK_12', 'TRANS_TAP_01', 'GEN_MAIN_01'];
  const roles = ['GRID_ADMIN', 'CONTROL_OPERATOR', 'SUBSTATION_ENGINEER', 'FIELD_ENGINEER', 'VIEWER'];
  const commands = ['TRIP_RELAY', 'OPEN_BREAKER', 'CLOSE_BREAKER', 'SET_TRANSFORMER_TAP', 'EMERGENCY_SHUTDOWN'];

  const [selectedDevice, setSelectedDevice] = useState<string>('RELAY_04');
  const [selectedRole, setSelectedRole] = useState<string>('GRID_ADMIN');
  const [selectedCommand, setSelectedCommand] = useState<string>('TRIP_RELAY');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SCADAPacketResponse[]>([]);
  const [latestPacket, setLatestPacket] = useState<SCADAPacketResponse | null>(null);

  const [layers, setLayers] = useState<SCADALayerInfo[]>(createDynamicLayers);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(-1);
  const [commandStepIndex, setCommandStepIndex] = useState<number>(-1);

  const [ackReceived, setAckReceived] = useState<boolean>(false);

  // Digital Twin Telemetry State with Real-Time AC Grid Micro-fluctuations
  const [telemetry, setTelemetry] = useState({
    voltage: 230.4,
    current: 14.2,
    frequency: 60.02,
    temperature: 34,
    breakerState: 'CLOSED',
    relayState: 'ENERGIZED',
    trustScore: 0.98
  });

  const [timelineSteps, setTimelineSteps] = useState<TransportTimelineStep[]>([
    { timestamp: new Date().toLocaleTimeString(), label: 'Packet Created', latencyMs: 12 },
    { timestamp: new Date().toLocaleTimeString(), label: 'AES Encrypted', latencyMs: 16 },
    { timestamp: new Date().toLocaleTimeString(), label: 'ACK Received', latencyMs: 22 },
  ]);

  // Real-time grid power telemetry simulation interval
  useEffect(() => {
    const timer = setInterval(() => {
      const t = Date.now() / 1000;
      setTelemetry((prev) => ({
        ...prev,
        voltage: parseFloat((230.0 + 1.6 * Math.sin(t / 2.2) + (Math.random() - 0.5) * 0.3).toFixed(1)),
        current: parseFloat((14.0 + 1.1 * Math.cos(t / 1.7) + (Math.random() - 0.5) * 0.2).toFixed(1)),
        frequency: parseFloat((60.00 + 0.03 * Math.sin(t / 3.0)).toFixed(2)),
        temperature: Math.round(34 + 1.2 * Math.sin(t / 8.0)),
        trustScore: parseFloat((0.97 + 0.02 * Math.cos(t / 4.0)).toFixed(3))
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      try {
        const data = await fetchSCADAHistory(session.session_id);
        if (isMounted) {
          setHistory(data);
          if (data.length > 0) setLatestPacket(data[0]);
        }
      } catch (err) {}
    }
    if (session.session_id) loadHistory();
    return () => { isMounted = false; };
  }, [session.session_id]);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setAckReceived(false);
    setLayers(createDynamicLayers());

    // 1. Animate 12 Command Chain Steps
    for (let c = 0; c < 12; c++) {
      setCommandStepIndex(c);
      await new Promise((resolve) => setTimeout(resolve, 60));
    }

    // 2. Animate 15 Security Layers
    for (let i = 0; i < 15; i++) {
      setCurrentLayerIndex(i);
      setLayers((prev) =>
        prev.map((l, idx) => (idx === i ? { ...l, status: 'RUNNING' } : l))
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      setLayers((prev) =>
        prev.map((l, idx) => (idx === i ? { ...l, status: 'PASSED' } : l))
      );
    }

    try {
      const res = await sendSCADACommand({
        session_uuid: session.session_id,
        source_node: session.source_node,
        destination_node: session.destination_node,
        command: `${selectedCommand}_${selectedDevice}`,
        parameters: { role: selectedRole, device: selectedDevice }
      });

      setLatestPacket(res);
      setHistory((prev) => [res, ...prev]);
      setAckReceived(true);

      // Update Digital Twin Telemetry
      setTelemetry((prev) => ({
        ...prev,
        voltage: 230.0 + Math.random() * 2.0,
        current: 14.0 + Math.random() * 1.5,
        breakerState: selectedCommand.includes('OPEN') ? 'OPEN' : 'CLOSED',
        relayState: selectedCommand.includes('TRIP') ? 'TRIPPED' : 'ENERGIZED'
      }));

      setTimelineSteps((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          label: `ACK ${res.command}`,
          latencyMs: 24
        }
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to encrypt and send SCADA command.');
    } finally {
      setLoading(false);
      setCurrentLayerIndex(-1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature 12: Top System Status Ribbon */}
      <SCADASystemRibbon
        sessionStatus={session.status}
        keyValid={true}
        targetDevice={selectedDevice}
        latencyMs={18}
      />

      {/* Feature 1: End-to-End Command Chain */}
      <SCADACommandChain currentStepIndex={commandStepIndex} />

      {/* Main SOC Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Command Console & Motion */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Radio className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100 font-sans">
                SCADA Command Execution Console
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 font-sans font-semibold mb-1">
                  Target Device
                </label>
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {devices.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-sans font-semibold mb-1">
                  Operator Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-sans font-semibold mb-1">
                  SCADA Command
                </label>
                <select
                  value={selectedCommand}
                  onChange={(e) => setSelectedCommand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {commands.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Execution Button */}
              <button
                onClick={handleExecute}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing 15-Layer SCADA Pipeline...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Submit & Execute SCADA Command
                  </>
                )}
              </button>

              {/* Continuous Workflow CTA to Module 6 */}
              {onNavigateToModule6 && (
                <button
                  onClick={onNavigateToModule6}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 rounded-xl font-bold text-xs font-sans flex items-center justify-center gap-2 transition-all"
                >
                  <span>Verify Packet in Module 6 Zero-Trust</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Live Packet Transport Motion */}
          <SCADAPacketMotion
            isTransmitting={loading}
            ackReceived={ackReceived}
            sourceNode={session.source_node}
            destinationNode={session.destination_node}
            command={selectedCommand}
            onForwardToZeroTrust={onNavigateToModule6}
          />

          {/* Substation RTU Digital Twin */}
          <DeviceDigitalTwin
            device={selectedDevice}
            voltage={telemetry.voltage}
            current={telemetry.current}
            frequency={telemetry.frequency}
            temperature={telemetry.temperature}
            breakerState={telemetry.breakerState}
            relayState={telemetry.relayState}
            trustScore={telemetry.trustScore}
          />
        </div>

        {/* Center/Right Column: 15-Layer Visualizer & Cryptography */}
        <div className="lg:col-span-8 space-y-6">
          {/* 15-Layer SCADA Pipeline Progress */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <SCADAPipelineProgress
              layers={layers}
              currentActiveLayerIndex={currentLayerIndex}
            />
          </div>

          {/* Crypto Inspector & Packet Hierarchy Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EncryptionInspector
              ciphertext={latestPacket?.ciphertext_b64 || ''}
              nonce={latestPacket?.nonce_b64 || ''}
              tag={latestPacket?.tag_b64 || ''}
              signature={latestPacket?.hmac_signature || ''}
            />

            <PacketEnvelopeTree
              packetId={latestPacket?.packet_id || 'pkt_849201'}
              sessionId={session.session_id}
              sourceNode={session.source_node}
              destinationNode={session.destination_node}
              sequenceNumber={history.length + 1}
              nonce={latestPacket?.nonce_b64 || ''}
              ciphertext={latestPacket?.ciphertext_b64 || ''}
              tag={latestPacket?.tag_b64 || ''}
              signature={latestPacket?.hmac_signature || ''}
            />
          </div>

          {/* Threat Monitor & Transport Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThreatPanel
              replayAttempts={0}
              tamperCount={0}
              ackStatus={ackReceived ? 'CONFIRMED (24ms)' : 'WAITING'}
            />
            <SCADATransportTimeline steps={timelineSteps} />
          </div>

          {/* Immutable SCADA Audit Log Table */}
          <SCADAAuditPanel history={history} />
        </div>
      </div>
    </div>
  );
};
