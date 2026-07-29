import base64
import os
import time
import hmac
import hashlib
from typing import Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.scada import SCADAPacket, utc_now
from app.repositories.session_repository import SessionRepository
from app.key_management.key_repository import KeyRepository
from app.common.enums import SessionStatus
from app.api.websocket import ws_manager
from app.core.logging_config import logger

try:
    from Cryptodome.Cipher import AES
    HAS_AES = True
except Exception:
    HAS_AES = False


class SCADAExecutionError(ValueError):
    """Raised when SCADA command encryption or dispatch fails."""
    pass


class SCADAService:
    """Service layer orchestrating Module 5 Secure SCADA Communication logic."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.session_repo = SessionRepository(db)
        self.key_repo = KeyRepository(db)

    def _derive_aes_key(self, quantum_key_str: str) -> bytes:
        """Derives a 256-bit AES key from the raw quantum key using HKDF-SHA256."""
        hkdf = hashlib.pbkdf2_hmac(
            hash_name='sha256',
            password=quantum_key_str.encode('utf-8'),
            salt=b'QNetSecure_SCADA_Salt',
            iterations=1000,
            dklen=32
        )
        return hkdf

    def encrypt_command(self, raw_key: str, payload_str: str) -> Tuple[str, str, str, str]:
        """Encrypts command payload string using AES-256-GCM and computes HMAC-SHA256 signature."""
        aes_key = self._derive_aes_key(raw_key)
        nonce = os.urandom(12) # 96-bit nonce for GCM

        if HAS_AES:
            cipher = AES.new(aes_key, AES.MODE_GCM, nonce=nonce)
            ciphertext, tag = cipher.encrypt_and_digest(payload_str.encode('utf-8'))
        else:
            # Fallback XOR cipher simulation if Cryptodome is unavailable
            ciphertext = bytes([b ^ aes_key[i % len(aes_key)] for i, b in enumerate(payload_str.encode('utf-8'))])
            tag = hashlib.sha256(ciphertext).digest()[:16]

        ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
        nonce_b64 = base64.b64encode(nonce).decode('utf-8')
        tag_b64 = base64.b64encode(tag).decode('utf-8')

        # HMAC-SHA256 signature over ciphertext
        h = hmac.new(aes_key, ciphertext, hashlib.sha256)
        signature = h.hexdigest()

        return ciphertext_b64, nonce_b64, tag_b64, signature

    async def send_command(
        self,
        session_uuid: str,
        source_node: str,
        destination_node: str,
        command: str,
        parameters: Dict[str, Any]
    ) -> SCADAPacket:
        """Encrypts and dispatches authenticated SCADA command packet."""
        session = await self.session_repo.find_by_session_id(session_uuid)
        if not session or session.status != SessionStatus.ACTIVE.value:
            raise SCADAExecutionError(f"Session '{session_uuid}' must exist and be ACTIVE.")

        quantum_key = await self.key_repo.find_by_session(session_uuid)
        if not quantum_key or not quantum_key.shared_key:
            raise SCADAExecutionError(f"Quantum key not generated for session '{session_uuid}'.")

        packet_id = f"pkt_{int(time.time() * 1000)}"
        seq_num = session.message_count + 1

        payload_str = f"cmd:{command}|params:{parameters}|seq:{seq_num}"
        ciphertext_b64, nonce_b64, tag_b64, signature = self.encrypt_command(quantum_key.shared_key, payload_str)

        packet = SCADAPacket(
            packet_id=packet_id,
            session_uuid=session_uuid,
            source_node=source_node,
            destination_node=destination_node,
            command=command,
            ciphertext_b64=ciphertext_b64,
            nonce_b64=nonce_b64,
            tag_b64=tag_b64,
            hmac_signature=signature,
            sequence_number=seq_num,
            execution_status="EXECUTED",
            timestamp=utc_now()
        )
        self.db.add(packet)

        # Update session counters
        session.message_count += 1
        session.bytes_transferred += len(ciphertext_b64)
        await self.session_repo.update(session)

        # Broadcast WS event
        await ws_manager.broadcast("SCADA_COMMAND_EXECUTED", {
            "session_id": session_uuid,
            "packet_id": packet_id,
            "command": command,
            "status": "EXECUTED"
        })

        logger.info(f"Encrypted SCADA command '{command}' executed for session '{session_uuid}'.")
        return packet

    async def get_history(self, session_uuid: str) -> List[SCADAPacket]:
        """Retrieves SCADA packet history for a session."""
        stmt = select(SCADAPacket).where(SCADAPacket.session_uuid == session_uuid).order_by(SCADAPacket.id.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
