import { apiRequest } from '../core/apiClient';

export interface SCADAPacketRequest {
  session_uuid: string;
  source_node: string;
  destination_node: string;
  command: string;
  parameters: Record<string, any>;
}

export interface SCADAPacketResponse {
  packet_id: string;
  session_uuid: string;
  source_node: string;
  destination_node: string;
  command: string;
  ciphertext_b64: string;
  nonce_b64: string;
  tag_b64: string;
  hmac_signature: string;
  sequence_number: number;
  timestamp: string;
  execution_status: string;
}

export async function sendSCADACommand(payload: SCADAPacketRequest): Promise<SCADAPacketResponse> {
  return apiRequest<SCADAPacketResponse>('/scada/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchSCADAHistory(session_uuid: string): Promise<SCADAPacketResponse[]> {
  return apiRequest<SCADAPacketResponse[]>(`/scada/history/${session_uuid}`);
}
