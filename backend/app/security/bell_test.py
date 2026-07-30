import math
import random
from typing import List, Dict, Any, Tuple
from app.core.logging_config import logger


def generate_e91_coincidences(
    gamma: float,
    total_shots_per_basis: int = 1024
) -> Dict[str, Dict[str, Any]]:
    """Generates Monte Carlo coincidence counts (N++, N+-, N-+, N--) for all 4 E91 basis pairs
    strictly derived from the physical channel visibility gamma.

    Theoretical Bell probabilities for |Phi+> state depolarized by gamma:
        E(a,b) = gamma * cos(2 * (theta_a - theta_b))

    For standard E91 basis angles:
        a1 = 0, a2 = pi/4
        b1 = pi/8, b2 = -pi/8 (or 3pi/8)

        E(a1, b1) = gamma * cos(-pi/4) = gamma * 1/sqrt(2)
        E(a1, b2) = gamma * cos(pi/4)  = gamma * 1/sqrt(2) -> inverted sign in CHSH S = E(a1,b1) - E(a1,b2) + E(a2,b1) + E(a2,b2)
        Specifically, to match S = 2*sqrt(2)*gamma:
            E(a1,b1) = +gamma * sqrt(2)/2
            E(a1,b2) = -gamma * sqrt(2)/2
            E(a2,b1) = +gamma * sqrt(2)/2
            E(a2,b2) = +gamma * sqrt(2)/2

    For basis pair expectation E:
        P(++) = P(--) = (1 + E) / 4
        P(+-) = P(-+) = (1 - E) / 4

    Args:
        gamma (float): Effective channel visibility [0.0, 1.0].
        total_shots_per_basis (int): Number of coincidence shots per basis pair (default 1024).

    Returns:
        Dict[str, Dict[str, Any]]: Coincidence statistics matrix per basis pair.
    """
    gamma_clamped = max(0.0, min(1.0, gamma))
    sqrt2_over_2 = math.sqrt(2.0) / 2.0

    # Target theoretical expectation values for E91 basis configurations
    expected_E = {
        "a1b1": gamma_clamped * sqrt2_over_2,
        "a1b2": -gamma_clamped * sqrt2_over_2,
        "a2b1": gamma_clamped * sqrt2_over_2,
        "a2b2": gamma_clamped * sqrt2_over_2,
    }

    # Also map standard basis names ZZ, ZX, XZ, XX for compatibility
    basis_mapping = {
        "ZZ": "a1b1",
        "ZX": "a1b2",
        "XZ": "a2b1",
        "XX": "a2b2"
    }

    coincidences_result = {}

    for basis_key, exp_E in expected_E.items():
        p_same = (1.0 + exp_E) / 2.0  # Probability of ++ or --
        p_diff = 1.0 - p_same         # Probability of +- or -+

        # Monte Carlo sampling across total_shots_per_basis
        n_same = 0
        n_diff = 0
        for _ in range(total_shots_per_basis):
            if random.random() < p_same:
                n_same += 1
            else:
                n_diff += 1

        # Equal split for symmetric outcomes
        n_plus_plus = n_same // 2 + (n_same % 2 if random.random() < 0.5 else 0)
        n_minus_minus = n_same - n_plus_plus
        n_plus_minus = n_diff // 2 + (n_diff % 2 if random.random() < 0.5 else 0)
        n_minus_plus = n_diff - n_plus_minus

        total = n_plus_plus + n_plus_minus + n_minus_plus + n_minus_minus
        calc_E = (n_plus_plus + n_minus_minus - n_plus_minus - n_minus_plus) / total if total > 0 else 0.0

        stats = {
            "n_plus_plus": n_plus_plus,
            "n_plus_minus": n_plus_minus,
            "n_minus_plus": n_minus_plus,
            "n_minus_minus": n_minus_minus,
            "total_coincidences": total,
            "expectation": round(calc_E, 4)
        }
        coincidences_result[basis_key] = stats

    # Map aliases ZZ, ZX, XZ, XX
    for alias, key in basis_mapping.items():
        coincidences_result[alias] = coincidences_result[key]

    return coincidences_result


def compute_coincidence_counts(
    alice_bits: List[int],
    bob_bits: List[int],
    indices: List[int]
) -> Dict[str, Any]:
    """Calculates physical photon coincidence counts (N++, N+-, N-+, N--) and expectation value E(a,b).

    Mathematical Formula:
        E(a,b) = (N++ + N-- - N+- - N-+) / N_total

    Args:
        alice_bits (List[int]): Bit outcomes for Alice.
        bob_bits (List[int]): Bit outcomes for Bob.
        indices (List[int]): Indices corresponding to co-measured basis pair (a,b).

    Returns:
        Dict[str, Any]: Dictionary containing photon coincidence counts and expectation value.
    """
    n_plus_plus = 0   # (0, 0)
    n_plus_minus = 0  # (0, 1)
    n_minus_plus = 0  # (1, 0)
    n_minus_minus = 0 # (1, 1)

    for idx in indices:
        if 0 <= idx < len(alice_bits) and 0 <= idx < len(bob_bits):
            a = alice_bits[idx]
            b = bob_bits[idx]
            if a == 0 and b == 0:
                n_plus_plus += 1
            elif a == 0 and b == 1:
                n_plus_minus += 1
            elif a == 1 and b == 0:
                n_minus_plus += 1
            elif a == 1 and b == 1:
                n_minus_minus += 1

    total = n_plus_plus + n_plus_minus + n_minus_plus + n_minus_minus
    if total == 0:
        return {
            "n_plus_plus": 0,
            "n_plus_minus": 0,
            "n_minus_plus": 0,
            "n_minus_minus": 0,
            "total_coincidences": 0,
            "expectation": 0.0
        }

    expectation = (n_plus_plus + n_minus_minus - n_plus_minus - n_minus_plus) / total

    return {
        "n_plus_plus": n_plus_plus,
        "n_plus_minus": n_plus_minus,
        "n_minus_plus": n_minus_plus,
        "n_minus_minus": n_minus_minus,
        "total_coincidences": total,
        "expectation": round(expectation, 4)
    }


def compute_bell_correlations(
    alice_basis: List[str],
    bob_basis: List[str],
    alice_bits: List[int],
    bob_bits: List[int]
) -> Dict[str, Any]:
    """Generates complete photon coincidence table and Bell correlation matrix E(a,b).

    Returns:
        Dict[str, Any]: Contains expectation values and detailed coincidence count matrix per basis pair.
    """
    basis_indices: Dict[str, List[int]] = {}
    min_len = min(len(alice_basis), len(bob_basis), len(alice_bits), len(bob_bits))

    for i in range(min_len):
        key = f"{alice_basis[i].upper()}{bob_basis[i].upper()}"
        if key not in basis_indices:
            basis_indices[key] = []
        basis_indices[key].append(i)

    correlations: Dict[str, float] = {}
    coincidence_matrix: Dict[str, Dict[str, Any]] = {}

    for basis_pair, indices in basis_indices.items():
        stats = compute_coincidence_counts(alice_bits, bob_bits, indices)
        correlations[basis_pair] = stats["expectation"]
        coincidence_matrix[basis_pair] = stats

    logger.info(f"Photon coincidence matrix computed across {len(basis_indices)} basis pairs: {correlations}")
    return {
        "correlations": correlations,
        "coincidences": coincidence_matrix
    }
