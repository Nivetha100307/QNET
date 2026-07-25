"""CHSH Bell Inequality Verification Engine for the E91 protocol.

This module provides the `CHSHVerifier` class and related data models (`CorrelationResult`,
`CHSHResult`) to compute quantum correlations and verify the Clauser-Horne-Shimony-Holt (CHSH)
Bell inequality violation for eavesdropping detection.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Sequence, Tuple

from app.quantum.e91.measurement import MeasurementResult


@dataclass(frozen=True)
class CorrelationResult:
    """Statistical correlation outcome for a specific (Alice, Bob) measurement setting pair."""

    alice_basis: str
    bob_basis: str
    num_samples: int
    correlation_value: float


@dataclass(frozen=True)
class CHSHResult:
    """Comprehensive CHSH Bell inequality verification result."""

    correlations: Dict[Tuple[str, str], CorrelationResult]
    chsh_value: float
    is_violated: bool
    is_quantum_entangled: bool
    eavesdropping_detected: bool
    total_samples_analyzed: int
    classical_threshold: float = 2.0
    quantum_threshold: float = 2.0


class CHSHVerifier:
    """Verification engine for computing CHSH correlations and validating Bell inequality violation."""

    REQUIRED_PAIRS: Tuple[Tuple[str, str], ...] = (
        ("A1", "B1"),
        ("A1", "B3"),
        ("A3", "B1"),
        ("A3", "B3"),
    )

    def __init__(
        self,
        classical_bound: float = 2.0,
        quantum_threshold: float = 2.1,
    ) -> None:
        """Initialize the CHSHVerifier.

        Args:
            classical_bound: Upper bound for local hidden-variable (classical) models (default: 2.0).
            quantum_threshold: Minimum CHSH value to confirm genuine quantum entanglement (default: 2.1).
        """
        self.classical_bound = classical_bound
        self.quantum_threshold = quantum_threshold

    @staticmethod
    def compute_correlation(results: Sequence[MeasurementResult]) -> float:
        """Compute expectation value E(A, B) for a sequence of measurement results.

        Eigenvalue mapping:
            Bit 0 ---> +1
            Bit 1 ---> -1

        Formula:
            E(A, B) = (N_++ + N_-- - N_+ - N_-+) / N_total
                    = sum( (1 - 2*alice_bit) * (1 - 2*bob_bit) ) / N_total

        Args:
            results: Sequence of MeasurementResult objects for a single (Alice, Bob) setting pair.

        Returns:
            float: Correlation coefficient in range [-1.0, 1.0].

        Raises:
            ValueError: If results sequence is empty.
        """
        if not results:
            raise ValueError("Cannot compute correlation for empty results list.")

        total_samples = len(results)
        weighted_sum = 0.0

        for r in results:
            # Map 0 -> +1 and 1 -> -1
            a_val = 1.0 if r.alice_bit == 0 else -1.0
            b_val = 1.0 if r.bob_bit == 0 else -1.0
            weighted_sum += (a_val * b_val) * r.shots
            # Total shots if result represents aggregated shots
            # (Note: r.shots is 1 for single-shot outcomes)

        total_shots = sum(r.shots for r in results)
        return weighted_sum / total_shots

    def verify(self, results: Sequence[MeasurementResult]) -> CHSHResult:
        """Verify the CHSH Bell inequality for a collection of measurement results.

        Mathematical CHSH Expression:
            S = | E(A1, B1) - E(A1, B3) + E(A3, B1) + E(A3, B3) |

        Classification Rules:
            - Local Realism / Classical Bound: S <= 2.0
            - Quantum Entanglement Violation: S > 2.0 (Ideal maximal violation: S = 2√2 ≈ 2.828)
            - Eavesdropping Flag: S <= 2.0 (or below quantum threshold), indicating loss of entanglement coherence.

        Args:
            results: Sequence of MeasurementResult objects collected across various basis settings.

        Returns:
            CHSHResult: Structured verification outcome including CHSH parameter S.

        Raises:
            ValueError: If results sequence is empty or missing required CHSH setting pairs.
        """
        if not results:
            raise ValueError("Cannot verify CHSH parameter with empty measurement results.")

        # Group results by (alice_basis_label, bob_basis_label)
        grouped_results: Dict[Tuple[str, str], List[MeasurementResult]] = {}
        for r in results:
            key = (r.alice_basis.label, r.bob_basis.label)
            if key not in grouped_results:
                grouped_results[key] = []
            grouped_results[key].append(r)

        # Ensure all 4 required pairs are present
        missing_pairs = [pair for pair in self.REQUIRED_PAIRS if pair not in grouped_results]
        if missing_pairs:
            raise ValueError(
                f"Missing required CHSH measurement pairs: {missing_pairs}. "
                f"Required pairs: {self.REQUIRED_PAIRS}"
            )

        # Compute individual correlations
        correlations: Dict[Tuple[str, str], CorrelationResult] = {}
        for pair_key in self.REQUIRED_PAIRS:
            pair_results = grouped_results[pair_key]
            corr_val = self.compute_correlation(pair_results)
            num_samples = sum(r.shots for r in pair_results)
            correlations[pair_key] = CorrelationResult(
                alice_basis=pair_key[0],
                bob_basis=pair_key[1],
                num_samples=num_samples,
                correlation_value=corr_val,
            )

        e_a1_b1 = correlations[("A1", "B1")].correlation_value
        e_a1_b3 = correlations[("A1", "B3")].correlation_value
        e_a3_b1 = correlations[("A3", "B1")].correlation_value
        e_a3_b3 = correlations[("A3", "B3")].correlation_value

        # CHSH Bell parameter: S = |E(A1,B1) - E(A1,B3) + E(A3,B1) + E(A3,B3)|
        s_val = abs(e_a1_b1 - e_a1_b3 + e_a3_b1 + e_a3_b3)

        is_violated = s_val > self.classical_bound
        is_quantum = s_val >= self.quantum_threshold
        eavesdropping_detected = not is_quantum

        return CHSHResult(
            correlations=correlations,
            chsh_value=s_val,
            is_violated=is_violated,
            is_quantum_entangled=is_quantum,
            eavesdropping_detected=eavesdropping_detected,
            total_samples_analyzed=len(results),
            classical_threshold=self.classical_bound,
            quantum_threshold=self.quantum_threshold,
        )


def compute_chsh_value(results: Sequence[MeasurementResult]) -> CHSHResult:
    """Convenience helper function to compute CHSH value from measurement results."""
    verifier = CHSHVerifier()
    return verifier.verify(results)
