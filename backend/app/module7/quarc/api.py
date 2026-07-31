import time
from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any

from app.module7.quarc.models import LinkState, ClusterNode, RoutePath, SwapTask
from app.module7.quarc.schemas import (
    QuarcStatusResponse,
    ClusterSchema,
    SwapTaskSchema,
    MetricsSchema,
    QuarcReclusterResponse
)
from app.module7.quarc.network_monitor import network_monitor
from app.module7.quarc.link_state_database import qlsdb
from app.module7.quarc.cluster_engine import cluster_engine
from app.module7.quarc.routing_engine import quarc_routing_engine
from app.module7.quarc.entanglement_scheduler import entanglement_scheduler
from app.module7.quarc.quantum_metrics import quantum_metrics_engine


router = APIRouter(prefix="/module7/quarc", tags=["Module 7 - QuARC Engine"])


@router.get("/status", response_model=QuarcStatusResponse)
async def get_quarc_status(
    source_node: str = Query("Control_Center", description="Source node"),
    destination_node: str = Query("Substation_A", description="Destination substation node")
) -> QuarcStatusResponse:
    """Returns complete QuARC Quantum Adaptive Routing & Entanglement Coordination Engine status."""
    # Poll live telemetry updates
    network_monitor.poll_quantum_conditions()

    clusters: List[ClusterNode] = cluster_engine.form_clusters()
    route_path: RoutePath = quarc_routing_engine.compute_route(source_node, destination_node)
    swap_tasks: List[SwapTask] = entanglement_scheduler.generate_schedule(route_path)
    metrics = quantum_metrics_engine.compute_metrics()

    cluster_schemas = [
        ClusterSchema(
            id=c.cluster_id,
            name=c.name,
            nodes=c.nodes,
            leader=c.leader_node,
            health=c.health_score,
            avg_fidelity=c.average_fidelity,
            avg_qber=c.average_qber,
            avg_memory_ms=c.average_memory_ms,
            avg_swap_success=c.average_swap_success
        )
        for c in clusters
    ]

    swap_schemas = [
        SwapTaskSchema(
            task_id=s.task_id,
            repeater=s.repeater,
            memory_slot=s.memory_slot,
            left_neighbor=s.left_neighbor,
            right_neighbor=s.right_neighbor,
            success_probability=s.swap_success_probability,
            priority=s.priority,
            status=s.status
        )
        for s in swap_tasks
    ]

    metrics_schema = MetricsSchema(
        overall_health=metrics.overall_health,
        network_efficiency=metrics.network_efficiency,
        route_confidence=metrics.route_confidence,
        average_fidelity=metrics.average_fidelity,
        average_memory_ms=metrics.average_memory_ms,
        congestion_index=metrics.congestion_index,
        active_clusters_count=metrics.active_clusters_count,
        total_links_monitored=metrics.total_links_monitored
    )

    return QuarcStatusResponse(
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
        network_health=metrics.overall_health,
        clusters=cluster_schemas,
        cluster_route=route_path.inter_cluster_route,
        local_route=route_path.local_node_route,
        swap_schedule=swap_schemas,
        overall_score=route_path.composite_score,
        metrics=metrics_schema
    )


@router.get("/clusters", response_model=List[ClusterSchema])
async def get_quarc_clusters() -> List[ClusterSchema]:
    """Returns active quantum similarity clusters."""
    clusters = cluster_engine.form_clusters()
    return [
        ClusterSchema(
            id=c.cluster_id,
            name=c.name,
            nodes=c.nodes,
            leader=c.leader_node,
            health=c.health_score,
            avg_fidelity=c.average_fidelity,
            avg_qber=c.average_qber,
            avg_memory_ms=c.average_memory_ms,
            avg_swap_success=c.average_swap_success
        )
        for c in clusters
    ]


@router.get("/routes")
async def get_quarc_routes(
    source_node: str = Query("Control_Center"),
    destination_node: str = Query("Substation_A")
) -> Dict[str, Any]:
    """Returns inter-cluster and local intra-cluster routing analysis."""
    route_path = quarc_routing_engine.compute_route(source_node, destination_node)
    return {
        "source": source_node,
        "destination": destination_node,
        "inter_cluster_route": route_path.inter_cluster_route,
        "local_node_route": route_path.local_node_route,
        "composite_score": route_path.composite_score,
        "total_distance_km": route_path.total_distance_km,
        "estimated_latency_ms": route_path.estimated_latency_ms,
        "bottleneck_fidelity": route_path.bottleneck_fidelity,
        "confidence_level": route_path.confidence_level
    }


@router.get("/schedule", response_model=List[SwapTaskSchema])
async def get_quarc_schedule() -> List[SwapTaskSchema]:
    """Returns current executable entanglement swap schedule."""
    swap_tasks = entanglement_scheduler.generate_schedule()
    return [
        SwapTaskSchema(
            task_id=s.task_id,
            repeater=s.repeater,
            memory_slot=s.memory_slot,
            left_neighbor=s.left_neighbor,
            right_neighbor=s.right_neighbor,
            success_probability=s.swap_success_probability,
            priority=s.priority,
            status=s.status
        )
        for s in swap_tasks
    ]


@router.post("/recluster", response_model=QuarcReclusterResponse)
async def trigger_recluster() -> QuarcReclusterResponse:
    """Triggers dynamic quantum cluster re-formation based on live QLSDB link state metrics."""
    t0 = time.perf_counter()
    network_monitor.poll_quantum_conditions()
    clusters = cluster_engine.form_clusters()
    d_ms = (time.perf_counter() - t0) * 1000.0

    cluster_schemas = [
        ClusterSchema(
            id=c.cluster_id,
            name=c.name,
            nodes=c.nodes,
            leader=c.leader_node,
            health=c.health_score,
            avg_fidelity=c.average_fidelity,
            avg_qber=c.average_qber,
            avg_memory_ms=c.average_memory_ms,
            avg_swap_success=c.average_swap_success
        )
        for c in clusters
    ]

    return QuarcReclusterResponse(
        status="SUCCESS",
        message=f"Dynamic QuARC reclustering completed across {len(clusters)} quantum clusters.",
        clusters_count=len(clusters),
        recluster_duration_ms=round(d_ms, 2),
        new_clusters=cluster_schemas
    )
