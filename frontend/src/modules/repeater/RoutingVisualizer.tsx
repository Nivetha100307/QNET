import React, { useState, useEffect } from 'react';
import {
  fetchQuarcStatus,
  triggerQuarcRecluster,
  QuarcStatusPayload,
  QuarcCluster
} from '../../services/repeaterApi';

import { QuarcControlCenterHeader } from './quarc/QuarcControlCenterHeader';
import { QuarcExecutionPipeline } from './quarc/QuarcExecutionPipeline';
import { QuarcNetworkTopologyCanvas } from './quarc/QuarcNetworkTopologyCanvas';
import { QuarcClusterInspectorPanel } from './quarc/QuarcClusterInspectorPanel';
import { QuarcEntanglementSchedulerBar } from './quarc/QuarcEntanglementSchedulerBar';
import { QuarcLivePhotonPropagation } from './quarc/QuarcLivePhotonPropagation';
import { QuarcLiveEventTimeline, QuarcEventLog } from './quarc/QuarcLiveEventTimeline';
import { ClusterInspector } from './quarc/ClusterInspector';

interface RoutingVisualizerProps {
  availableRoutes?: any[];
  distanceKm?: number;
}

export const RoutingVisualizer: React.FC<RoutingVisualizerProps> = ({
  distanceKm = 120
}) => {
  const [quarcData, setQuarcData] = useState<QuarcStatusPayload | null>(null);
  const [activeDestination, setActiveDestination] = useState<string>('Substation_B');
  const [selectedCluster, setSelectedCluster] = useState<QuarcCluster | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const [currentStageIdx, setCurrentStageIdx] = useState<number>(3);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [reclusterLoading, setReclusterLoading] = useState<boolean>(false);

  const [events, setEvents] = useState<QuarcEventLog[]>([
    { time: '09:31:24', text: 'Clusters re-evaluated (4 active)', type: 'success' },
    { time: '09:31:25', text: 'Best route: Cluster A ➔ Substation B', type: 'info' },
    { time: '09:31:26', text: 'Bell pair reserved on link R2 ➔ R4', type: 'info' },
    { time: '09:31:27', text: 'BSM operation started @ R6', type: 'warn' },
    { time: '09:31:28', text: 'Photon transmitted: Cluster B ➔ Substation B', type: 'success' },
  ]);

  const loadQuarcData = async (dest: string = activeDestination) => {
    try {
      const data = await fetchQuarcStatus('Control_Center', dest);
      if (data) {
        setQuarcData(data);
        if (!selectedCluster && data.clusters.length > 0) {
          setSelectedCluster(data.clusters[1] || data.clusters[0]);
        }
      }
    } catch (err) {
      // Fallback
    }
  };

  useEffect(() => {
    loadQuarcData(activeDestination);
    const interval = setInterval(() => loadQuarcData(activeDestination), 4000);
    return () => clearInterval(interval);
  }, [activeDestination]);

  const handleDestinationChange = async (newDest: string) => {
    setActiveDestination(newDest);
    setCurrentStageIdx(1);
    setIsPaused(false);
    setEvents((prev) => [
      { time: new Date().toLocaleTimeString(), text: `Destination changed to ${newDest.replace('_', ' ')}. Rerunning QuARC...`, type: 'info' },
      ...prev
    ]);
    await loadQuarcData(newDest);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentStageIdx((prev) => (prev >= 6 ? 1 : prev + 1));
    }, 2500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleRecluster = async () => {
    setReclusterLoading(true);
    try {
      await triggerQuarcRecluster();
      await loadQuarcData(activeDestination);
      setEvents((prev) => [
        { time: new Date().toLocaleTimeString(), text: 'Dynamic QuARC Re-Clustering Triggered', type: 'success' },
        ...prev
      ]);
    } catch (err) {
      // Silent catch
    } finally {
      setReclusterLoading(false);
    }
  };

  const defaultClusters: QuarcCluster[] = [
    { id: 'Cluster-A', name: 'Cluster A', nodes: ['R1', 'R2'], leader: 'Control_Center', health: 97.8, avg_fidelity: 98.4, avg_qber: 1.1, avg_memory_ms: 28, avg_swap_success: 0.96 },
    { id: 'Cluster-B', name: 'Cluster B', nodes: ['R4', 'R5', 'R7'], leader: 'Repeater_R2', health: 96.2, avg_fidelity: 97.86, avg_qber: 1.25, avg_memory_ms: 24, avg_swap_success: 0.95 },
    { id: 'Cluster-C', name: 'Cluster C', nodes: ['R6', 'R8', 'R9', 'R10', 'R11'], leader: 'Repeater_R3', health: 94.6, avg_fidelity: 96.7, avg_qber: 2.1, avg_memory_ms: 22, avg_swap_success: 0.92 },
    { id: 'Cluster-D', name: 'Cluster D', nodes: ['R12', 'R13', 'R14', 'R15'], leader: 'Repeater_R2', health: 88.1, avg_fidelity: 95.2, avg_qber: 2.8, avg_memory_ms: 19, avg_swap_success: 0.88 },
  ];

  const clusters = quarcData?.clusters && quarcData.clusters.length >= 3 ? quarcData.clusters : defaultClusters;
  const activeCluster = selectedCluster || clusters[1] || clusters[0];

  return (
    <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border-2 border-cyan-500/40 shadow-2xl space-y-4">
      {/* 1. TOP HEADER RIBBON */}
      <QuarcControlCenterHeader
        activeDestination={activeDestination}
        onDestinationChange={handleDestinationChange}
        activeRouteStr="Cluster A ➔ Cluster B"
        activeNodePathStr={`Control Center ➔ R1 ➔ R2 ➔ ${activeDestination.replace('_', ' ')}`}
        routeScore={quarcData?.overall_score || 92.63}
        expectedSwapSuccess={95.47}
        networkHealth={quarcData?.metrics?.overall_health || 87.9}
        totalNodes={18}
        activeLinks={26}
        bellPairs={432}
        activeSwaps={5}
        autoRefreshSec={1}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
        onRecluster={handleRecluster}
        reclusterLoading={reclusterLoading}
      />

      {/* 2. MAIN MIDDLE SECTION (12 Columns Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Column (3 Columns): 6-Stage Execution Pipeline & Cluster Health Overview */}
        <div className="lg:col-span-3">
          <QuarcExecutionPipeline
            currentStageIdx={currentStageIdx}
            clusters={clusters}
            onSelectCluster={setSelectedCluster}
            selectedClusterId={activeCluster.id}
          />
        </div>

        {/* Center Main Canvas (6 Columns): Live Quantum Network Topology */}
        <div className="lg:col-span-6">
          <QuarcNetworkTopologyCanvas
            clusters={clusters}
            activeDestination={activeDestination}
            selectedClusterId={activeCluster.id}
            onSelectCluster={setSelectedCluster}
            currentStageIdx={currentStageIdx}
          />
        </div>

        {/* Right Column (3 Columns): Cluster Inspector Panel */}
        <div className="lg:col-span-3">
          <QuarcClusterInspectorPanel
            cluster={activeCluster}
            onOpenDetailsModal={() => setShowDetailsModal(true)}
          />
        </div>
      </div>

      {/* 3. BOTTOM SCHEDULER & PROPAGATION SECTION */}
      <div className="space-y-4">
        {/* Full-Width Entanglement Scheduler */}
        <QuarcEntanglementSchedulerBar />

        {/* Bottom Split Row: Photon Propagation & Event Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuarcLivePhotonPropagation activeDestination={activeDestination} />
          <QuarcLiveEventTimeline events={events} />
        </div>
      </div>

      {/* Optional Details Modal */}
      {showDetailsModal && (
        <ClusterInspector cluster={activeCluster} onClose={() => setShowDetailsModal(false)} />
      )}
    </div>
  );
};
