"""Key Sifting Engine for the E91 Quantum Key Distribution protocol.

This module provides data models (`SiftedKey`, `KeySiftingReport`) and the `KeySiftingEngine`
class to filter measurement results, retaining matching-basis outcomes (A2/B1 and A3/B2)
to extract Alice's and Bob's raw secret keys.
"""

from dataclasses import dataclass, field
from typing import List, Sequence, Set, Tuple

from app.quantum.e91.measurement import MeasurementResult


@dataclass(frozen=True)
class SiftedKey:
    """Represents the sifted raw key extracted from matching-basis measurement outcomes."""

    alice_key_bits: List[int] = field(default_factory=list)
    bob_key_bits: List[int] = field(default_factory=list)
    key_length: int = 0
    retained_measurements: int = 0
    discarded_measurements: int = 0
    retention_ratio: float = 0.0


@dataclass(frozen=True)
class KeySiftingReport:
    """Summary report detailing key sifting statistics."""

    total_measurements: int
    retained_measurements: int
    discarded_measurements: int
    basis_match_rate: float
    raw_key_length: int


class KeySiftingEngine:
    """Sifting engine for extracting matching-basis bits from measurement results."""

    # In E91, key generation uses identical measurement orientations:
    # A2 (45°) and B1 (45°), or A3 (90°) and B2 (90°)
    KEY_GENERATION_BASES: Set[Tuple[str, str]] = {
        ("A2", "B1"),
        ("A3", "B2"),
    }

    def sift(self, results: Sequence[MeasurementResult]) -> SiftedKey:
        """Sifts measurement results into raw secret key bit lists for Alice and Bob.

        Args:
            results: Sequence of MeasurementResult objects.

        Returns:
            SiftedKey: Structured object containing Alice's and Bob's sifted key bits and metrics.
        """
        if not results:
            return SiftedKey(
                alice_key_bits=[],
                bob_key_bits=[],
                key_length=0,
                retained_measurements=0,
                discarded_measurements=0,
                retention_ratio=0.0,
            )

        alice_bits: List[int] = []
        bob_bits: List[int] = []
        retained_count = 0
        discarded_count = 0

        for r in results:
            pair_key = (r.alice_basis.label, r.bob_basis.label)
            if pair_key in self.KEY_GENERATION_BASES:
                alice_bits.append(r.alice_bit)
                bob_bits.append(r.bob_bit)
                retained_count += 1
            else:
                discarded_count += 1

        total_measurements = len(results)
        retention_ratio = retained_count / total_measurements if total_measurements > 0 else 0.0

        if len(alice_bits) != len(bob_bits):
            raise ValueError(
                f"Sifted key length mismatch: Alice has {len(alice_bits)} bits, "
                f"Bob has {len(bob_bits)} bits."
            )

        return SiftedKey(
            alice_key_bits=alice_bits,
            bob_key_bits=bob_bits,
            key_length=len(alice_bits),
            retained_measurements=retained_count,
            discarded_measurements=discarded_count,
            retention_ratio=retention_ratio,
        )

    def generate_report(self, results: Sequence[MeasurementResult]) -> KeySiftingReport:
        """Generates a summary report detailing key sifting performance metrics.

        Args:
            results: Sequence of MeasurementResult objects.

        Returns:
            KeySiftingReport: Detailed summary metrics.
        """
        sifted = self.sift(results)
        total_measurements = len(results)
        match_rate = sifted.retention_ratio

        return KeySiftingReport(
            total_measurements=total_measurements,
            retained_measurements=sifted.retained_measurements,
            discarded_measurements=sifted.discarded_measurements,
            basis_match_rate=match_rate,
            raw_key_length=sifted.key_length,
        )


def sift_key(results: Sequence[MeasurementResult]) -> SiftedKey:
    """Convenience helper function for sifting measurement results into a raw key."""
    engine = KeySiftingEngine()
    return engine.sift(results)
