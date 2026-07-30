import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchRepeaterMesh,
  executeEntanglementSwapping,
  fetchRepeaterMemory,
  fetchRepeaterMetrics,
  RepeaterMeshResponse,
  RepeaterMemoryItem,
  RepeaterMetricsResponse,
  SwappingResponse
} from '../../services/repeaterApi';
import { SessionResponse } from '../../services/sessionApi';
import { EventBus } from '../../core/EventBus';

import { IntegrationBanner } from './IntegrationBanner';
import { WhyRepeatersPanel } from './WhyRepeatersPanel';
import { QuantumNetworkTopology } from './QuantumNetworkTopology';
import { BellPairVisualizer } from './BellPairVisualizer';
import { BellStateMeasurement } from './BellStateMeasurement';
import { EntanglementSwapAnimation } from './EntanglementSwapAnimation';
import { RoutingVisualizer } from './RoutingVisualizer';
import { QuantumHealthCard } from './QuantumHealthCard';
import { EndToEndReadinessCard } from './EndToEndReadinessCard';
import { EventTimeline, TimelineEvent } from './EventTimeline';

interface RepeaterPageProps {
  session?: SessionResponse;
  sessionHistory?: SessionResponse[];
  onSelectSession?: (session: SessionResponse) => void;
}

export const RepeaterPage: React.FC<RepeaterPageProps> = ({ session }) => {
  const [distanceKm, setDistanceKm] = useState<number>(120);
  const [noiseEnabled, setNoiseEnabled] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  const [stage, setStage] = useState<'INITIAL' | 'BELL_PAIRS' | 'SWAP_R1' | 'SWAP_R2' | 'SWAP_R3' | 'END_TO_END'>('INITIAL');
  const [bellCounter, setBellCounter] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const [mesh, setMesh] = useState<RepeaterMeshResponse | null>(null);
  const [lastSwap, setLastSwap] = useState<SwappingResponse | null>(null);

  const [events, setEvents] = useState<TimelineEvent[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      title: 'Module 7 Initialized',
      detail: 'Quantum Repeater Mesh & Real-Time Physics Engine Active.',
      status: 'INFO'
    }
  ]);

  // Real-Time Physics Formulas
  const dynamicPhysics = useMemo(() => {
    const hops = 4;
    const singleHopDist = distanceKm / hops;
    const alpha_dB = noiseEnabled ? 0.25 : 0.20;
    const totalAttenuation_dB = parseFloat((distanceKm * alpha_dB).toFixed(2));
    
    // Speed of light in optical fiber (v = 200,000 km/s) => latency_ms = distance / 200
    const latency_ms = parseFloat((distanceKm / 200.0).toFixed(2));
    
    // Swaps completed count based on stage
    const swapsCompleted =
      stage === 'SWAP_R1' ? 1 : stage === 'SWAP_R2' ? 2 : stage === 'END_TO_END' || stage === 'SWAP_R3' ? 3 : 0;

    // Multi-hop repeater fidelity formula
    const alpha_hop = noiseEnabled ? 0.0025 : 0.0012;
    const singleHopFid = 0.98 * Math.exp(-alpha_hop * singleHopDist);
    const swapPenalty = noiseEnabled ? 0.965 : 0.985;
    const currentFidelity = parseFloat(
      (Math.min(0.98, Math.max(0.70, singleHopFid * Math.pow(swapPenalty, Math.max(1, swapsCompleted)))) * 100).toFixed(1)
    );

    // Swap success probability
    const baseProb = noiseEnabled ? 0.920 : 0.985;
    const swapSuccessProb = parseFloat((Math.max(0.65, baseProb * Math.pow(0.99, swapsCompleted)) * 100).toFixed(1));

    // Dynamic memory statuses per repeater node
    const memoryStatuses: RepeaterMemoryItem[] = [
      {
        repeater_id: 'Repeater_R1',
        fidelity: parseFloat((currentFidelity / 100).toFixed(3)),
        lifetime_remaining_pct: parseFloat((99.0 - (noiseEnabled ? 12.0 : 4.0)).toFixed(1)),
        stored_pairs: Math.max(2, 8 - (swapsCompleted >= 1 ? 1 : 0)),
        max_capacity: 8,
        coherence_time_ms: parseFloat((200.0 - distanceKm * 0.4).toFixed(1)),
        status: currentFidelity >= 85 ? 'HEALTHY' : 'DEGRADED'
      },
      {
        repeater_id: 'Repeater_R2',
        fidelity: parseFloat(((currentFidelity - 1.5) / 100).toFixed(3)),
        lifetime_remaining_pct: parseFloat((95.0 - (noiseEnabled ? 15.0 : 6.0)).toFixed(1)),
        stored_pairs: Math.max(2, 8 - (swapsCompleted >= 2 ? 1 : 0)),
        max_capacity: 8,
        coherence_time_ms: parseFloat((185.0 - distanceKm * 0.4).toFixed(1)),
        status: currentFidelity >= 85 ? 'HEALTHY' : 'DEGRADED'
      },
      {
        repeater_id: 'Repeater_R3',
        fidelity: parseFloat(((currentFidelity - 2.8) / 100).toFixed(3)),
        lifetime_remaining_pct: parseFloat((90.0 - (noiseEnabled ? 18.0 : 8.0)).toFixed(1)),
        stored_pairs: Math.max(2, 8 - (swapsCompleted >= 3 ? 1 : 0)),
        max_capacity: 8,
        coherence_time_ms: parseFloat((170.0 - distanceKm * 0.4).toFixed(1)),
        status: currentFidelity >= 85 ? 'HEALTHY' : 'DEGRADED'
      }
    ];

    return {
      hops,
      singleHopDist,
      totalAttenuation_dB,
      latency_ms,
      swapsCompleted,
      currentFidelity,
      swapSuccessProb,
      memoryStatuses
    };
  }, [distanceKm, noiseEnabled, stage]);

  const loadData = async (dist = distanceKm, noise = noiseEnabled) => {
    try {
      const meshRes = await fetchRepeaterMesh(dist, noise);
      if (meshRes) setMesh(meshRes);
    } catch (err) {
      console.error('Failed loading Module 7 mesh data', err);
    }
  };

  useEffect(() => {
    loadData(distanceKm, noiseEnabled);

    // Subscribe to WebSocket events
    const unsubSwap = EventBus.on('SWAP_COMPLETED', (data: any) => {
      addEvent(`BSM Swap at ${data.repeater_node}`, `BSM Outcome: ${data.bsm_result}, Fidelity: ${(data.fidelity * 100).toFixed(1)}%`);
    });

    return () => {
      unsubSwap();
    };
  }, [distanceKm, noiseEnabled]);

  const addEvent = (title: string, detail: string) => {
    setEvents((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        title,
        detail,
        status: 'SUCCESS'
      },
      ...prev
    ]);
  };

  // Automated step-by-step sequence playback
  const runSequence = async () => {
    if (isRunning) return;
    setIsRunning(true);
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms / speedMultiplier));

    // Step 1: Bell Pair Creation
    setStage('BELL_PAIRS');
    addEvent('Bell Pairs Generated', 'EPR Bell pairs |Ψ⁻⟩ distributed across adjacent repeaters.');
    for (let c = 1; c <= 24; c += 3) {
      setBellCounter(c);
      await delay(120);
    }
    setBellCounter(24);
    await delay(500);

    // Step 2: Swap at Repeater R1
    setStage('SWAP_R1');
    try {
      const res1 = await executeEntanglementSwapping({
        session_uuid: session?.session_id || 'sim-session',
        repeater_node: 'Repeater_R1',
        source_node: 'Control_Center',
        destination_node: 'Repeater_R2'
      });
      setLastSwap(res1);
      addEvent('BSM Swap executed at Repeater R1', `BSM Outcome: ${res1.bsm_result}, Swapped Fidelity: ${(res1.swapped_fidelity * 100).toFixed(1)}%`);
    } catch (err) {}
    await delay(900);

    // Step 3: Swap at Repeater R2
    setStage('SWAP_R2');
    try {
      const res2 = await executeEntanglementSwapping({
        session_uuid: session?.session_id || 'sim-session',
        repeater_node: 'Repeater_R2',
        source_node: 'Control_Center',
        destination_node: 'Repeater_R3'
      });
      setLastSwap(res2);
      addEvent('BSM Swap executed at Repeater R2', `BSM Outcome: ${res2.bsm_result}, Swapped Fidelity: ${(res2.swapped_fidelity * 100).toFixed(1)}%`);
    } catch (err) {}
    await delay(900);

    // Step 4: Swap at Repeater R3 -> End-to-End!
    setStage('END_TO_END');
    try {
      const res3 = await executeEntanglementSwapping({
        session_uuid: session?.session_id || 'sim-session',
        repeater_node: 'Repeater_R3',
        source_node: 'Control_Center',
        destination_node: 'Substation_A'
      });
      setLastSwap(res3);
      addEvent('End-to-End Entanglement Established', `Direct Quantum Channel active between Control Center and Substation A. Ready for Module 3 Key Generation.`);
    } catch (err) {}

    setIsRunning(false);
  };

  const handleStepSwap = async () => {
    if (stage === 'INITIAL') {
      setStage('BELL_PAIRS');
      setBellCounter(24);
      addEvent('Bell Pairs Generated', 'EPR pairs created.');
    } else if (stage === 'BELL_PAIRS') {
      setStage('SWAP_R1');
      addEvent('BSM Swap R1', 'Entanglement extended to R2.');
    } else if (stage === 'SWAP_R1') {
      setStage('SWAP_R2');
      addEvent('BSM Swap R2', 'Entanglement extended to R3.');
    } else if (stage === 'SWAP_R2') {
      setStage('END_TO_END');
      addEvent('End-to-End Entanglement Established', 'Ready for E91 QKD key distribution.');
    }
  };

  const handleReset = () => {
    setStage('INITIAL');
    setBellCounter(0);
    setLastSwap(null);
    setIsRunning(false);
  };

  return (
    <div className="space-y-8">
      {/* SECTION A: Module Objective & System Architecture Integration */}
      <IntegrationBanner />

      {/* SECTION B: Why Quantum Repeaters (Real-Time Dynamic Math) */}
      <WhyRepeatersPanel distanceKm={distanceKm} noiseEnabled={noiseEnabled} />

      {/* SECTION C: Simulation Configuration */}
      <EntanglementSwapAnimation
        onRunSequence={runSequence}
        onStepSwap={handleStepSwap}
        onReset={handleReset}
        onReplay={runSequence}
        isRunning={isRunning}
        noiseEnabled={noiseEnabled}
        onToggleNoise={(val) => { setNoiseEnabled(val); loadData(distanceKm, val); }}
        distanceKm={distanceKm}
        onChangeDistance={(dist) => { setDistanceKm(dist); loadData(dist, noiseEnabled); }}
        speedMultiplier={speedMultiplier}
        onChangeSpeed={setSpeedMultiplier}
        currentStage={stage}
      />

      {/* SECTION D: Quantum Network Topology (VISUAL CENTERPIECE) */}
      {mesh && (
        <QuantumNetworkTopology
          nodes={mesh.quantum_repeaters}
          stage={stage}
          distanceKm={distanceKm}
        />
      )}

      {/* SECTION E: Bell Pair Generation */}
      <BellPairVisualizer counter={bellCounter} stage={stage} distanceKm={distanceKm} noiseEnabled={noiseEnabled} />

      {/* SECTION F: Bell State Measurement */}
      <BellStateMeasurement
        repeaterId={lastSwap?.repeater_node || 'Repeater_R1'}
        bsmOutcome={lastSwap?.bsm_result || '|Phi+>'}
        swappedFidelity={lastSwap?.swapped_fidelity || dynamicPhysics.currentFidelity / 100}
        status={lastSwap?.entanglement_status || 'READY'}
      />

      {/* SECTION I: Dynamic Dijkstra Routing Visualizer */}
      {mesh && (
        <RoutingVisualizer
          availableRoutes={mesh.available_routes}
          distanceKm={distanceKm}
        />
      )}

      {/* SECTION J: Quantum Network Health & QKD Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuantumHealthCard
          networkHealthPct={Math.round(dynamicPhysics.currentFidelity)}
          activeRepeatersCount={dynamicPhysics.memoryStatuses.filter((m) => m.status === 'HEALTHY').length}
          totalRepeatersCount={dynamicPhysics.memoryStatuses.length}
          memoryEfficiencyPct={Math.round(
            dynamicPhysics.memoryStatuses.reduce((acc, m) => acc + m.lifetime_remaining_pct, 0) /
              dynamicPhysics.memoryStatuses.length
          )}
          linkStatus={stage === 'END_TO_END' ? 'END-TO-END ESTABLISHED' : 'STABLE'}
        />
        <EndToEndReadinessCard
          isReady={stage === 'END_TO_END'}
          distanceKm={distanceKm}
          fidelity={dynamicPhysics.currentFidelity / 100}
          latencyMs={dynamicPhysics.latency_ms}
          bellPairs={bellCounter || (stage === 'END_TO_END' ? 24 : 0)}
        />
      </div>

      {/* SECTION K: Event Timeline (ALWAYS LAST) */}
      <EventTimeline events={events} />
    </div>
  );
};
