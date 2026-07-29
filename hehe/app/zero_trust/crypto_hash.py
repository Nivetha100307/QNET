import hmac
import hashlib
import json
import time
from typing import Dict, Any, Tuple

class CryptoHashService:
    """
    Component 6 & 7: Cryptographic Hash Service & HMAC Authentication Engine
    Generates SHA-256 fingerprints and HMAC-SHA256 message authentication codes using constant-time comparison.
    """

    @staticmethod
    def generate_sha256_fingerprint(data: Any) -> str:
        """Generates SHA-256 hex digest for payload, header, or log entries."""
        if isinstance(data, dict):
            data_bytes = json.dumps(data, sort_keys=True).encode("utf-8")
        elif isinstance(data, str):
            data_bytes = data.encode("utf-8")
        elif isinstance(data, bytes):
            data_bytes = data
        else:
            data_bytes = str(data).encode("utf-8")

        return hashlib.sha256(data_bytes).hexdigest()

    @staticmethod
    def generate_hmac_sha256(secret_key: str, message: Any) -> str:
        """Generates HMAC-SHA256 signature for packet payload and headers."""
        if isinstance(message, dict):
            msg_bytes = json.dumps(message, sort_keys=True).encode("utf-8")
        elif isinstance(message, str):
            msg_bytes = message.encode("utf-8")
        else:
            msg_bytes = bytes(message)

        key_bytes = secret_key.encode("utf-8")
        return hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest()

    @staticmethod
    def verify_hmac_sha256(secret_key: str, message: Any, received_hmac: str) -> bool:
        """
        Verifies HMAC-SHA256 using constant-time hmac.compare_digest() to mitigate timing attacks.
        """
        expected_hmac = CryptoHashService.generate_hmac_sha256(secret_key, message)
        return hmac.compare_digest(expected_hmac.lower(), received_hmac.lower())
