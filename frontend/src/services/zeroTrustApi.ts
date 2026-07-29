import { apiRequest } from '../core/apiClient';

export interface ZeroTrustVerificationRequest {
  session_uuid: string;
  packet_id: string;
  source_node: string;
  command: string;
  hmac_signature: string;
  nonce: string;
  sequence_number: number;
}

export interface ZeroTrustVerificationResponse {
  decision: 'ALLOW' | 'BLOCK';
  trust_score: number;
  risk_level: string;
  checks_passed: number;
  total_checks: number;
  failed_checks: string[];
  rationale: Record<string, any>;
  timestamp: string;
}

export interface AttackSimulationRequest {
  session_uuid: string;
  attack_type: 'EAVESDROPPING' | 'MAN_IN_THE_MIDDLE' | 'REPLAY_ATTACK' | 'PACKET_TAMPERING' | 'DENIAL_OF_SERVICE';
  intensity: number;
}

export interface AttackSimulationResponse {
  attack_id: string;
  session_uuid: string;
  attack_type: string;
  detected: boolean;
  mitigation_action: string;
  trust_score_impact: number;
  details: string;
  timestamp: string;
}

export async function verifyZeroTrust(payload: ZeroTrustVerificationRequest): Promise<ZeroTrustVerificationResponse> {
  return apiRequest<ZeroTrustVerificationResponse>('/zero-trust/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function simulateAttack(payload: AttackSimulationRequest): Promise<AttackSimulationResponse> {
  return apiRequest<AttackSimulationResponse>('/attacks/simulate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
