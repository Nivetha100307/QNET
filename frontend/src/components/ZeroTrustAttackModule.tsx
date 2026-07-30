import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Radio,
  Play,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';

import { SessionResponse, simulateAttack, AttackSimulationResponse } from '../services';

import { MiniNetworkTopology } from './soc/MiniNetworkTopology';
import { TrustGauge } from './soc/TrustGauge';
import { RiskBadge } from './soc/RiskBadge';
import { StageInfo } from './soc/StageCard';
import { PipelineProgress } from './soc/PipelineProgress';
import { DecisionTreePanel } from './soc/DecisionTreePanel';
import { AttackImpactCard } from './soc/AttackImpactCard';
import { PacketInspector } from './soc/PacketInspector';
import { PipelineSummaryCard } from './soc/PipelineSummaryCard';
import { SecurityTimeline, TimelineEventItem } from './soc/SecurityTimeline';
import { AuditTable, AuditLogEntry } from './soc/AuditTable';

interface ZeroTrustAttackModuleProps {
  session: SessionResponse;
  sessionHistory: SessionResponse[];
  onSelectSession: (session: SessionResponse) => void;
}

const createDynamicStages = (intensity: number = 1.0): StageInfo[] => {
  const baseList = [
    { number: 1, name: 'Identity Verification', category: 'Entity Registry', base: 10 },
    { number: 2, name: 'Authentication Check', category: 'HMAC-SHA256', base: 12 },
    { number: 3, name: 'RBAC Authorization', category: 'Role Matrix', base: 6 },
    { number: 4, name: 'Session Validation', category: 'State Machine', base: 5 },
    { number: 5, name: 'Timestamp Freshness', category: 'Drift <= 5s', base: 4 },
    { number: 6, name: 'Nonce Uniqueness', category: 'Deduplication Cache', base: 8 },
    { number: 7, name: 'Sequence Continuity', category: 'Monotonic Tracker', base: 6 },
    { number: 8, name: 'Schema Validation', category: 'Pydantic v2', base: 11 },
    { number: 9, name: 'Protocol Version', category: 'E91 Alignment', base: 3 },
    { number: 10, name: 'Payload Bounds', category: 'Parameter Bounds', base: 9 },
    { number: 11, name: 'Integrity Check', category: 'SHA-256 Bit Match', base: 15 },
    { number: 12, name: 'SHA-256 Fingerprint', category: 'Digest Match', base: 13 },
    { number: 13, name: 'HMAC Verification', category: 'Constant-Time', base: 18 },
    { number: 14, name: 'Audit Logging', category: 'Event Logger', base: 8 },
    { number: 15, name: 'Replay Protection', category: 'Cache Verifier', base: 10 },
    { number: 16, name: 'Hardware Health', category: 'Substation PLC', base: 20 },
    { number: 17, name: 'Security Policy', category: 'Policy Engine', base: 15 },
    { number: 18, name: 'Trust Evaluation', category: 'Score >= 50.0', base: 12 },
    { number: 19, name: 'Risk Assessment', category: 'Risk Engine', base: 10 },
    { number: 20, name: 'Security Decision', category: 'ALLOW / BLOCK', base: 6 },
  ];

  return baseList.map((s) => ({
    number: s.number,
    name: s.name,
    category: s.category,
    status: 'WAITING',
    latencyMs: Math.max(3, Math.round((s.base + Math.abs(Math.sin(s.number * 1.5)) * 5) * Math.sqrt(intensity)))
  }));
};

