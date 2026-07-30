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

import { SCADA_CATALOG, SCADACategoryDefinition } from '../data/scadaCatalog';

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
  const roles = ['GRID_ADMIN', 'CONTROL_OPERATOR', 'SUBSTATION_ENGINEER', 'FIELD_ENGINEER', 'VIEWER'];

  const targetNodes = React.useMemo(() => {
    if (session.destination_node && session.destination_node.includes(',')) {
      return session.destination_node.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [session.destination_node || 'Substation_A'];
  }, [session.destination_node]);

  const [activeSubstationTab, setActiveSubstationTab] = useState<string>(targetNodes[0] || 'Substation_A');

  // Multi-substation configuration state mapping
  const [substationConfigs, setSubstationConfigs] = useState<Record<string, { categoryId: string; device: string; command: string }>>({
    'Substation_A': { categoryId: 'breaker', device: 'Intelligent Electronic Breaker (IEC 61850)', command: 'TRIP_BREAKER' },
    'Substation_B': { categoryId: 'transformer', device: 'Step-Down Transformer', command: 'SET_TAP_POSITION' },
    'Substation_C': { categoryId: 'relay', device: 'Numerical Relay', command: 'UPDATE_RELAY_SETTINGS' },
    'Substation_D': { categoryId: 'controller', device: 'Grid Control Center', command: 'EMERGENCY_SHUTDOWN' },
  });

  const [selectedRoleId, setSelectedRoleId] = useState<string>('GRID_ADMIN');
  const [singleCategory, setSingleCategory] = useState<string>('breaker');
  const [singleDevice, setSingleDevice] = useState<string>('Intelligent Electronic Breaker (IEC 61850)');
  const [singleCommand, setSingleCommand] = useState<string>('TRIP_BREAKER');

  const updateSubstationCategory = (node: string, catId: string) => {
    const cat = SCADA_CATALOG.find((c) => c.id === catId) || SCADA_CATALOG[0];
    setSubstationConfigs((prev) => ({
      ...prev,
      [node]: {
        categoryId: catId,
        device: cat.devices[0],
        command: cat.commands[0]
      }
    }));
  };

  const updateSubstationField = (node: string, field: 'device' | 'command', val: string) => {
    setSubstationConfigs((prev) => ({
      ...prev,
      [node]: {
        ...prev[node] || { categoryId: 'breaker', device: 'Intelligent Electronic Breaker (IEC 61850)', command: 'TRIP_BREAKER' },
        [field]: val
      }
    }));
  };

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
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    // 2. Animate 15 Security Layers
    for (let i = 0; i < 15; i++) {
      setCurrentLayerIndex(i);
      setLayers((prev) =>
        prev.map((l, idx) => (idx === i ? { ...l, status: 'RUNNING' } : l))
      );

      await new Promise((resolve) => setTimeout(resolve, 60));

      setLayers((prev) =>
        prev.map((l, idx) => (idx === i ? { ...l, status: 'PASSED' } : l))
      );
    }

    try {
      const dispatchedPackets: SCADAPacketResponse[] = [];
      for (const targetNode of targetNodes) {
        const cfg = substationConfigs[targetNode] || {
          categoryId: singleCategory,
          device: singleDevice,
          command: singleCommand
        };
        const res = await sendSCADACommand({
          session_uuid: session.session_id,
          source_node: session.source_node,
          destination_node: targetNode,
          command: `${cfg.command}_[${cfg.device}]`,
          parameters: { role: selectedRoleId, device: cfg.device, target_node: targetNode, category: cfg.categoryId }
        });
        dispatchedPackets.push(res);
      }

      if (dispatchedPackets.length > 0) {
        setLatestPacket(dispatchedPackets[0]);
        setHistory((prev) => [...dispatchedPackets, ...prev]);
      }
      setAckReceived(true);

      // Update Digital Twin Telemetry
      const activeCmd = (substationConfigs[activeSubstationTab] || {}).command || singleCommand;
      setTelemetry((prev) => ({
        ...prev,
        voltage: 230.0 + Math.random() * 2.0,
        current: 14.0 + Math.random() * 1.5,
        breakerState: activeCmd.includes('OPEN') ? 'OPEN' : 'CLOSED',
        relayState: activeCmd.includes('TRIP') ? 'TRIPPED' : 'ENERGIZED'
      }));

      setTimelineSteps((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          label: `Group ACK (${dispatchedPackets.length} Nodes)`,
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

  const activeSubConfig = substationConfigs[activeSubstationTab] || {
    categoryId: 'breaker',
    device: 'Intelligent Electronic Breaker (IEC 61850)',
    command: 'TRIP_BREAKER'
  };

  const activeSubCategoryDef = SCADA_CATALOG.find((c) => c.id === activeSubConfig.categoryId) || SCADA_CATALOG[0];

  const singleCategoryDef = SCADA_CATALOG.find((c) => c.id === singleCategory) || SCADA_CATALOG[0];

  return (
    <div className="space-y-6">
      {/* Feature 12: Top System Status Ribbon */}
      <SCADASystemRibbon
        sessionStatus={session.status}
        keyValid={true}
        targetDevice={targetNodes.length > 1 ? activeSubConfig.device : singleDevice}
        latencyMs={18}
      />

      {/* Main SOC Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Command Console & Motion */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 font-sans">
                  SCADA Command Console
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                {targetNodes.length > 1 ? 'GHZ Multi-Node Mode' : 'Single Link'}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 font-sans font-semibold mb-1">
                  Operator Authorization Role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Per-Substation Command Configurator Tabs */}
              {targetNodes.length > 1 ? (
                <div className="space-y-3 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-300 font-sans font-semibold text-[11px]">
                      Configure Substation Commands:
                    </label>
                    <span className="text-[9px] text-cyan-400 font-sans font-bold">14 SCADA Categories</span>
                  </div>

                  <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {targetNodes.map((node) => (
                      <button
                        key={node}
                        onClick={() => setActiveSubstationTab(node)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition ${
                          activeSubstationTab === node
                            ? 'bg-purple-600 text-white shadow'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        {node.replace('Substation_', 'Sub ')}
                      </button>
                    ))}
                  </div>

                  {/* Substation Specific Dynamic Form */}
                  <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3 shadow-inner">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                      <span>Target Node: <span className="text-cyan-400 font-mono">{activeSubstationTab}</span></span>
                      <span className="text-[9px] text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800 font-mono">
                        AES Key Active
                      </span>
                    </div>

                    {/* Category Selector */}
                    <div>
                      <label className="block text-slate-400 font-sans text-[10px] font-semibold mb-1">
                        1. SCADA Device Category
                      </label>
                      <select
                        value={activeSubConfig.categoryId}
                        onChange={(e) => updateSubstationCategory(activeSubstationTab, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-sans font-semibold"
                      >
                        {SCADA_CATALOG.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                        ))}
                      </select>
                    </div>

                    {/* Target Device Selector */}
                    <div>
                      <label className="block text-slate-400 font-sans text-[10px] font-semibold mb-1">
                        2. Target Device Type
                      </label>
                      <select
                        value={activeSubConfig.device}
                        onChange={(e) => updateSubstationField(activeSubstationTab, 'device', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-cyan-300 focus:outline-none focus:border-purple-500 font-mono"
                      >
                        {activeSubCategoryDef.devices.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Supported Command Selector */}
                    <div>
                      <label className="block text-slate-400 font-sans text-[10px] font-semibold mb-1">
                        3. Supported SCADA Command
                      </label>
                      <select
                        value={activeSubConfig.command}
                        onChange={(e) => updateSubstationField(activeSubstationTab, 'command', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-purple-300 focus:outline-none focus:border-purple-500 font-mono font-bold"
                      >
                        {activeSubCategoryDef.commands.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {/* Single Category Selector */}
                  <div>
                    <label className="block text-slate-400 font-sans font-semibold mb-1">
                      1. SCADA Device Category
                    </label>
                    <select
                      value={singleCategory}
                      onChange={(e) => {
                        const catId = e.target.value;
                        const cat = SCADA_CATALOG.find((c) => c.id === catId) || SCADA_CATALOG[0];
                        setSingleCategory(catId);
                        setSingleDevice(cat.devices[0]);
                        setSingleCommand(cat.commands[0]);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans font-semibold"
                    >
                      {SCADA_CATALOG.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                      ))}
                    </select>
                  </div>

                  {/* Single Device Selector */}
                  <div>
                    <label className="block text-slate-400 font-sans font-semibold mb-1">
                      2. Target Device Type
                    </label>
                    <select
                      value={singleDevice}
                      onChange={(e) => setSingleDevice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      {singleCategoryDef.devices.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Single Command Selector */}
                  <div>
                    <label className="block text-slate-400 font-sans font-semibold mb-1">
                      3. Supported SCADA Command
                    </label>
                    <select
                      value={singleCommand}
                      onChange={(e) => setSingleCommand(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-purple-300 focus:outline-none focus:border-cyan-500 font-mono font-bold"
                    >
                      {singleCategoryDef.commands.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Execution Button */}
              <button
                onClick={handleExecute}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Dispatching SCADA Commands...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    {targetNodes.length > 1 ? `Submit & Execute GHZ Group SCADA Dispatch (${targetNodes.length} Nodes)` : 'Submit & Execute SCADA Command'}
                  </>
                )}
              </button>

              {/* Continuous Workflow CTA to Module 6 */}
              {onNavigateToModule6 && (
                <button
                  onClick={onNavigateToModule6}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 rounded-xl font-bold text-xs font-sans flex items-center justify-center gap-2 transition-all"
                >
                  <span>Verify Packets in Module 6 Zero-Trust</span>
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
            command={targetNodes.length > 1 ? activeSubConfig.command : singleCommand}
            onForwardToZeroTrust={onNavigateToModule6}
          />

          {/* Substation RTU Digital Twin */}
          <DeviceDigitalTwin
            device={targetNodes.length > 1 ? activeSubConfig.device : singleDevice}
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
