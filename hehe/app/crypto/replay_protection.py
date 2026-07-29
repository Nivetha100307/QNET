import time
from typing import Dict, Set, Tuple
from app.config import settings

class ReplayAttackError(Exception):
    """Raised when a replay attack or freshness violation is detected."""
    pass

class ReplayProtectionEngine:
    """
    Component 10: Replay Protection Engine
    Prevents unauthorized packet replay by validating Nonce, Sequence Number, and Timestamp.
    """
    def __init__(self):
        # Cache nonces: set of (nonce_hex, expire_timestamp)
        self.seen_nonces: Dict[str, float] = {}
        # Track last processed sequence number per session: session_id -> last_seq_num
        self.session_sequence_trackers: Dict[str, int] = {}

    def cleanup_expired_nonces(self):
        """Remove nonces older than TTL window."""
        now = time.time()
        expired_keys = [nonce for nonce, exp in self.seen_nonces.items() if now > exp]
        for key in expired_keys:
            del self.seen_nonces[key]

    def validate_packet_freshness(
        self,
        session_id: str,
        nonce_hex: str,
        sequence_number: int,
        timestamp: float
    ) -> bool:
        """
        Validates packet against timestamp expiry, nonce duplication, and sequence number gaps.
        """
        now = time.time()
        self.cleanup_expired_nonces()

        # 1. Timestamp Freshness Check
        skew = abs(now - timestamp)
        if skew > settings.TIMESTAMP_MAX_SKEW_SECONDS:
            raise ReplayAttackError(
                f"Expired Timestamp! Packet skew ({skew:.2f}s) exceeds max threshold ({settings.TIMESTAMP_MAX_SKEW_SECONDS}s)."
            )

        # 2. Nonce Duplication Check
        if nonce_hex in self.seen_nonces:
            raise ReplayAttackError(f"Duplicate Nonce Detected! Nonce {nonce_hex[:12]}... has already been processed.")

        # 3. Sequence Number Validation
        last_seq = self.session_sequence_trackers.get(session_id, 0)
        if sequence_number <= last_seq:
            raise ReplayAttackError(
                f"Sequence Number Replay/Out-of-Order! Received {sequence_number}, but last processed sequence was {last_seq}."
            )

        # Record valid packet parameters
        self.seen_nonces[nonce_hex] = now + settings.NONCE_CACHE_TTL_SECONDS
        self.session_sequence_trackers[session_id] = sequence_number
        return True

replay_protection_engine = ReplayProtectionEngine()
