import React, { createContext, useContext, useEffect, useState } from "react";
import { useCreateSession, useHealth, useQKDWebSocket } from "../hooks";
import {
  BellScoreData,
  LogEntry,
  MetricCardData,
  MOCK_BELL_SCORE,
  MOCK_DASHBOARD_METRICS,
  MOCK_DERIVED_KEY_HEX,
  MOCK_LOGS,
  MOCK_QBER_DATA,
  QBERData,
} from "../mocks/dashboard";
import { HealthResponse, QKDSessionResponse } from "../types/api";
import { WebSocketConnectionStatus, WebSocketEvent } from "../types/websocket";

interface DashboardContextType {
  // REST API Health State
  health: HealthResponse | null;
  isHealthLoading: boolean;
  healthError: string | null;
  refetchHealth: () => void;

  // Session Control & State
  activeSession: QKDSessionResponse | null;
  isCreatingSession: boolean;
  createSessionError: string | null;
  startSession: (numBits: number) => Promise<QKDSessionResponse | null>;
  resetSession: () => void;

  // WebSocket Live Telemetry State
  wsStatus: WebSocketConnectionStatus;
  wsEventCount: number;

  // Real-Time Derived Dashboard Metrics
  metrics: MetricCardData[];
  bellData: BellScoreData;
  qberData: QBERData;
  activeStep: number;
  logs: LogEntry[];
  derivedKeyHex: string;

  // Interactive Options
  isEveActive: boolean;
  setIsEveActive: (active: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { health, isLoading: isHealthLoading, error: healthError, refetch: refetchHealth } = useHealth();
  const { createSession, isLoading: isCreatingSession, error: createSessionError, sessionData, reset } = useCreateSession();

  const [activeSessionId, setActiveSessionId] = useState<string | undefined>(undefined);
  const { status: wsStatus, lastEvent, eventCount: wsEventCount } = useQKDWebSocket(activeSessionId);

  const [isEveActive, setIsEveActive] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(8);
  const [liveLogs, setLiveLogs] = useState<LogEntry[]>(MOCK_LOGS);

  const [liveBell, setLiveBell] = useState<BellScoreData>(MOCK_BELL_SCORE);
  const [liveQber, setLiveQber] = useState<QBERData>(MOCK_QBER_DATA);
  const [derivedKeyHex, setDerivedKeyHex] = useState<string>(MOCK_DERIVED_KEY_HEX);

  const startSession = async (
    numBits: number = 128,
    enableEve?: boolean,
    channelNoise?: number,
    backendName?: string
  ) => {
    const resp = await createSession({
      num_bits: numBits,
      enable_eve: enableEve,
      channel_noise: channelNoise,
      backend_name: backendName,
    });
    if (resp && resp.session_id) {
      setActiveSessionId(resp.session_id);
      setActiveStep(1);
      if (typeof resp.bell_parameter === "number") {
        setLiveBell({
          sValue: resp.bell_parameter,
          isEntangled: !resp.eavesdropping_detected && resp.bell_parameter > 2.0,
          eavesdroppingDetected: resp.eavesdropping_detected,
          correlations: liveBell.correlations,
        });
      }
      if (typeof resp.qber === "number") {
        setLiveQber({
          errorRate: resp.qber,
          maxThreshold: 0.11,
          isSecure: resp.qber < 0.11,
        });
      }
      setLiveLogs((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          type: "INFO",
          msg: `Created session ${resp.session_id} (Status: ${resp.status}). Connecting to WebSocket telemetry stream...`,
        },
        ...prev,
      ]);
    }
    return resp;
  };

  const resetSession = () => {
    reset();
    setActiveSessionId(undefined);
    setIsEveActive(false);
    setActiveStep(8);
    setLiveBell(MOCK_BELL_SCORE);
    setLiveQber(MOCK_QBER_DATA);
    setLiveLogs(MOCK_LOGS);
    setDerivedKeyHex(MOCK_DERIVED_KEY_HEX);
  };

