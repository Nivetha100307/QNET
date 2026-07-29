import { apiRequest } from '../core/apiClient';

export interface RepeaterMeshResponse {
  nodes: string[];
  quantum_repeaters: { id: string; location: string; status: string; memory_fidelity: number }[];
  optimal_route: string[];
  route_distance_km: number;
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
  bsm_result: string;
  swapped_fidelity: number;
  entanglement_status: string;
  timestamp: string;
}

export async function fetchRepeaterMesh(): Promise<RepeaterMeshResponse> {
  return apiRequest<RepeaterMeshResponse>('/repeater/mesh');
}

export async function executeEntanglementSwapping(payload: SwappingRequest): Promise<SwappingResponse> {
  return apiRequest<SwappingResponse>('/swapping/execute', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
