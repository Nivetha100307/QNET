"""Shared Secret Key Generator for the E91 protocol.

This module provides data models (`SharedSecretKey`) and the `SharedSecretKeyGenerator`
class to transform validated sifted keys into reusable cryptographic shared secret key representations.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
import math
from typing import List, Optional, Sequence

from app.quantum.e91.key_sifting import SiftedKey
from app.quantum.e91.qber_calculator import QBERResult


@dataclass(frozen=True)
class SharedSecretKey:
    """Cryptographic shared secret key representation with multiple binary/hex views."""

    raw_bit_string: str
    key_bits: List[int]
    key_length_bits: int
    key_length_bytes: int
    binary_representation: str
    hexadecimal_representation: str
    byte_array: bytes
    entropy_information: float
    creation_timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class SharedSecretKeyGenerator:
    """Generator for transforming validated sifted keys into reusable cryptographic shared keys."""

    @staticmethod
    def calculate_shannon_entropy(bits: Sequence[int]) -> float:
        """Calculate Shannon entropy per bit in range [0.0, 1.0].

        Formula:
            H = - (p_0 * log2(p_0) + p_1 * log2(p_1))

        Args:
            bits: Sequence of 0s and 1s.

        Returns:
            float: Shannon entropy value in bits per bit.
        """
        if not bits:
            return 0.0

        n = len(bits)
        count_0 = sum(1 for b in bits if b == 0)
        count_1 = n - count_0

        p0 = count_0 / n
        p1 = count_1 / n

        entropy = 0.0
        if p0 > 0.0:
            entropy -= p0 * math.log2(p0)
        if p1 > 0.0:
            entropy -= p1 * math.log2(p1)

        return entropy

    def generate_from_bits(
        self,
        bits: Sequence[int],
        qber_result: Optional[QBERResult] = None,
    ) -> SharedSecretKey:
        """Generates a SharedSecretKey object from a sequence of bits.

        Args:
            bits: Sequence of 0s and 1s representing the sifted key bits.
            qber_result: Optional QBERResult object to validate channel security.

        Returns:
            SharedSecretKey: Fully populated cryptographic key object.

        Raises:
            TypeError: If input bits sequence is None.
            ValueError: If qber_result indicates insecure channel, bits sequence is empty,
                        or contains invalid bit values.
        """
        if bits is None:
            raise TypeError("Input bits sequence cannot be None.")

        # Validate security status if QBERResult is provided
        if qber_result is not None:
            if not qber_result.secure_channel:
                raise ValueError(
                    f"Cannot generate shared secret key: channel marked insecure "
                    f"(QBER {qber_result.qber_percentage:.2f}% >= threshold {qber_result.threshold_used * 100:.1f}%)."
                )

        if len(bits) == 0:
            raise ValueError("Cannot generate shared secret key from an empty sifted key.")

        # Validate bit values
        for idx, b in enumerate(bits):
            if b not in (0, 1):
                raise ValueError(f"Invalid bit value at index {idx}: '{b}'. Must be 0 or 1.")

        bit_list = list(bits)
        raw_bit_str = "".join(str(b) for b in bit_list)
        key_length_bits = len(bit_list)
        key_length_bytes = (key_length_bits + 7) // 8

        # Pack bits into bytes (MSB first, padded with 0s on the right if needed)
        byte_values = bytearray()
        for i in range(0, key_length_bits, 8):
            chunk = raw_bit_str[i : i + 8]
            # Pad chunk to 8 bits if needed for byte conversion
            padded_chunk = chunk.ljust(8, "0")
            byte_values.append(int(padded_chunk, 2))

        byte_arr = bytes(byte_values)
        hex_rep = byte_arr.hex()
        entropy_val = self.calculate_shannon_entropy(bit_list)

        return SharedSecretKey(
            raw_bit_string=raw_bit_str,
            key_bits=bit_list,
            key_length_bits=key_length_bits,
            key_length_bytes=key_length_bytes,
            binary_representation=raw_bit_str,
            hexadecimal_representation=hex_rep,
            byte_array=byte_arr,
            entropy_information=entropy_val,
        )

    def generate(
        self,
        sifted_key: SiftedKey,
        qber_result: Optional[QBERResult] = None,
    ) -> SharedSecretKey:
        """Generates a SharedSecretKey object from a SiftedKey object.

        Args:
            sifted_key: SiftedKey object containing Alice's and Bob's key bits.
            qber_result: Optional QBERResult object to validate channel security.

        Returns:
            SharedSecretKey: Cryptographic shared key object.

        Raises:
            TypeError: If sifted_key is None.
            ValueError: If Alice and Bob sifted keys do not match.
        """
        if sifted_key is None:
            raise TypeError("sifted_key cannot be None.")

        # Verify Alice's and Bob's keys match
        if sifted_key.alice_key_bits != sifted_key.bob_key_bits:
            raise ValueError(
                "Alice and Bob sifted keys do not match. Run error reconciliation prior to key generation."
            )

        return self.generate_from_bits(sifted_key.alice_key_bits, qber_result=qber_result)


def generate_shared_key(
    sifted_key: SiftedKey,
    qber_result: Optional[QBERResult] = None,
) -> SharedSecretKey:
    """Convenience helper function to generate a SharedSecretKey from a SiftedKey."""
    generator = SharedSecretKeyGenerator()
    return generator.generate(sifted_key, qber_result=qber_result)
