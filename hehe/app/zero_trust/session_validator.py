import time
from typing import Dict, Any
from app.session.session_manager import session_manager, SessionExpiredError

class ZeroTrustSessionError(Exception):
    """Raised when Zero-Trust session validation fails."""
    pass

class SessionValidationEngine:
    """
    Components 4 & 5: Session Management Engine & Session Validation Engine
    Validates session state, expiry thresholds, key versions, and expected endpoints before packet processing.
    """

    @staticmethod
    def validate_session_for_packet(
        session_id: str,
        expected_sender: str,
        expected_receiver: str,
        expected_key_version: str = None
    ) -> dict:
        """
        Executes strict Zero-Trust session validation checks:
        1. Session Exists?
        2. Session Active?
        3. Session Expired?
        4. Correct Sender?
        5. Correct Receiver?
        6. Key Version Valid?
        """
        try:
            session = session_manager.get_valid_session(session_id)
        except SessionExpiredError as e:
            raise ZeroTrustSessionError(f"Session Validation Failed: {str(e)}")

        # 4. Correct Sender Check
        if session["sender"] != expected_sender:
            raise ZeroTrustSessionError(f"Session Endpoint Mismatch: Packet sender '{expected_sender}' != session sender '{session['sender']}'.")

        # 5. Correct Receiver Check
        if session["receiver"] != expected_receiver:
            raise ZeroTrustSessionError(f"Session Endpoint Mismatch: Packet receiver '{expected_receiver}' != session receiver '{session['receiver']}'.")

        # 6. Key Version Validation
        if expected_key_version and session["key_version"] != expected_key_version:
            raise ZeroTrustSessionError(f"Session Key Mismatch: Packet key version '{expected_key_version}' != session active version '{session['key_version']}'.")

        return session
