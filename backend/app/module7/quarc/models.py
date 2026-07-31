import time
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional


@dataclass
class LinkState:
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
    status: str = "ACTIVE"  # ACTIVE, DEGRADED, DOWN
    timestamp: float = field(default_factory=time.time)

    @property
    def link_id(self) -> str:
        nodes = sorted([self.node_a, self.node_b])
        return f"{nodes[0]}<->{nodes[1]}"

    @property
    def cluster_score(self) -> float:
        """Composite clustering score formula:
        35% Fidelity + 25% Swap Success + 20% Memory Lifetime (norm) + 10% Availability + 10% Queue Health
        """
        norm_memory = min(1.0, self.memory_lifetime_ms / 50.0)
        queue_health = max(0.0, 1.0 - (self.queue_depth / 100.0))
        
        score = (
            0.35 * (self.fidelity / 100.0 if self.fidelity > 1.0 else self.fidelity) +
            0.25 * (self.swap_probability / 100.0 if self.swap_probability > 1.0 else self.swap_probability) +
            0.20 * norm_memory +
            0.10 * (self.availability / 100.0 if self.availability > 1.0 else self.availability) +
            0.10 * queue_health
        )
        return round(score * 100.0, 2)


@dataclass
class ClusterNode:
    cluster_id: str
    name: str
    nodes: List[str]
    leader_node: str
    average_fidelity: float
    average_qber: float
    average_memory_ms: float
    average_swap_success: float
    health_score: float


@dataclass
class ClusterLink:
    source_cluster: str
    target_cluster: str
    boundary_nodes: List[str]
    inter_cluster_cost: float
    health_score: float


@dataclass
class RoutePath:
    inter_cluster_route: List[str]
    local_node_route: List[str]
    composite_score: float
    total_distance_km: float
    estimated_latency_ms: float
    bottleneck_fidelity: float
    confidence_level: float


@dataclass
class SwapTask:
    task_id: str
    repeater: str
    memory_slot: int
    left_neighbor: str
    right_neighbor: str
    swap_success_probability: float
    priority: int
    status: str = "SCHEDULED"  # SCHEDULED, EXECUTING, COMPLETED, FAILED


@dataclass
class QuarcMetrics:
    overall_health: float
    network_efficiency: float
    route_confidence: float
    average_fidelity: float
    average_memory_ms: float
    congestion_index: float
    active_clusters_count: int
    total_links_monitored: int
