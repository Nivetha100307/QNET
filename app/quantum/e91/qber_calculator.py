"""Quantum Bit Error Rate (QBER) Calculator for the E91 protocol.

This module provides data models (`QBERResult`) and the `QBERCalculator` class to
estimate the quantum channel error rate by comparing Alice's and Bob's sifted key bits.
"""

from dataclasses import dataclass
from typing import Sequence

from app.quantum.e91.key_sifting import SiftedKey


@dataclass(frozen=True)
class QBERResult:
    """Structured result containing QBER metrics and security assessment."""

    compared_bits: int
    matching_bits: int
    mismatching_bits: int
    qber_ratio: float
    qber_percentage: float
    secure_channel: bool
    threshold_used: float
    status_message: str


class QBERCalculator:
    """Calculator for Quantum Bit Error Rate (QBER) and channel security assessment."""

    def __init__(
        self,
        max_threshold: float = 0.11,
        excellent_threshold: float = 0.05,
    ) -> None:
        """Initialize the QBERCalculator with configurable security thresholds.

        Args:
            max_threshold: Maximum allowable QBER ratio before marking channel insecure (default: 0.11 or 11%).
            excellent_threshold: Upper threshold for an excellent low-noise channel (default: 0.05 or 5%).

        Raises:
            ValueError: If thresholds are invalid (e.g., negative or max_threshold < excellent_threshold).
        """
        if max_threshold < 0.0 or max_threshold > 1.0:
            raise ValueError(f"max_threshold must be between 0.0 and 1.0, got {max_threshold}.")
        if excellent_threshold < 0.0 or excellent_threshold > max_threshold:
            raise ValueError(
                f"excellent_threshold must be between 0.0 and max_threshold ({max_threshold}), got {excellent_threshold}."
            )

        self.max_threshold = max_threshold
        self.excellent_threshold = excellent_threshold

    def calculate_from_bits(
        self, alice_bits: Sequence[int], bob_bits: Sequence[int]
    ) -> QBERResult:
        """Calculate QBER from raw bit sequences for Alice and Bob.

        Args:
            alice_bits: Sequence of 0s and 1s representing Alice's key bits.
            bob_bits: Sequence of 0s and 1s representing Bob's key bits.

        Returns:
            QBERResult: Calculated error metrics and security classification.

        Raises:
            TypeError: If input sequences are None.
            ValueError: If bit sequence lengths mismatch or contain invalid bit values.
        """
        if alice_bits is None or bob_bits is None:
            raise TypeError("Input bit sequences cannot be None.")

        if len(alice_bits) != len(bob_bits):
            raise ValueError(
                f"Alice and Bob key lengths must be equal: got Alice={len(alice_bits)}, Bob={len(bob_bits)}."
            )

        total_bits = len(alice_bits)
        if total_bits == 0:
            return QBERResult(
                compared_bits=0,
                matching_bits=0,
                mismatching_bits=0,
                qber_ratio=0.0,
                qber_percentage=0.0,
                secure_channel=True,
                threshold_used=self.max_threshold,
                status_message="Empty key provided, 0 bits compared.",
            )

        matching_count = 0
        mismatch_count = 0

        for idx, (a_bit, b_bit) in enumerate(zip(alice_bits, bob_bits)):
            if a_bit not in (0, 1) or b_bit not in (0, 1):
                raise ValueError(
                    f"Invalid bit value at index {idx}: Alice bit={a_bit}, Bob bit={b_bit}. Bits must be 0 or 1."
                )

            if a_bit == b_bit:
                matching_count += 1
            else:
                mismatch_count += 1

        qber_ratio = mismatch_count / total_bits
        qber_pct = qber_ratio * 100.0
        secure = qber_ratio < self.max_threshold

        # Assess channel security status message
        if qber_ratio < self.excellent_threshold:
            status_msg = f"Excellent Channel (QBER {qber_pct:.2f}% < {self.excellent_threshold * 100:.1f}%)"
        elif qber_ratio < self.max_threshold:
            status_msg = (
                f"Acceptable Channel ({self.excellent_threshold * 100:.1f}% <= "
                f"QBER {qber_pct:.2f}% < {self.max_threshold * 100:.1f}%)"
            )
        else:
            status_msg = (
                f"Possible Eavesdropping or Excessive Noise (QBER {qber_pct:.2f}% >= "
                f"{self.max_threshold * 100:.1f}%)"
            )

        return QBERResult(
            compared_bits=total_bits,
            matching_bits=matching_count,
            mismatching_bits=mismatch_count,
            qber_ratio=qber_ratio,
            qber_percentage=qber_pct,
            secure_channel=secure,
            threshold_used=self.max_threshold,
            status_message=status_msg,
        )

    def calculate(self, sifted_key: SiftedKey) -> QBERResult:
        """Calculate QBER for a SiftedKey object.

        Args:
            sifted_key: SiftedKey object containing Alice's and Bob's key bits.

        Returns:
            QBERResult: QBER metrics and security assessment.

        Raises:
            TypeError: If sifted_key is None.
        """
        if sifted_key is None:
            raise TypeError("sifted_key cannot be None.")

        return self.calculate_from_bits(sifted_key.alice_key_bits, sifted_key.bob_key_bits)


def calculate_qber(
    sifted_key: SiftedKey, max_threshold: float = 0.11
) -> QBERResult:
    """Convenience helper function to compute QBER for a SiftedKey object."""
    calculator = QBERCalculator(max_threshold=max_threshold)
    return calculator.calculate(sifted_key)
