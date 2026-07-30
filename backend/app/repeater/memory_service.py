import math
import random
from typing import List, Dict, Any


class MemoryService:
    """Service tracking dynamic quantum memory lifetime, stored Bell pair slots,

    and latency calculated via physical distance and noise parameters.
    """

    REPEATER_NODES = ["Repeater_R1", "Repeater_R2", "Repeater_R3"]

    def __init__(self) -> None:
        pass

    def get_memory_statuses(
        self,
        distance_km: float = 120.0,
        noise_enabled: bool = False,
        swaps_completed: int = 0
    ) -> List[Dict[str, Any]]:
        """Calculates dynamic memory lifetime, coherence time, stored slots, and node latency."""
        hop_dist = distance_km / 4.0
        # Speed of light in optical fiber latency: 0.005 ms per km
        hop_latency_ms = round(hop_dist * 0.005, 2)
        
        results = []
        for idx, r_id in enumerate(self.REPEATER_NODES):
            # Dynamic node latency based on hop distance
            node_latency = round(hop_latency_ms * (idx + 1), 2)
            
            # Fidelity decreases slightly per hop + noise penalty
            base_fid = 0.98 - (idx * 0.015) - (0.03 if noise_enabled else 0.0)
            fidelity = round(max(0.72, base_fid - (random.uniform(0.002, 0.008) if noise_enabled else 0.001)), 3)
            
            # Lifetime remaining % (decay factor)
            decay_penalty = (idx + 1) * (6.0 if noise_enabled else 3.0)
            lifetime_pct = round(max(50.0, min(100.0, 99.0 - decay_penalty)), 1)
            
            # Stored Bell pairs inventory (starts at 8, decrements upon swap, recharges)
            stored_pairs = max(2, min(8, 8 - (swaps_completed if idx <= swaps_completed else 0)))
            
            # Coherence time ms
            coherence_ms = round(max(50.0, 200.0 - (distance_km * 0.5) - (30.0 if noise_enabled else 0.0)), 1)

            results.append({
                "repeater_id": r_id,
                "fidelity": fidelity,
                "lifetime_remaining_pct": lifetime_pct,
                "stored_pairs": stored_pairs,
                "max_capacity": 8,
                "coherence_time_ms": coherence_ms,
                "latency_ms": node_latency,
                "status": "HEALTHY" if fidelity >= 0.85 else "DEGRADED"
            })
        return results

    def refresh_memory(self, repeater_id: str) -> Dict[str, Any]:
        """Refreshes memory slots upon successful entanglement swapping."""
        return {
            "repeater_id": repeater_id,
            "fidelity": 0.98,
            "lifetime_remaining_pct": 100.0,
            "stored_pairs": 8,
            "max_capacity": 8,
            "status": "RECHARGED"
        }
