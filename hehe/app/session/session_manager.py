import secrets
import time
from typing import Dict, Any, Optional
from app.crypto.e91_retrieval import KeyRetrievalService
from app.crypto.hkdf_service import KeyDerivationService
from app.config import settings

class SessionExpiredError(Exception):
    """Raised when an action is attempted on an expired or terminated session."""
    pass

class SessionManager:
    """
    Component 4: Session Management Service
    Manages communication sessions, quantum key rotation, sequence numbering, and lifecycle timeouts.
    """

    def __init__(self):
        # In-memory session registry: session_id -> session_dict
        self.active_sessions: Dict[str, dict] = {}

    def create_session(
        self,
        sender: str = "SUB_NORTH",
        receiver: str = "SUB_SOUTH",
        ttl_seconds: int = settings.DEFAULT_SESSION_TTL_SECONDS
    ) -> Dict[str, Any]:
        """
        Establishes a new QKD-secured SCADA session.
        Retrieves raw quantum key from E91 QKD service and derives AES-256 session key using HKDF-SHA256.
        """
        session_id = f"SESS_{secrets.token_hex(16)}"
        now = time.time()
        expiry_time = now + ttl_seconds

        # 1. Retrieve Raw Quantum Key from E91 QKD System (Component 5)
        quantum_key_data = KeyRetrievalService.retrieve_raw_quantum_key(sender, receiver)

        # 2. Derive AES-256 Session Key using HKDF-SHA256 (Component 6)
        derived_key_data = KeyDerivationService.derive_aes_key(
            raw_key_bytes=quantum_key_data["raw_key_bytes"],
            context=f"SCADA_SESSION_{session_id}"
        )

        session_obj = {
            "session_id": session_id,
            "sender": sender,
            "receiver": receiver,
            "creation_time": now,
            "expiry_time": expiry_time,
            "key_rotation_countdown": settings.KEY_ROTATION_INTERVAL_SECONDS,
            "sequence_number": 0,
            "status": "ACTIVE",
            "key_version": "v1.0",
            "quantum_metadata": quantum_key_data,
            "derived_key_data": derived_key_data
        }

        self.active_sessions[session_id] = session_obj
        return session_obj

    def get_valid_session(self, session_id: str) -> dict:
        """Retrieves active session object. Raises SessionExpiredError if expired or missing."""
        if session_id not in self.active_sessions:
            raise SessionExpiredError(f"Session Error: Session '{session_id}' DOES NOT EXIST!")

        session = self.active_sessions[session_id]
        if session["status"] != "ACTIVE":
            raise SessionExpiredError(f"Session Error: Session '{session_id}' is {session['status']}!")

        if time.time() > session["expiry_time"]:
            session["status"] = "EXPIRED"
            raise SessionExpiredError(f"Session Expired: Session '{session_id}' has passed its expiry threshold!")

        return session

    def get_next_sequence_number(self, session_id: str) -> int:
        """Increments and returns the next sequence number for the session."""
        session = self.get_valid_session(session_id)
        session["sequence_number"] += 1
        return session["sequence_number"]

    def rotate_session_key(self, session_id: str) -> dict:
        """
        Executes quantum key rotation for an active session.
        Obtains new raw E91 key, re-runs HKDF, increments key version.
        """
        session = self.get_valid_session(session_id)
        
        new_q_key = KeyRetrievalService.retrieve_raw_quantum_key(session["sender"], session["receiver"])
        
        ver_num = int(session["key_version"].replace("v", "").split(".")[0]) + 1
        new_version = f"v{ver_num}.0"

        new_derived_key = KeyDerivationService.derive_aes_key(
            raw_key_bytes=new_q_key["raw_key_bytes"],
            context=f"SCADA_SESSION_{session_id}_{new_version}"
        )

        session["quantum_metadata"] = new_q_key
        session["derived_key_data"] = new_derived_key
        session["key_version"] = new_version
        session["creation_time"] = time.time()
        session["key_rotation_countdown"] = settings.KEY_ROTATION_INTERVAL_SECONDS

        return session

    def terminate_session(self, session_id: str):
        """Terminates session and zeroises key material."""
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
            session["status"] = "TERMINATED"
            # Key Zeroisation (overwrite sensitive key bytes)
            session["derived_key_data"]["derived_key_bytes"] = b"\x00" * 32
            session["quantum_metadata"]["raw_key_bytes"] = b"\x00" * 32

session_manager = SessionManager()
