from typing import List
from app.core.logging_config import logger


def calculate_qber(
    alice_bits: List[int],
    bob_bits: List[int],
    matching_indexes: List[int]
) -> float:
    """Computes exact Quantum Bit Error Rate (QBER) for sifted matching basis bits.

    QBER = Different Bits / Compared Bits

    Args:
        alice_bits (List[int]): Alice's raw measured bits.
        bob_bits (List[int]): Bob's raw measured bits.
        matching_indexes (List[int]): List of 0-based indices where Alice's and Bob's bases match.

    Returns:
        float: QBER as decimal fraction (e.g., 0.021 for 2.1%).
    """
    if not matching_indexes:
        logger.warning("No matching basis indices available for QBER calculation.")
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

    qber_val = round(errors / total, 4)
    logger.info(f"QBER calculated: {qber_val * 100:.2f}% ({errors} errors / {total} bits).")
    return qber_val
