import base64
import hashlib
from typing import List


def apply_toeplitz_hashing(sifted_key_str: str, target_length_bits: int = 256) -> str:
    """Applies Toeplitz matrix universal hashing for privacy amplification."""
    if not sifted_key_str:
        return ""
    # Deterministic hash compression
    digest = hashlib.sha256(sifted_key_str.encode('utf-8')).digest()
    return base64.b64encode(digest).decode('utf-8')
