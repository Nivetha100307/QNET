import { apiRequest } from '../core/apiClient';

export interface HybridStatusMetrics {
  recovery_counter: number;
  key_rotation_counter: number;
  last_recovery_reason: string;
  last_recovery_timestamp?: string;
  last_recovery_duration_ms: number;
  avg_recovery_duration_ms: number;
  packets_saved: number;
  packets_flushed: number;
  packets_dropped: number;
  recovery_success_rate: number;
}

export interface HybridStatusResponse {
  session_id: string;
  communication_mode: 'INITIALIZING' | 'QUANTUM' | 'HYBRID' | 'PQC_ONLY' | 'RECOVERING' | 'FAILED';
  current_key_source: string;
  current_signature_source: string;
  current_cipher: string;
  active_algorithms: string;
  topology: {
    source_node: string;
    destination_node: string;
    logical_channels: string[];
  };
  metrics: HybridStatusMetrics;
  packet_buffer: {
    buffer_active: boolean;
    current_queue_size: number;
    max_capacity: number;
    priority_breakdown: {
      EMERGENCY_TRIP: number;
      HIGH_PRIORITY_CONTROL: number;
      TELEMETRY: number;
      HEARTBEAT: number;
    };
    total_packets_saved: number;
    total_packets_flushed: number;
    total_packets_dropped: number;
  };
  policies: Array<{
    name: string;
    condition: string;
    threshold: number;
    action: string;
    description: string;
  }>;
  timeline: Array<{
    index: number;
    timestamp: string;
    stage: string;
    detail: string;
    duration_ms: number;
    communication_mode: string;
  }>;
}

export interface PqcGenerateResponse {
  algorithm_kem: string;
  algorithm_dsa: string;
  shared_secret_bytes: number;
  ciphertext_bytes: number;
  signature_bytes: number;
  signature_verified: boolean;
  derived_aes_key_fingerprint: string;
  latency_ms: number;
}

export async function fetchHybridStatus(): Promise<HybridStatusResponse> {
  return apiRequest<HybridStatusResponse>('/hybrid/status');
}

export async function fetchHybridTimeline(limit: number = 20): Promise<any[]> {
  return apiRequest<any[]>(`/hybrid/timeline?limit=${limit}`);
}

export async function fetchBufferStatus(): Promise<any> {
  return apiRequest<any>('/hybrid/buffer');
}

export async function rotateHybridKeys(forceFallback: boolean = false, reason?: string): Promise<any> {
  return apiRequest<any>('/hybrid/rotate', {
    method: 'POST',
    body: JSON.stringify({ force_fallback: forceFallback, reason })
  });
}

export async function generatePqcExchange(): Promise<PqcGenerateResponse> {
  return apiRequest<PqcGenerateResponse>('/hybrid/pqc/generate', {
    method: 'POST'
  });
}

export async function probeQuantumChannel(isAttackActive: boolean = false): Promise<any> {
  return apiRequest<any>('/hybrid/probe', {
    method: 'POST',
    body: JSON.stringify({ is_simulated_attack_active: isAttackActive })
  });
}
