import { apiRequest } from '../core/apiClient';

export interface QuantumChannel {
  status: string;
  latency_ms: number;
  photon_loss: number;
  noise_level: number;
  bell_score: number | null;
  qber: number | null;
  fidelity: number | null;
}

export interface ClassicalChannel {
  status: string;
  latency_ms: number;
  authentication_ready: boolean;
  encryption_ready: boolean;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  status: string;
  details?: string;
}

export interface SessionResponse {
  id: number;
  session_id: string;
  source_node: string;
  destination_node: string;
  protocol: string;
  session_type: string;
  status: string;
  route: string[];
  quantum_channel: QuantumChannel;
  classical_channel: ClassicalChannel;
  node_status: Record<string, string>;
  message_count: number;
  bytes_transferred: number;
  timeline: TimelineEvent[];
  created_at: string;
  updated_at: string;
  ended_at: string | null;
}

export async function createSession(payload: {
  source_node: string;
  destination_node: string;
  protocol: string;
  session_type: string;
}): Promise<SessionResponse> {
  return apiRequest<SessionResponse>('/session/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function activateSession(session_id: string): Promise<SessionResponse> {
  return apiRequest<SessionResponse>('/session/activate', {
    method: 'POST',
    body: JSON.stringify({ session_id }),
  });
}

export async function endSession(session_id: string): Promise<SessionResponse> {
  return apiRequest<SessionResponse>('/session/end', {
    method: 'POST',
    body: JSON.stringify({ session_id }),
  });
}

export async function endAllSessions(): Promise<SessionResponse[]> {
  return apiRequest<SessionResponse[]>('/session/end_all', {
    method: 'POST',
  });
}

export async function fetchSessions(): Promise<SessionResponse[]> {
  return apiRequest<SessionResponse[]>('/session/list');
}

export async function fetchSessionById(sessionId: string): Promise<SessionResponse> {
  return apiRequest<SessionResponse>(`/session/${sessionId}`);
}
