from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class RepeaterNodeSchema(BaseModel):
    id: str
    location: str
    status: str
    memory_fidelity: float
    memory_lifetime_ms: float
    stored_bell_pairs: int
    capacity: int = 8
    latency_ms: float = 2.4


class RouteSchema(BaseModel):
    source: str
    destination: str
    hops: List[str]
    total_distance_km: float
    attenuation_dB: float
    route_cost: float
    active: bool = True


class TopologyResponse(BaseModel):
    nodes: List[str]
    quantum_repeaters: List[RepeaterNodeSchema]
    optimal_route: List[str]
    available_routes: List[Dict[str, Any]]
    route_distance_km: float
    total_distance_km: float
    fiber_noise_enabled: bool = False
    average_fidelity: float = 0.94


class SwappingRequest(BaseModel):
    session_uuid: str
    repeater_node: str
    source_node: str
    destination_node: str


class SwappingResponse(BaseModel):
    swapping_id: str
    session_uuid: str
    repeater_node: str
    bsm_result: str
    swapped_fidelity: float
    swap_success_probability: float
    entanglement_status: str
    timestamp: str


class SequenceRequest(BaseModel):
    session_uuid: str
    distance_km: float = 120.0
    noise_enabled: bool = False
    speed_multiplier: float = 1.0


class ConfigRequest(BaseModel):
    distance_km: float = 120.0
    noise_enabled: bool = False


class MemoryStatusSchema(BaseModel):
    repeater_id: str
    fidelity: float
    lifetime_remaining_pct: float
    stored_pairs: int
    max_capacity: int
    status: str


class MetricsResponse(BaseModel):
    bell_pairs_generated: int
    swaps_completed: int
    bell_measurements: int
    average_fidelity: float
    swap_success_rate: float
    hop_count: int
    network_latency_ms: float
    active_repeaters: int
    memory_usage_pct: float
    route_cost: float
    total_distance_km: float
    direct_fidelity_without_repeaters: float
    repeater_fidelity: float
    direct_link_status: str
