import { apiRequest } from '../core/apiClient';

export interface QuantumMeasurementResponse {
  session_uuid: string;
  status: string;
  protocol_version: string;
  bell_pair_count: number;
  shots: number;
  alice_basis: string[];
  bob_basis: string[];
  alice_bits: number[];
  bob_bits: number[];
  execution_backend: string;
  simulation_time_ms: number;
  circuit_qasm: string | null;
  circuit_diagram: string | null;
}

export interface QuantumCircuitResponse {
  session_uuid: string;
  circuit_qasm: string | null;
  circuit_diagram: string | null;
  backend: string;
}

export async function startQuantumMeasurement(
  session_uuid: string,
  shots: number = 1024
): Promise<QuantumMeasurementResponse> {
  return apiRequest<QuantumMeasurementResponse>('/quantum/start', {
    method: 'POST',
    body: JSON.stringify({ session_uuid, shots }),
  });
}

export async function fetchQuantumMeasurement(
  session_uuid: string
): Promise<QuantumMeasurementResponse> {
  return apiRequest<QuantumMeasurementResponse>(`/quantum/measurement/${session_uuid}`);
}

export async function fetchQuantumCircuit(
  session_uuid: string
): Promise<QuantumCircuitResponse> {
  return apiRequest<QuantumCircuitResponse>(`/quantum/circuit/${session_uuid}`);
}

export interface GhzBroadcastResponse {
  type: string;
  participants: number;
  shots: number;
  counts: Record<string, number>;
  fidelity: number;
  mermin_score: number;
  execution_backend: string;
  simulation_time_ms: number;
  circuit_qasm: string | null;
  circuit_diagram: string | null;
  status: string;
}

export async function startGhzBroadcast(
  participants: number = 4,
  shots: number = 1024,
  session_uuid?: string
): Promise<GhzBroadcastResponse> {
  const query = session_uuid ? `?session_uuid=${encodeURIComponent(session_uuid)}` : '';
  return apiRequest<GhzBroadcastResponse>(`/quantum/ghz/start${query}`, {
    method: 'POST',
    body: JSON.stringify({ participants, shots }),
  });
}