export const ZeroTrustAttackModule: React.FC<ZeroTrustAttackModuleProps> = ({
  session,
  sessionHistory,
  onSelectSession
}) => {
  const [activeTab, setActiveTab] = useState<string>('module6');

  const [attackPreset, setAttackPreset] = useState<string>('MITM');
  const [attackIntensity, setAttackIntensity] = useState<number>(1.0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(-1);

  const [stages, setStages] = useState<StageInfo[]>(() => createDynamicStages(1.0));
  const [trustScore, setTrustScore] = useState<number>(98.5);
  const [riskLevel, setRiskLevel] = useState<string>('LOW');
  const [decision, setDecision] = useState<'ALLOW' | 'BLOCK' | 'PENDING'>('PENDING');

  const [attackResult, setAttackResult] = useState<AttackSimulationResponse | null>(null);

  const [timelineEvents, setTimelineEvents] = useState<TimelineEventItem[]>([
    { timestamp: new Date().toLocaleTimeString(), stageName: 'Identity Verified', status: 'PASSED' },
    { timestamp: new Date().toLocaleTimeString(), stageName: 'HMAC Passed', status: 'PASSED' },
    { timestamp: new Date().toLocaleTimeString(), stageName: 'Replay Cache Clean', status: 'PASSED' },
    { timestamp: new Date().toLocaleTimeString(), stageName: 'Trust Score 98.5', status: 'PASSED' },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), stage: 'Stage 01', severity: 'INFO', message: 'Entity ID Control_Center authenticated.' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), stage: 'Stage 02', severity: 'INFO', message: 'HMAC-SHA256 signature match confirmed.' },
    { id: '3', timestamp: new Date().toLocaleTimeString(), stage: 'Stage 07', severity: 'INFO', message: 'Sequence number #12 continuity verified.' },
  ]);

  const handleLaunchAttack = async () => {
    setIsSimulating(true);
    setDecision('PENDING');
    setStages(createDynamicStages(attackIntensity));

    let targetDecision: 'ALLOW' | 'BLOCK' = 'ALLOW';
    let failedStageNum = -1;

    if (attackPreset === 'MITM') {
      failedStageNum = 11; // Stage 11: Integrity Check (SHA-256 Bit Match)
      targetDecision = 'BLOCK';
    } else if (attackPreset === 'REPLAY') {
      failedStageNum = 7; // Stage 7: Sequence Continuity
      targetDecision = 'BLOCK';
    } else if (attackPreset === 'PACKET_TAMPERING') {
      failedStageNum = 8; // Stage 8: Schema Validation
      targetDecision = 'BLOCK';
    } else if (attackPreset === 'DENIAL_OF_SERVICE') {
      failedStageNum = 18; // Stage 18: Trust Evaluation
      targetDecision = 'BLOCK';
    } else if (attackPreset === 'EAVESDROPPING') {
      failedStageNum = 9; // Stage 9: Protocol Version / QBER Check
      targetDecision = 'BLOCK';
    } else if (attackPreset === 'FIBER_TAPPING') {
      failedStageNum = 9; // Stage 9: Passive Optical Beam Splitting -> QBER Spike & CHSH Violation
      targetDecision = 'BLOCK';
    } else if (attackPreset === 'PNS_ATTACK') {
      failedStageNum = 9; // Stage 9: Passive Photon Number Splitting -> Fidelity Collapse
      targetDecision = 'BLOCK';
    }

    // Step-by-step 20-stage sequential animation loop (180ms per stage)
    for (let i = 0; i < 20; i++) {
      setActiveStageIndex(i);

      setStages((prev) =>
        prev.map((stg, idx) => {
          if (idx === i) return { ...stg, status: 'RUNNING' };
          return stg;
        })
      );

      await new Promise((resolve) => setTimeout(resolve, 180));

      const isFailureStage = i + 1 === failedStageNum;
      const statusToSet = isFailureStage ? 'FAILED' : 'PASSED';

      setStages((prev) =>
        prev.map((stg, idx) => {
          if (idx === i) return { ...stg, status: statusToSet };
          return stg;
        })
      );

      // Dynamically animate trust score degradation
      if (isFailureStage) {
        setTrustScore((prev) => Math.max(35.0, prev - 35.0));
        setRiskLevel('HIGH');
      }

      if (isFailureStage) break;
    }

    try {
      const res = await simulateAttack({
        session_uuid: session.session_id,
        attack_type: attackPreset as any,
        intensity: attackIntensity
      });
      setAttackResult(res);
      const finalDecision = res.detected && failedStageNum > 0 ? 'BLOCK' : 'ALLOW';
      setDecision(finalDecision);

      // Append Audit Log
      setAuditLogs((prev) => [
        {
          id: `${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          stage: failedStageNum > 0 ? `Stage ${failedStageNum}` : 'Stage 20',
          severity: finalDecision === 'BLOCK' ? 'CRITICAL' : 'INFO',
          message: res.details
        },
        ...prev
      ]);

      // Append Timeline
      setTimelineEvents((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString(),
          stageName: `Decision ${finalDecision}`,
          status: finalDecision === 'ALLOW' ? 'PASSED' : 'FAILED'
        }
      ]);
    } catch (err) {
      setDecision('BLOCK');
    } finally {
      setIsSimulating(false);
      setActiveStageIndex(-1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quantum Context Banner (Modules 3 -> 5 -> 6 Link) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 backdrop-blur-md flex items-center justify-between font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 font-sans font-bold">End-to-End Quantum Security Chain:</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            Session #{session.id} (Mod 1)
          </span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
            E91 Shared Key (Mod 3)
          </span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            AES-256-GCM (Mod 5)
          </span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
            Zero-Trust Pipeline (Mod 6)
          </span>
        </div>
      </div>

      {/* Main SOC Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Attack Controls & Topology */}
        <div className="lg:col-span-4 space-y-6">
          {/* Attack Configuration Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h3 className="text-sm font-bold text-slate-100 font-sans">
                Adversarial Attack Injector
              </h3>
            </div>

            {/* All 5 Attack Vector Preset Tabs */}
            <div className="space-y-3 font-mono text-xs">
              <label className="block text-slate-400 font-sans font-semibold">
                Select Attack Vector Preset:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'MITM', name: '⚡ MITM Tamper (Stage 11)' },
                  { id: 'REPLAY', name: '⚡ Replay Attack (Stage 7)' },
                  { id: 'EAVESDROPPING', name: '👁️ Eve Intercept (Stage 9)' },
                  { id: 'FIBER_TAPPING', name: '👁️ Passive Fiber Tap (Stage 9)' },
                  { id: 'PNS_ATTACK', name: '👁️ Passive PNS Attack (Stage 9)' },
                  { id: 'PACKET_TAMPERING', name: '⚡ Bit Flip (Stage 8)' },
                  { id: 'DENIAL_OF_SERVICE', name: '⚡ DoS Flood (Stage 18)' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAttackPreset(a.id)}
                    className={`p-2 rounded-lg border text-[10px] font-bold text-left transition-all ${
                      attackPreset === a.id
                        ? 'bg-rose-950/80 border-rose-600 text-rose-300 shadow-md shadow-rose-950/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>

              {/* Intensity Slider */}
              <div className="pt-2">
                <div className="flex justify-between text-slate-400 text-[11px] mb-1 font-sans">
                  <span>Attack Intensity</span>
                  <span className="text-cyan-400 font-bold font-mono">{(attackIntensity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={attackIntensity}
                  onChange={(e) => setAttackIntensity(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
              </div>

              {/* Launch Button */}
              <button
                onClick={handleLaunchAttack}
                disabled={isSimulating}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing 20-Stage Pipeline...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Inject Attack & Execute 20-Stage Pipeline
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mini Network Topology Visualizer */}
          <MiniNetworkTopology
            sourceNode={session.source_node}
            destinationNode={session.destination_node}
            isSimulating={isSimulating}
            attackType={attackPreset}
            decision={decision}
          />

          {/* Trust Gauge & Risk Badge */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col items-center space-y-4">
            <TrustGauge score={trustScore} size={140} />
            <RiskBadge level={riskLevel} />
          </div>
        </div>

        {/* Center/Right Column: 20-Stage Visualizer & Telemetry */}
        <div className="lg:col-span-8 space-y-6">
          {/* 20-Stage Visualizer Grid */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-2xl">
            <PipelineProgress
              stages={stages}
              currentActiveStageIndex={activeStageIndex}
            />
          </div>

          {/* Decision Tree & Packet Telemetry Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Decision Tree Panel */}
            <DecisionTreePanel
              stages={stages}
              decision={decision}
              trustScore={trustScore}
            />

            {/* Packet Inspector */}
            <PacketInspector
              packetId={latestPacketId(session.id)}
              sequenceNumber={14}
              timestampDriftSec={0.38}
            />
          </div>

          {/* Attack Impact & Final Summary */}
          {attackResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AttackImpactCard
                attackType={attackResult.attack_type}
                detected={attackResult.detected}
                trustScoreImpact={attackResult.trust_score_impact}
                mitigationAction={attackResult.mitigation_action}
                details={attackResult.details}
              />

              <PipelineSummaryCard
                attackType={attackResult.attack_type}
                packetId={attackResult.attack_id}
                trustScore={trustScore}
                riskLevel={riskLevel}
                latencyMs={245}
                decision={decision === 'ALLOW' ? 'ALLOW' : 'BLOCK'}
              />
            </div>
          )}

          {/* Security Timeline */}
          <SecurityTimeline events={timelineEvents} />

          {/* Audit Log Table */}
          <AuditTable logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};

function latestPacketId(id: number): string {
  return `pkt_sec_${id * 1000 + 42}`;
}
