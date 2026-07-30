import math
from typing import Dict, Any


class FidelityService:
    """Service calculating dynamic real-time quantum physics formulas for Bell state fidelity,

    fiber attenuation, latency, and swap success probability.
    """

    def __init__(self) -> None:
        pass

    def calculate_metrics(
        self,
        distance_km: float = 120.0,
        noise_enabled: bool = False,
        hops: int = 4,
        swaps_completed: int = 0
    ) -> Dict[str, Any]:
        """Calculates multi-hop fidelity vs direct fiber link using dynamic formulas:

        - Attenuation: alpha = 0.25 dB/km (noise) or 0.20 dB/km (ideal)
        - Latency (speed of light in optical fiber v = 200,000 km/s): t = d / 200 (ms)
        - Direct link fidelity: F_direct = 0.98 * e^(-alpha_dec * d)
        - Multi-hop repeater fidelity: F_repeater = 0.98 * e^(-alpha_hop * (d / hops)) * (0.985 ^ swaps_completed)
        """
        # Fiber attenuation & speed of light latency
        alpha_dB = 0.25 if noise_enabled else 0.20
        total_attenuation_dB = round(distance_km * alpha_dB, 2)
        speed_in_fiber_km_s = 200000.0  # c / n = 300,000 / 1.5
        latency_ms = round((distance_km / speed_in_fiber_km_s) * 1000.0, 2)

        # Direct link without repeaters (exponential decay over total distance)
        alpha_dec = 0.012 if noise_enabled else 0.0075
        direct_fidelity = round(max(0.15, 0.98 * math.exp(-alpha_dec * distance_km)), 3)
        direct_qber = round(min(48.0, max(2.5, (1.0 - direct_fidelity) * 85.0)), 1)
        direct_status = "SUCCESS" if direct_qber < 11.0 else "FAILED_DECOHERED"

        # Repeater-assisted link (segmented distance d / hops + swap efficiency)
        hop_dist = distance_km / max(1, hops)
        alpha_hop = 0.0025 if noise_enabled else 0.0012
        single_hop_fid = 0.98 * math.exp(-alpha_hop * hop_dist)
        
        swap_penalty = 0.985 if not noise_enabled else 0.965
        effective_swaps = max(1, swaps_completed) if swaps_completed > 0 else (hops - 1)
        repeater_fidelity = round(min(0.98, max(0.70, single_hop_fid * (swap_penalty ** effective_swaps))), 3)
        repeater_qber = round(max(1.8, (1.0 - repeater_fidelity) * 55.0), 1)

        # Dynamic swap success probability
        base_prob = 0.985 if not noise_enabled else 0.920
        swap_success_prob = round(max(0.65, base_prob * (0.99 ** effective_swaps)), 3)

        return {
            "total_distance_km": distance_km,
            "hop_count": hops,
            "swaps_completed": swaps_completed,
            "fiber_attenuation_dB": total_attenuation_dB,
            "latency_ms": latency_ms,
            "direct_fidelity_without_repeaters": direct_fidelity,
            "direct_qber_pct": direct_qber,
            "direct_link_status": direct_status,
            "repeater_fidelity": repeater_fidelity,
            "repeater_qber_pct": repeater_qber,
            "swap_success_probability": swap_success_prob,
            "noise_enabled": noise_enabled
        }
