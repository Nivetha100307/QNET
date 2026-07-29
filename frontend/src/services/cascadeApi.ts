import { apiRequest } from '../core/apiClient';

export interface CascadeReconciliationRequest {
  session_uuid: string;
  sifted_key_alice: string;
  sifted_key_bob: string;
  block_size?: number;
}

export interface CascadeReconciliationResponse {
  session_uuid: string;
  corrected_key: string;
  bit_errors_corrected: number;
  remaining_qber: number;
  privacy_amplification_status: string;
  final_secret_key_b64: string;
  isolation_forest_anomaly_score: number;
  anomaly_detected: boolean;
  timestamp: string;
}

export async function runCascadeReconciliation(payload: CascadeReconciliationRequest): Promise<CascadeReconciliationResponse> {
  return apiRequest<CascadeReconciliationResponse>('/cascade/reconcile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
