import React from "react";
import { CheckCircle, Info } from "lucide-react";
import { AESPlayground } from "../components/dashboard/AESPlayground";
import { BackendStatusCard } from "../components/dashboard/BackendStatusCard";
import { BellScoreCard } from "../components/dashboard/BellScoreCard";
import { BlochSpherePanel } from "../components/dashboard/BlochSpherePanel";
import { ExecutionTimeline } from "../components/dashboard/ExecutionTimeline";
import { LiveSessionLog } from "../components/dashboard/LiveSessionLog";
import { MetricCards } from "../components/dashboard/MetricCards";
import { PhotonCanvas } from "../components/dashboard/PhotonCanvas";
import { QBERCard } from "../components/dashboard/QBERCard";
import { QuantumControlPanel } from "../components/dashboard/QuantumControlPanel";
import { WebSocketStatusCard } from "../components/dashboard/WebSocketStatusCard";

import { BellScoreChart, ExecutionTimeChart, KeyLengthChart, QBERChart } from "../charts";
import { DashboardProvider, useDashboardContext } from "../contexts/DashboardContext";
import { NetworkGraph } from "../network/NetworkGraph";

const DashboardContent: React.FC = () => {
  const {
    health,
    isHealthLoading,
    healthError,
    refetchHealth,

    activeSession,
    isCreatingSession,
    createSessionError,
    startSession,
    resetSession,

    metrics,
    bellData,
    qberData,
    logs,
    derivedKeyHex,

    isEveActive,
  } = useDashboardContext();

  return (
    <div className="space-y-6">
      {/* REST API Notification Banner */}
      {activeSession && (
        <div className="glass-panel p-4 rounded-2xl border border-[#00ff9d]/30 bg-[#00ff9d]/10 flex items-center justify-between text-xs text-[#00ff9d]">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>
              <strong>Session Created (REST API Response):</strong> ID: {activeSession.session_id} | Status: {activeSession.status}
            </span>
          </div>
          <span className="text-[10px] text-[#8c9ba5] bg-black/40 px-2 py-1 rounded-md">
            WebSocket telemetry streaming live
          </span>
        </div>
      )}

      {createSessionError && (
        <div className="glass-panel p-4 rounded-2xl border border-[#ff3b30]/30 bg-[#ff3b30]/10 flex items-center gap-2 text-xs text-[#ff3b30]">
          <Info size={16} />
          <span>API Error: {createSessionError}</span>
        </div>
      )}

      {/* Top Row: Quantum Control Panel */}
      <QuantumControlPanel
        isLoading={isCreatingSession}
        onStartSession={startSession}
        onResetBench={resetSession}
      />

      {/* Metric Overview Cards */}
      <MetricCards metrics={metrics} />

      {/* Top Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BackendStatusCard
          health={health}
          isLoading={isHealthLoading}
          error={healthError}
          onRetry={refetchHealth}
        />
        <WebSocketStatusCard />
      </div>

      {/* Cytoscape Network Topology Graph */}
      <NetworkGraph />

      {/* Visualizations (Optical Fiber & Bloch Spheres) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PhotonCanvas isEveActive={isEveActive} />
        <BlochSpherePanel />
      </div>

      {/* Verification & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BellScoreCard bellData={bellData} />
        <QBERCard qberData={qberData} />
        <ExecutionTimeline />
      </div>

      {/* Live Recharts Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BellScoreChart />
        <QBERChart />
        <ExecutionTimeChart />
        <KeyLengthChart />
      </div>

      {/* Bottom Row: AES Cryptography Playground & Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AESPlayground derivedKeyHex={derivedKeyHex} />
        <LiveSessionLog logs={logs} />
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default DashboardPage;
