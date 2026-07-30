import time
import random
import asyncio
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession

from app.repeater.routing_service import RoutingService
from app.repeater.memory_service import MemoryService
from app.repeater.fidelity_service import FidelityService
from app.api.websocket import ws_manager
from app.core.logging_config import logger


class RepeaterService:
    """Service layer orchestrating Module 7 Quantum Repeater Mesh & Sequence execution."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.routing_service = RoutingService()
        self.memory_service = MemoryService()
        self.fidelity_service = FidelityService()

    async def get_mesh_topology(
        self,
        distance_km: float = 120.0,
        noise_enabled: bool = False
    ) -> Dict[str, Any]:
        nodes = ["Control_Center", "Repeater_R1", "Repeater_R2", "Repeater_R3", "Substation_A"]
        
        memories = self.memory_service.get_memory_statuses(noise_enabled=noise_enabled)
        repeaters = [
            {
                "id": "R1_Control_SubA",
                "location": "Node_R1 (Sector A)",
                "status": memories[0]["status"],
                "memory_fidelity": memories[0]["fidelity"],
                "memory_lifetime_ms": memories[0]["lifetime_remaining_pct"],
                "stored_bell_pairs": memories[0]["stored_pairs"],
                "capacity": memories[0]["max_capacity"],
                "latency_ms": 1.8
            },
            {
                "id": "R2_SubA_SubB",
                "location": "Node_R2 (Sector B)",
                "status": memories[1]["status"],
                "memory_fidelity": memories[1]["fidelity"],
                "memory_lifetime_ms": memories[1]["lifetime_remaining_pct"],
                "stored_bell_pairs": memories[1]["stored_pairs"],
                "capacity": memories[1]["max_capacity"],
                "latency_ms": 2.4
            },
            {
                "id": "R3_SubB_SubC",
                "location": "Node_R3 (Sector C)",
                "status": memories[2]["status"],
                "memory_fidelity": memories[2]["fidelity"],
                "memory_lifetime_ms": memories[2]["lifetime_remaining_pct"],
                "stored_bell_pairs": memories[2]["stored_pairs"],
                "capacity": memories[2]["max_capacity"],
                "latency_ms": 3.1
            },
        ]
        
        route_data = self.routing_service.calculate_dijkstra_route(
            source="Control_Center",
            destination="Substation_A",
            distance_km=distance_km,
            noise_enabled=noise_enabled
        )

        metrics = self.fidelity_service.calculate_metrics(
            distance_km=distance_km,
            noise_enabled=noise_enabled,
            hops=len(route_data["optimal_route"]) - 1
        )

        return {
            "nodes": nodes,
            "quantum_repeaters": repeaters,
            "optimal_route": route_data["optimal_route"],
            "available_routes": route_data["available_routes"],
            "route_distance_km": distance_km,
            "total_distance_km": distance_km,
            "fiber_noise_enabled": noise_enabled,
            "average_fidelity": metrics["repeater_fidelity"],
            "direct_fidelity_without_repeaters": metrics["direct_fidelity_without_repeaters"],
            "direct_link_status": metrics["direct_link_status"],
            "swap_success_probability": metrics["swap_success_probability"]
        }

    async def get_aggregated_metrics(
        self,
        distance_km: float = 120.0,
        noise_enabled: bool = False
    ) -> Dict[str, Any]:
        route_data = self.routing_service.calculate_dijkstra_route("Control_Center", "Substation_A", distance_km, noise_enabled)
        metrics = self.fidelity_service.calculate_metrics(distance_km, noise_enabled)
        
        return {
            "bell_pairs_generated": 24,
            "swaps_completed": 14,
            "bell_measurements": 42,
            "average_fidelity": metrics["repeater_fidelity"],
            "swap_success_rate": metrics["swap_success_probability"],
            "hop_count": route_data["hop_count"],
            "network_latency_ms": metrics["latency_ms"],
            "active_repeaters": 3,
            "memory_usage_pct": 87.5 if not noise_enabled else 75.0,
            "route_cost": route_data["primary_route_cost"],
            "total_distance_km": distance_km,
            "direct_fidelity_without_repeaters": metrics["direct_fidelity_without_repeaters"],
            "repeater_fidelity": metrics["repeater_fidelity"],
            "direct_link_status": metrics["direct_link_status"]
        }