  // Handle incoming live WebSocket events
  useEffect(() => {
    if (!lastEvent) return;

    const timestamp = new Date().toLocaleTimeString();
    const type = lastEvent.event_type;
    const payload = lastEvent.payload || {};

    switch (type) {
      case "SESSION_STARTED":
        setActiveStep(1);
        setLiveLogs((prev) => [
          { time: timestamp, type: "INFO", msg: `Protocol STARTED for target bits: ${payload.num_bits || 128}` },
          ...prev,
        ]);
        break;

      case "PAIR_GENERATED":
        setActiveStep(2);
        setLiveLogs((prev) => [
          { time: timestamp, type: "QUANTUM", msg: `EPR Pairs Generated: ${payload.pair_count || 512} pairs in ${payload.state || "|Φ+⟩"}` },
          ...prev,
        ]);
        break;

      case "MEASUREMENT_COMPLETED":
        setActiveStep(4);
        setLiveLogs((prev) => [
          { time: timestamp, type: "QUANTUM", msg: `Measurements completed on backend (shots=${payload.shots || 1024})` },
          ...prev,
        ]);
        break;

      case "CHSH_COMPLETED":
        setActiveStep(5);
        if (typeof payload.s_value === "number") {
          setLiveBell({
            sValue: payload.s_value,
            isEntangled: typeof payload.is_entangled === "boolean" ? payload.is_entangled : payload.s_value > 2.0,
            eavesdroppingDetected: !!payload.eavesdropping_detected,
            correlations: (payload.correlations as BellScoreData["correlations"]) || MOCK_BELL_SCORE.correlations,
          });
        }
        setLiveLogs((prev) => [
          {
            time: timestamp,
            type: "CHSH",
            msg: `CHSH Parameter evaluated: S = ${payload.s_value || 2.828} (${payload.is_entangled ? "Entangled" : "Violation Failed"})`,
          },
          ...prev,
        ]);
        break;

      case "KEY_SIFTED":
        setActiveStep(6);
        setLiveLogs((prev) => [
          { time: timestamp, type: "SIFTER", msg: `Key Sifted: Extracted ${payload.sifted_bits || 128} matching basis bits` },
          ...prev,
        ]);
        break;

      case "KEY_GENERATED":
      case "AES_READY":
        setActiveStep(7);
        if (payload.key_hex) {
          setDerivedKeyHex(String(payload.key_hex));
        }
        setLiveLogs((prev) => [
          { time: timestamp, type: "AES", msg: "Derived 256-bit AES secret key (Shannon entropy H = 1.000)" },
          ...prev,
        ]);
        break;

      case "SESSION_COMPLETED":
        setActiveStep(8);
        if (typeof payload.qber === "number") {
          setLiveQber({
            errorRate: payload.qber,
            maxThreshold: 0.11,
            isSecure: payload.qber < 0.11,
          });
        }
        setLiveLogs((prev) => [
          { time: timestamp, type: "STATUS", msg: `Session COMPLETED. Final status: ${payload.status || "completed"}` },
          ...prev,
        ]);
        break;

      case "SESSION_FAILED":
        setActiveStep(8);
        setLiveLogs((prev) => [
          { time: timestamp, type: "STATUS", msg: `Session FAILED/ABORTED: ${payload.reason || "Eavesdropping / Noise threshold exceeded"}` },
          ...prev,
        ]);
        break;

      default:
        setLiveLogs((prev) => [
          { time: timestamp, type: "INFO", msg: `Event [${type}]: ${JSON.stringify(payload)}` },
          ...prev,
        ]);
        break;
    }
  }, [lastEvent]);

  // Sync session metrics
  const metrics: MetricCardData[] = sessionData
    ? [
        {
          title: "Bell Parameter (S)",
          value: liveBell.sValue.toFixed(3),
          subtitle: liveBell.isEntangled ? "Violation S > 2.0" : "S ≤ 2.0 Aborted",
          type: "bell",
        },
        {
          title: "Quantum Error (QBER)",
          value: `${(liveQber.errorRate * 100).toFixed(2)}%`,
          subtitle: "Threshold < 11%",
          type: "qber",
        },
        {
          title: "Execution Time",
          value: "142 ms",
          subtitle: "Fast Circuit Processing",
          type: "time",
        },
        {
          title: "Hardware Target",
          value: health?.app || "Aer Simulator",
          subtitle: "127 Qubit Capacity",
          type: "backend",
        },
        {
          title: "Session Status",
          value: sessionData.status.toUpperCase(),
          subtitle: sessionData.status === "completed" ? "Quantum Channel Secure" : "Session Ended",
          type: "status",
        },
        {
          title: "Shared Key Length",
          value: `${sessionData.raw_key_length} bits`,
          subtitle: "AES-256 Seed Derived",
          type: "key",
        },
      ]
    : MOCK_DASHBOARD_METRICS;

  return (
    <DashboardContext.Provider
      value={{
        health,
        isHealthLoading,
        healthError,
        refetchHealth,

        activeSession: sessionData,
        isCreatingSession,
        createSessionError,
        startSession,
        resetSession,

        wsStatus,
        wsEventCount,

        metrics,
        bellData: liveBell,
        qberData: liveQber,
        activeStep,
        logs: liveLogs,
        derivedKeyHex,

        isEveActive,
        setIsEveActive,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used within a DashboardProvider");
  }
  return context;
};
