/**
 * Dedicated Mock Data Layer for Dashboard Components
 * Components receive data via props/hooks and NEVER own hardcoded dummy values.
 */

export interface MetricCardData {
  title: string;
  value: string;
  subtitle: string;
  type: "bell" | "qber" | "time" | "backend" | "status" | "key";
}

export interface BellScoreData {
  sValue: number;
  isEntangled: boolean;
  eavesdroppingDetected: boolean;
  correlations: {
    e11: number;
    e13: number;
    e31: number;
    e33: number;
  };
}

export interface QBERData {
  errorRate: number;
  maxThreshold: number;
  isSecure: boolean;
}

export interface LogEntry {
  time: string;
  type: "INFO" | "QUANTUM" | "BACKEND" | "CHSH" | "SIFTER" | "QBER" | "AES" | "STATUS";
  msg: string;
}

export const MOCK_DASHBOARD_METRICS: MetricCardData[] = [
  {
    title: "Bell Parameter (S)",
    value: "2.828",
    subtitle: "Violation S > 2.0",
    type: "bell",
  },
  {
    title: "Quantum Error (QBER)",
    value: "1.20%",
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
    value: "Aer Simulator",
    subtitle: "127 Qubit Capacity",
    type: "backend",
  },
  {
    title: "Session Status",
    value: "COMPLETED",
    subtitle: "Quantum Channel Secure",
    type: "status",
  },
  {
    title: "Shared Key Length",
    value: "128 bits",
    subtitle: "AES-256 Seed Derived",
    type: "key",
  },
];

export const MOCK_BELL_SCORE: BellScoreData = {
  sValue: 2.828,
  isEntangled: true,
  eavesdroppingDetected: false,
  correlations: {
    e11: 0.707,
    e13: -0.707,
    e31: 0.707,
    e33: 0.707,
  },
};

export const MOCK_QBER_DATA: QBERData = {
  errorRate: 0.012,
  maxThreshold: 0.11,
  isSecure: true,
};

export const MOCK_DERIVED_KEY_HEX =
  "A4F89E217C3D05B9E812F4C701A9D3E2F5B8C1A4F902D5E812C4A7F0E3B9D1A5";

export const MOCK_LOGS: LogEntry[] = [
  { time: "20:55:01", type: "INFO", msg: "Session initialized: target_bits = 128" },
  { time: "20:55:02", type: "QUANTUM", msg: "BellStateGenerator prepared 512 EPR pairs |Φ+⟩" },
  { time: "20:55:02", type: "QUANTUM", msg: "BasisSelector assigned angles to Alice (0°,45°,90°) & Bob (45°,90°,135°)" },
  { time: "20:55:03", type: "BACKEND", msg: "Executed circuits on AerSimulator (shots=1024)" },
  { time: "20:55:03", type: "CHSH", msg: "CHSH Parameter evaluated: S = 2.828 (Quantum Entanglement Confirmed)" },
  { time: "20:55:04", type: "SIFTER", msg: "KeySiftingEngine extracted 128 matching basis bits (A2/B1, A3/B2)" },
  { time: "20:55:04", type: "QBER", msg: "QBER calculated: 1.20% (Safe, threshold < 11%)" },
  { time: "20:55:05", type: "AES", msg: "Derived 256-bit AES secret key (Shannon entropy H = 1.000)" },
  { time: "20:55:05", type: "STATUS", msg: "Session COMPLETED successfully." },
];
