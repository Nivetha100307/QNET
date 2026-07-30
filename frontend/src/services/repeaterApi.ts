import { apiRequest } from '../core/apiClient';

export interface RepeaterNodeInfo {
  id: string;
  location: string;
  status: string;
  memory_fidelity: number;
  memory_lifetime_ms: number;
  stored_bell_pairs: number;
  capacity: number;
  latency_ms: number;
}

export interface RouteCandidate {
  name: string;
  hops: string[];
  hop_count: number;
  cost: number;
  active: boolean;
  status: string;
}

export interface RepeaterMeshResponse {
  nodes: string[];
  quantum_repeaters: RepeaterNodeInfo[];
  optimal_route: string[];
  available_routes: RouteCandidate[];
  route_distance_km: number;
  total_distance_km: number;
  fiber_noise_enabled: boolean;
  average_fidelity: number;
  direct_fidelity_without_repeaters: number;
  direct_link_status: string;
  swap_success_probability: number;
}

export interface SwappingRequest {
  session_uuid: string;
  repeater_node: string;
  source_node: string;
  destination_node: string;
}

export interface SwappingResponse {
  swapping_id: string;
  session_uuid: string;
  repeater_node: string;
  bsm_result: string;
  swapped_fidelity: number;
  swap_success_probability: number;
  entanglement_status: string;
  timestamp: string;
}

export interface RepeaterMemoryItem {
  repeater_id: string;
  fidelity: number;
  lifetime_remaining_pct: number;
  stored_pairs: number;
  max_capacity: number;
  coherence_time_ms: number;
  status: string;
}

export interface RepeaterMetricsResponse {
  bell_pairs_generated: number;
  swaps_completed: number;
  bell_measurements: number;
  average_fidelity: number;
  swap_success_rate: number;
  hop_count: number;
  network_latency_ms: number;
  active_repeaters: number;
  memory_usage_pct: number;
  route_cost: number;
  total_distance_km: number;
  direct_fidelity_without_repeaters: number;
  repeater_fidelity: number;
  direct_link_status: string;
}

export async function fetchRepeaterMesh(
  distance_km: number = 120.0,
  noise_enabled: boolean = false
): Promise<RepeaterMeshResponse> {
  return apiRequest<RepeaterMeshResponse>(
    `/repeater/mesh?distance_km=${distance_km}&noise_enabled=${noise_enabled}`
  );
}

export async function executeEntanglementSwapping(
  payload: SwappingRequest
): Promise<SwappingResponse> {
  return apiRequest<SwappingResponse>('/swapping/execute', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchRepeaterMemory(
  noise_enabled: boolean = false
): Promise<RepeaterMemoryItem[]> {
  return apiRequest<RepeaterMemoryItem[]>(
    `/repeater/memory?noise_enabled=${noise_enabled}`
  );
}

export async function fetchRepeaterMetrics(
  distance_km: number = 120.0,
  noise_enabled: boolean = false
): Promise<RepeaterMetricsResponse> {
  return apiRequest<RepeaterMetricsResponse>(
    `/repeater/metrics?distance_km=${distance_km}&noise_enabled=${noise_enabled}`
  );
}
