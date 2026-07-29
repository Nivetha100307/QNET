from typing import List
from app.core.logging_config import logger


def reconcile_bases(alice_basis: List[str], bob_basis: List[str]) -> List[int]:
    """Compares Alice's and Bob's measurement basis choices and returns matching indices.

    In E91 protocol, Alice and Bob exchange their measurement basis selections ('Z' or 'X')
    over the classical channel. Bits measured in identical bases are retained, while
    measurements performed in non-matching bases are discarded.

    Args:
        alice_basis (List[str]): List of basis choices ('Z' or 'X') selected by Alice.
        bob_basis (List[str]): List of basis choices ('Z' or 'X') selected by Bob.

    Returns:
        List[int]: List of 0-based indices where Alice's and Bob's bases match.
    """
    if len(alice_basis) != len(bob_basis):
        logger.warning(
            f"Basis length mismatch: Alice has {len(alice_basis)} bases, Bob has {len(bob_basis)} bases."
        )

    min_length = min(len(alice_basis), len(bob_basis))
    matching_indexes = [
        i for i in range(min_length)
        if alice_basis[i].upper() == bob_basis[i].upper()
    ]

    logger.info(
        f"Basis reconciliation complete: {len(matching_indexes)} matching bases found "
        f"out of {min_length} total pairs (Match ratio: {(len(matching_indexes) / min_length * 100) if min_length else 0:.1f}%)."
    )

    return matching_indexes
