/**
 * REST API DTO Type Definitions matching FastAPI Backend Schemas
 */

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
}

export interface QKDSessionRequest {
  num_bits: number;
  enable_eve?: boolean;
  channel_noise?: number;
  backend_name?: string;
}

export interface QKDSessionResponse {
  session_id: string;
  status: string;
  raw_key_length: number;
  qber?: number | null;
  bell_parameter?: number | null;
  eavesdropping_detected: boolean;
  created_at: string;
}

export interface SessionListResponse {
  total: number;
  limit: number;
  offset: number;
  sessions: QKDSessionResponse[];
}

export interface ApiErrorResponse {
  error: string;
  detail: string;
}
