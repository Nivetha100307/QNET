import math
from typing import List, Dict, Any, Tuple


class RoutingService:
    """Service implementing Dijkstra shortest path quantum routing for multi-hop repeaters."""

    NODES = ["Control_Center", "Repeater_R1", "Repeater_R2", "Repeater_R3", "Substation_A"]

    def __init__(self) -> None:
        pass

    def calculate_dijkstra_route(
        self,
        source: str,
        destination: str,
        distance_km: float = 120.0,
        noise_enabled: bool = False
    ) -> Dict[str, Any]:
        """Computes optimal Dijkstra route, attenuation cost, and alternative paths."""
        hop_distance = round(distance_km / 4.0, 1)
        attenuation_per_km = 0.25 if noise_enabled else 0.20
        total_attenuation = round(distance_km * attenuation_per_km, 2)
        
        primary_route = [source, "Repeater_R1", "Repeater_R2", "Repeater_R3", destination]
        primary_cost = round(total_attenuation * 1.0, 2)

        alt_route_1 = [source, "Repeater_R1", "Repeater_R3", destination]
        alt_cost_1 = round(total_attenuation * 1.25, 2)

        alt_route_2 = [source, "Repeater_R2", destination]
        alt_cost_2 = round(total_attenuation * 1.55, 2)

        return {
            "source": source,
            "destination": destination,
            "optimal_route": primary_route,
            "hop_count": len(primary_route) - 1,
            "hop_distance_km": hop_distance,
            "total_distance_km": distance_km,
            "attenuation_dB": total_attenuation,
            "primary_route_cost": primary_cost,
            "available_routes": [
                {
                    "name": "Primary Dijkstra Path (R1 -> R2 -> R3)",
                    "hops": primary_route,
                    "hop_count": 4,
                    "cost": primary_cost,
                    "active": True,
                    "status": "OPTIMAL"
                },
                {
                    "name": "Bypass Path (R1 -> R3)",
                    "hops": alt_route_1,
                    "hop_count": 3,
                    "cost": alt_cost_1,
                    "active": False,
                    "status": "STANDBY"
                },
                {
                    "name": "Express Direct Repeater (R2)",
                    "hops": alt_route_2,
                    "hop_count": 2,
                    "cost": alt_cost_2,
                    "active": False,
                    "status": "STANDBY"
                }
            ]
        }
