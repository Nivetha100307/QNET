/**
 * WebSocket Telemetry Type Definitions
 */

export type WebSocketConnectionStatus =
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING"
  | "FAILED";

export type KnownWebSocketEventType =
  | "SESSION_STARTED"
  | "PAIR_GENERATED"
  | "MEASUREMENT_COMPLETED"
  | "CHSH_COMPLETED"
  | "KEY_SIFTED"
  | "KEY_GENERATED"
  | "AES_READY"
  | "SESSION_COMPLETED"
  | "SESSION_FAILED";

export type WebSocketEventType = KnownWebSocketEventType | string;

export interface SessionStartedPayload {
  num_bits: number;
}

export interface PairGeneratedPayload {
  pair_count: number;
  state: string;
}

export interface MeasurementCompletedPayload {
  shots: number;
  alice_angles?: number[];
  bob_angles?: number[];
}

export interface CHSHCompletedPayload {
  s_value: number;
  is_entangled: boolean;
  eavesdropping_detected: boolean;
  correlations?: {
    e11: number;
    e13: number;
    e31: number;
    e33: number;
  };
}

export interface KeySiftedPayload {
  sifted_bits: number;
  raw_bits?: number;
}

export interface SessionCompletedPayload {
  status: string;
  raw_key_length: number;
  qber?: number;
  chsh_value?: number;
  eavesdropping_detected: boolean;
}

export interface SessionFailedPayload {
  status: string;
  reason: string;
  chsh_value?: number;
  qber?: number;
  eavesdropping_detected: boolean;
}

export interface WebSocketEvent {
  session_id: string;
  event_type: WebSocketEventType;
  payload?: Record<string, unknown>;
  timestamp?: string;
}
