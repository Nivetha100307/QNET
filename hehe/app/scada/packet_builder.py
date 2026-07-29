import secrets
import time
from typing import Dict, Any

class PacketBuilder:
    """
    Component 9: Packet Construction Engine
    Constructs tamper-evident SCADA transport packet envelopes with header, encrypted payload, metadata, and security tags.
    """

    @staticmethod
    def build_packet(
        session_id: str,
        sequence_number: int,
        sender: str,
        receiver: str,
        encrypted_payload_hex: str,
        nonce_hex: str,
        authentication_tag_hex: str,
        key_version: str = "v1.0",
        priority: str = "HIGH",
        ttl_seconds: int = 30
    ) -> Dict[str, Any]:
        """
        Constructs standardized SCADA packet structure.
        """
        packet_id = f"PKT_{secrets.token_hex(8)}"
        timestamp = time.time()

        return {
            "header": {
                "session_id": session_id,
                "packet_id": packet_id,
                "sequence_number": sequence_number,
                "timestamp": timestamp,
                "sender": sender,
                "receiver": receiver
            },
            "payload": encrypted_payload_hex,
            "metadata": {
                "algorithm": "AES-256-GCM",
                "version": "1.0",
                "priority": priority,
                "ttl": ttl_seconds,
                "protocol": "QKD-SCADA-v1"
            },
            "security": {
                "nonce": nonce_hex,
                "authentication_tag": authentication_tag_hex,
                "key_version": key_version,
                "signature": f"SIG_GCM_{authentication_tag_hex[:16]}"
            }
        }
