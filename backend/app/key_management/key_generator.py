from app.core.logging_config import logger


class KeyGeneratorError(ValueError):
    """Raised when shared key generation fails due to key mismatch or validation errors."""
    pass


def generate_shared_secret(alice_key: str, bob_key: str) -> str:
    """Generates the raw shared secret key from Alice's and Bob's sifted keys.

    In E91 quantum key distribution, after basis reconciliation and key sifting,
    Alice and Bob possess identical sifted key bit sequences generated from
    entangled Bell pair measurements.

    Args:
        alice_key (str): Alice's sifted key bit string.
        bob_key (str): Bob's sifted key bit string.

    Returns:
        str: Raw shared secret key bit string.

    Raises:
        KeyGeneratorError: If sifted keys are empty or unequal in length.
    """
    if not alice_key or not bob_key:
        raise KeyGeneratorError("Cannot generate shared key from empty sifted bit strings.")

    if len(alice_key) != len(bob_key):
        raise KeyGeneratorError(
            f"Key length mismatch: Alice sifted key has length {len(alice_key)}, "
            f"Bob sifted key has length {len(bob_key)}."
        )

    # In E91 protocol, Alice's sifted key serves as the canonical raw shared secret key
    shared_key = alice_key

    logger.info(
        f"Raw shared secret key generated successfully (Length: {len(shared_key)} bits)."
    )

    return shared_key
