import { apiRequest } from '../core/apiClient';

export interface QuantumKeyResponse {
  session_uuid: string;
  generation_status: string;
  matching_indexes: number[];
  alice_key: string;
  bob_key: string;
  shared_key: string;
  key_length: number;
  created_at: string;
}

export interface KeyStatusResponse {
  session_uuid: string;
  generation_status: string;
  key_length: number;
}

export async function generateQuantumKey(session_uuid: string): Promise<QuantumKeyResponse> {
  return apiRequest<QuantumKeyResponse>('/key/generate', {
    method: 'POST',
    body: JSON.stringify({ session_uuid }),
  });
}

export async function fetchQuantumKey(session_uuid: string): Promise<QuantumKeyResponse> {
  return apiRequest<QuantumKeyResponse>(`/key/${session_uuid}`);
}

export async function fetchQuantumKeyStatus(session_uuid: string): Promise<KeyStatusResponse> {
  return apiRequest<KeyStatusResponse>(`/key/status/${session_uuid}`);
}
