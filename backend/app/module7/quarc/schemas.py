from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class LinkStateSchema(BaseModel):
    link_id: str
    node_a: str
    node_b: str
    distance_km: float
    attenuation_db: float
    fidelity: float
    qber: float
    chsh: float
    memory_lifetime_ms: float
    swap_probability: float
    queue_depth: int
    latency_ms: float
    bandwidth_kbps: float
    availability: float
    status: str
    cluster_score: float
    timestamp: float


class ClusterSchema(BaseModel):
    id: str
    name: str
    nodes: List[str]
    leader: str
    health: float
    avg_fidelity: float
    avg_qber: float
    avg_memory_ms: float
    avg_swap_success: float


class SwapTaskSchema(BaseModel):
    task_id: str
    repeater: str
    memory_slot: int
    left_neighbor: str
    right_neighbor: str
    success_probability: float
    priority: int
    status: str


class MetricsSchema(BaseModel):
    overall_health: float
    network_efficiency: float
    route_confidence: float
    average_fidelity: float
    average_memory_ms: float
    congestion_index: float
    active_clusters_count: int
    total_links_monitored: int


class QuarcStatusResponse(BaseModel):
    engine: str = "QuARC v2.0 (Quantum Adaptive Routing & Entanglement Coordination)"
    timestamp: str
    network_health: float
    clusters: List[ClusterSchema]
    cluster_route: List[str]
    local_route: List[str]
    swap_schedule: List[SwapTaskSchema]
    overall_score: float
    metrics: MetricsSchema


class QuarcReclusterResponse(BaseModel):
    status: str
    message: str
    clusters_count: int
    recluster_duration_ms: float
    new_clusters: List[ClusterSchema]
