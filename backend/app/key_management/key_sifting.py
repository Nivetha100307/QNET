from typing import List, Tuple
from app.key_management.utils import bits_to_string
from app.core.logging_config import logger


def sift_bits(bits: List[int], matching_indexes: List[int]) -> List[int]:
    """Filters raw outcome bits keeping only those at matching basis indices.

    Args:
        bits (List[int]): Raw measured bit outcomes.
        matching_indexes (List[int]): List of indices corresponding to matching bases.

    Returns:
        List[int]: Sifted bit outcomes.
    """
    max_idx = len(bits)
    return [bits[i] for i in matching_indexes if 0 <= i < max_idx]


def perform_key_sifting(
    alice_bits: List[int],
    bob_bits: List[int],
    matching_indexes: List[int]
) -> Tuple[str, str]:
    """Extracts sifted bit strings for Alice and Bob using reconciled basis indices.

    Args:
        alice_bits (List[int]): Alice's raw measured bits.
        bob_bits (List[int]): Bob's raw measured bits.
        matching_indexes (List[int]): List of matching basis indices.

    Returns:
        Tuple[str, str]: Tuple containing (alice_sifted_key_str, bob_sifted_key_str).
    """
    alice_sifted = sift_bits(alice_bits, matching_indexes)
    bob_sifted = sift_bits(bob_bits, matching_indexes)

    alice_key_str = bits_to_string(alice_sifted)
    bob_key_str = bits_to_string(bob_sifted)

    logger.info(
        f"Key sifting complete: Alice key length = {len(alice_key_str)}, "
        f"Bob key length = {len(bob_key_str)}."
    )

    return alice_key_str, bob_key_str
