from typing import List, Dict, Tuple
from app.core.logging_config import logger


def calculate_expectation_value(
    alice_bits: List[int],
    bob_bits: List[int],
    indices: List[int]
) -> float:
    """Calculates quantum expectation correlation value E(a,b) for a subset of indices.

    E(a,b) = (N(0,0) + N(1,1) - N(0,1) - N(1,0)) / N_total

    Args:
        alice_bits (List[int]): Measured bits for Alice.
        bob_bits (List[int]): Measured bits for Bob.
        indices (List[int]): Indices corresponding to basis pair (a,b).

    Returns:
        float: Expectation correlation value in [-1.0, 1.0].
    """
    if not indices:
        return 0.0

    same_count = 0
    diff_count = 0

    for idx in indices:
        if 0 <= idx < len(alice_bits) and 0 <= idx < len(bob_bits):
            if alice_bits[idx] == bob_bits[idx]:
                same_count += 1
            else:
                diff_count += 1

    total = same_count + diff_count
    if total == 0:
        return 0.0

    return (same_count - diff_count) / total


def compute_bell_correlations(
    alice_basis: List[str],
    bob_basis: List[str],
    alice_bits: List[int],
    bob_bits: List[int]
) -> Dict[str, float]:
    """Generates the complete Bell correlation matrix E(a,b) for all co-measured basis pairs.

    Args:
        alice_basis (List[str]): List of basis choices for Alice.
        bob_basis (List[str]): List of basis choices for Bob.
        alice_bits (List[int]): List of bit outcomes for Alice.
        bob_bits (List[int]): List of bit outcomes for Bob.

    Returns:
        Dict[str, float]: Dictionary mapping basis pair keys (e.g., 'ZZ', 'ZX', 'XZ', 'XX') to E(a,b).
    """
    basis_indices: Dict[str, List[int]] = {}

    min_len = min(len(alice_basis), len(bob_basis), len(alice_bits), len(bob_bits))

    for i in range(min_len):
        key = f"{alice_basis[i].upper()}{bob_basis[i].upper()}"
        if key not in basis_indices:
            basis_indices[key] = []
        basis_indices[key].append(i)

    correlations: Dict[str, float] = {}
    for basis_pair, indices in basis_indices.items():
        val = calculate_expectation_value(alice_bits, bob_bits, indices)
        correlations[basis_pair] = round(val, 4)

    logger.info(f"Bell correlation matrix computed across {len(correlations)} basis pairs: {correlations}")
    return correlations
