from app.cascade.toeplitz import apply_toeplitz_hashing


def execute_privacy_amplification(raw_key: str) -> str:
    """Removes information leakage caused by Cascade error correction parity exchanges."""
    return apply_toeplitz_hashing(raw_key, target_length_bits=256)
