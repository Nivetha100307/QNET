from typing import List
from app.core.logging_config import logger


def derive_qber_from_gamma(gamma: float) -> float:
    """Derives Quantum Bit Error Rate (QBER) from channel visibility gamma.

    Simulation Assumption (Simplified Depolarizing Channel):
        QBER = (1 - gamma) / 2

    Args:
        gamma (float): Effective channel visibility [0.0, 1.0].

    Returns:
        float: QBER ratio bounded within [0.0, 0.50].
    """
    gamma_clamped = max(0.0, min(1.0, float(gamma)))
    qber = (1.0 - gamma_clamped) / 2.0
    qber_val = round(qber, 4)
    logger.info(f"QBER derived from channel gamma={gamma_clamped:.4f}: {qber_val * 100:.2f}%.")
    return qber_val


def calculate_qber(
    alice_bits: List[int],
    bob_bits: List[int],
    matching_indexes: List[int]
) -> float:
    """Computes exact Quantum Bit Error Rate (QBER) for sifted matching basis bits."""
    if not matching_indexes:
        return 0.0

    errors = 0
    total = 0
    for idx in matching_indexes:
        if 0 <= idx < len(alice_bits) and 0 <= idx < len(bob_bits):
            total += 1
            if alice_bits[idx] != bob_bits[idx]:
                errors += 1

    if total == 0:
        return 0.0

    return round(errors / total, 4)
