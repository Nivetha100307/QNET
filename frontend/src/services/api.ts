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

const API_BASE = 'http://localhost:8000/api/v1';

export async function createSession(payload: {
  source_node: string;
  destination_node: string;
  protocol: string;
  session_type: string;
}): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to initialize session');
  }
  return res.json();
}

export async function activateSession(session_id: string): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/session/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to activate session');
  }
  return res.json();
}

export async function endSession(session_id: string): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/session/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to end session');
  }
  return res.json();
}

export async function fetchSessions(): Promise<SessionResponse[]> {
  const res = await fetch(`${API_BASE}/session/list`);
  if (!res.ok) {
    throw new Error('Failed to fetch session list');
  }
  return res.json();
}

export async function fetchSessionById(sessionId: string): Promise<SessionResponse> {
  const res = await fetch(`${API_BASE}/session/${sessionId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch session details');
  }
  return res.json();
}

export function subscribeToWebsocket(onMessage: (data: any) => void): () => void {
  const wsUrl = `ws://localhost:8000/api/v1/ws/sessions`;
  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      onMessage(parsed);
    } catch (e) {
      console.error('WS parse error', e);
    }
  };

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}
