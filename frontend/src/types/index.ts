/**
 * Domain & DTO TypeScript Types for EntangleNet QKD Studio
 */

export type SessionStatus =
  | "IDLE"
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "ABORTED_EAVESDROPPING"
  | "FAILED";

export interface BellResult {
  chsh_parameter: number;
  is_entangled: boolean;
  eavesdropping_detected: boolean;
  correlations: {
    e11: number;
    e13: number;
    e31: number;
    e33: number;
  };
}

export interface QBER {
  error_rate: number;
  error_percentage: number;
  is_secure: boolean;
  total_sifted_bits: number;
  error_bits_count: number;
}

export interface Session {
  session_id: str;
  status: SessionStatus;
  raw_key_length: number;
  sifted_key_length?: number;
  sifted_key?: number[];
  qber?: number;
  bell_parameter?: number;
  eavesdropping_detected: boolean;
  created_at: string;
}

export type str = string;

export interface WebSocketEvent {
  event_type:
    | "SESSION_STARTED"
    | "PAIR_GENERATED"
    | "MEASUREMENT_COMPLETED"
    | "CHSH_COMPLETED"
    | "KEY_SIFTED"
    | "SESSION_COMPLETED"
    | "SESSION_FAILED";
  session_id: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export interface BackendInfo {
  name: string;
  is_simulator: boolean;
  channel?: string;
  status: "ONLINE" | "OFFLINE" | "DEGRADED";
}
