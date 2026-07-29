from typing import Dict, Any, Tuple
from app.crypto.replay_protection import replay_protection_engine, ReplayAttackError
from app.crypto.aes_gcm_engine import AESGCMEngine, CryptographicIntegrityError
from app.scada.command_validator import CommandValidationEngine, CommandValidationError
from app.scada.command_executor import command_executor

class PacketVerificationError(Exception):
    """Raised when incoming packet structure or validation checks fail."""
    pass

class ReceiverGateway:
    """
    Component 12 & 13: Receiver Gateway & Packet Validation Engine
    Receives, validates, verifies replay protection, checks GCM tag integrity, decrypts payload, and routes to SCADA executor.
    """

    @staticmethod
    def process_incoming_packet(
        packet: dict,
        session_id: str,
        derived_key_bytes: bytes,
        user_role: str = "OPERATOR"
    ) -> Dict[str, Any]:
        """
        Complete end-to-end packet validation, decryption, and execution pipeline.
        """
        # 1. Validate Structure
        header = packet.get("header", {})
        payload_hex = packet.get("payload")
        security = packet.get("security", {})
        metadata = packet.get("metadata", {})

        if not header or not payload_hex or not security:
            raise PacketVerificationError("Malformed Packet: Missing header, payload, or security section!")

        pkt_session_id = header.get("session_id")
        packet_id = header.get("packet_id")
        seq_num = header.get("sequence_number")
        timestamp = header.get("timestamp")
        sender = header.get("sender")
        receiver = header.get("receiver")

        nonce_hex = security.get("nonce")
        auth_tag_hex = security.get("authentication_tag")

        if pkt_session_id != session_id:
            raise PacketVerificationError(f"Session Mismatch! Packet session '{pkt_session_id}' != expected '{session_id}'.")

        # 2. Replay & Freshness Protection Check
        replay_protection_engine.validate_packet_freshness(
            session_id=session_id,
            nonce_hex=nonce_hex,
            sequence_number=seq_num,
            timestamp=timestamp
        )

        # 3. Decrypt & Verify AES-256-GCM Integrity Tag
        decrypted_command = AESGCMEngine.decrypt_payload(
            ciphertext_hex=payload_hex,
            nonce_hex=nonce_hex,
            auth_tag_hex=auth_tag_hex,
            derived_key_bytes=derived_key_bytes
        )

        # 4. SCADA Command Validation
        CommandValidationEngine.validate_command(
            command=decrypted_command,
            virtual_device_states=command_executor.device_states,
            user_role=user_role
        )

        # 5. Execute Command against Virtual Grid State
        execution_result = command_executor.execute_command(decrypted_command)

        return {
            "status": "SUCCESS",
            "packet_id": packet_id,
            "session_id": session_id,
            "sequence_number": seq_num,
            "sender": sender,
            "receiver": receiver,
            "decrypted_command": decrypted_command,
            "execution_result": execution_result
        }
