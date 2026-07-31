import math
from typing import List, Dict, Any


def calculate_composite_route_score(
    fidelity: float,
    swap_success: float,
    memory_ms: float,
    connectivity: float,
    latency_ms: float,
    queue_depth: int
) -> float:
    """Quantum Route Score Formula:
    30% Fidelity + 20% Swap Success + 15% Memory Lifetime + 15% Connectivity + 10% Latency + 10% Queue Health
    """
    f_norm = fidelity / 100.0 if fidelity > 1.0 else fidelity
    s_norm = swap_success / 100.0 if swap_success > 1.0 else swap_success
    m_norm = min(1.0, memory_ms / 50.0)
    c_norm = min(1.0, connectivity / 10.0)
    l_norm = max(0.0, 1.0 - (latency_ms / 50.0))
    q_norm = max(0.0, 1.0 - (queue_depth / 100.0))

    score = (
        0.30 * f_norm +
        0.20 * s_norm +
        0.15 * m_norm +
        0.15 * c_norm +
        0.10 * l_norm +
        0.10 * q_norm
    )
    return round(score * 100.0, 2)


def normalize_metric(val: float, max_val: float) -> float:
    if max_val == 0:
        return 0.0
    return min(1.0, max(0.0, val / max_val))
