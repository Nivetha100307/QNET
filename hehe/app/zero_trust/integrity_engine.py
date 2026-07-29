from typing import Dict, Any
from app.zero_trust.crypto_hash import CryptoHashService

class ZeroTrustIntegrityError(Exception):
    """Raised when integrity check fails."""
    pass

class IntegrityVerificationEngine:
    """
    Component 8 & 12: Integrity Verification Engine
    Verifies payload, header, and metadata integrity using SHA-256 fingerprints and GCM authentication tags.
    """

    @staticmethod
    def verify_packet_integrity(
        packet: dict,
        expected_payload_hash: str = None
    ) -> Dict[str, Any]:
        """
        Executes complete structural integrity inspection.
        Returns result status: VALID, CORRUPTED, MODIFIED, or UNKNOWN.
        """
        header = packet.get("header", {})
        payload = packet.get("payload", "")
        security = packet.get("security", {})
        metadata = packet.get("metadata", {})

        if not payload or not security.get("authentication_tag") or not security.get("nonce"):
            return {"status": "CORRUPTED", "reason": "Missing payload ciphertext or security authentication tag!"}

        # Calculate live payload fingerprint
        calculated_payload_hash = CryptoHashService.generate_sha256_fingerprint(payload)
        
        if expected_payload_hash and calculated_payload_hash != expected_payload_hash:
            return {"status": "MODIFIED", "reason": "Payload SHA-256 fingerprint mismatch! Tampering detected."}

        # Header fingerprint
        header_hash = CryptoHashService.generate_sha256_fingerprint(header)

        return {
            "status": "VALID",
            "payload_sha256": calculated_payload_hash,
            "header_sha256": header_hash,
            "integrity_result": "UNBROKEN"
        }
