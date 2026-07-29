import time
from typing import Dict, Set, Any
from app.config import settings

class FreshnessReplayError(Exception):
    """Raised when timestamp freshness or anti-replay check fails."""
    pass

class FreshnessReplayEngine:
    """
    Components 9 & 10: Freshness Verification Engine & Replay Detection Engine
    Guarantees packet freshness and prevents duplicate/out-of-sequence replay attacks.
    """

    def __init__(self):
        self.seen_packet_ids: Set[str] = set()
        self.seen_nonces: Dict[str, float] = {}
        self.session_last_seq: Dict[str, int] = {}

    def cleanup(self):
        """Remove expired entries older than 300s."""
        now = time.time()
        expired = [nonce for nonce, exp in self.seen_nonces.items() if now > exp]
        for n in expired:
            del self.seen_nonces[n]

    def verify_freshness_and_replay(
        self,
        packet_id: str,
        session_id: str,
        nonce_hex: str,
        sequence_number: int,
        timestamp: float,
        packet_hash: str = None
    ) -> Dict[str, Any]:
        """
        Executes complete freshness and replay protection verification suite:
        1. Timestamp Skew Check (<= 5.0s window)
        2. Nonce Reuse Check
        3. Packet ID Duplicate Check
        4. Sequence Number Continuity Check
        """
        self.cleanup()
        now = time.time()

        # 1. Timestamp Skew Verification
        skew = abs(now - timestamp)
        if skew > settings.TIMESTAMP_MAX_SKEW_SECONDS:
            raise FreshnessReplayError(
                f"Freshness Violation: Packet timestamp skew ({skew:.2f}s) exceeds max threshold ({settings.TIMESTAMP_MAX_SKEW_SECONDS}s)."
            )

        # 2. Nonce Reuse Verification
        if nonce_hex in self.seen_nonces:
            raise FreshnessReplayError(f"Replay Attack Detected: Nonce '{nonce_hex[:12]}...' HAS ALREADY BEEN PROCESSED!")

        # 3. Packet ID Duplicate Verification
        if packet_id in self.seen_packet_ids:
            raise FreshnessReplayError(f"Replay Attack Detected: Duplicate Packet ID '{packet_id}'!")

        # 4. Sequence Number Verification
        last_seq = self.session_last_seq.get(session_id, 0)
        seq_gap_warning = None
        if sequence_number <= last_seq:
            raise FreshnessReplayError(
                f"Replay/Out-of-Order Error: Sequence number {sequence_number} <= last processed sequence {last_seq}."
            )
        elif sequence_number > last_seq + 1:
            seq_gap_warning = f"Sequence Gap Warning: Jump from sequence {last_seq} to {sequence_number} (Missing packets detected)."

        # Record valid parameters
        self.seen_nonces[nonce_hex] = now + settings.NONCE_CACHE_TTL_SECONDS
        self.seen_packet_ids.add(packet_id)
        self.session_last_seq[session_id] = sequence_number

        return {
            "status": "FRESH_AND_UNIQUE",
            "timestamp_skew_seconds": round(skew, 3),
            "sequence_number": sequence_number,
            "warning": seq_gap_warning
        }

freshness_replay_engine = FreshnessReplayEngine()
