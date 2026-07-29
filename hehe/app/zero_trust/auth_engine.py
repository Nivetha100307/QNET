import time
from typing import Dict, Any, List
from app.zero_trust.identity_service import IdentityManagementService, IdentityVerificationError
from app.zero_trust.crypto_hash import CryptoHashService

class ZeroTrustAuthError(Exception):
    """Raised when authentication or authorization check fails."""
    pass

# Permission Matrix for Module 6 Roles
ZERO_TRUST_RBAC_MATRIX = {
    "GRID_ADMIN": {
        "allowed_commands": ["*"],
        "security_level": 5,
        "emergency_override": True
    },
    "SUBSTATION_ENGINEER": {
        "allowed_commands": [
            "READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "LOAD_STATUS", "HEALTH_CHECK",
            "OPEN_BREAKER", "CLOSE_BREAKER", "TRIP_RELAY", "RESET_RELAY", "SET_TRANSFORMER_TAP",
            "ISOLATE_FEEDER", "RESTORE_FEEDER", "START_GENERATOR", "STOP_GENERATOR"
        ],
        "security_level": 4,
        "emergency_override": True
    },
    "CONTROL_OPERATOR": {
        "allowed_commands": [
            "READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "LOAD_STATUS", "HEALTH_CHECK",
            "OPEN_BREAKER", "CLOSE_BREAKER", "TRIP_RELAY", "RESET_RELAY"
        ],
        "security_level": 3,
        "emergency_override": False
    },
    "FIELD_ENGINEER": {
        "allowed_commands": [
            "READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "HEALTH_CHECK", "RESET_RELAY"
        ],
        "security_level": 2,
        "emergency_override": False
    },
    "VIEWER": {
        "allowed_commands": [
            "READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "LOAD_STATUS", "HEALTH_CHECK"
        ],
        "security_level": 1,
        "emergency_override": False
    },
    "AI_AGENT": {
        "allowed_commands": [
            "READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "HEALTH_CHECK", "TRIP_RELAY"
        ],
        "security_level": 4,
        "emergency_override": False
    }
}

# Failed Authentication Attempt Tracker (for Lockout Management)
FAILED_AUTH_TRACKER: Dict[str, dict] = {}

class ZeroTrustAuthEngine:
    """
    Components 2 & 3: Zero-Trust Authentication Engine & Authorization Engine
    Verifies sender authenticity, shared secrets, HMAC tokens, and enforces granular RBAC permissions.
    """

    @staticmethod
    def authenticate_sender(device_id: str, payload_data: Any, received_hmac: str = None) -> Dict[str, Any]:
        """
        Component 2: Verify that sender is genuinely who it claims to be.
        Checks lockouts, shared secret validity, and HMAC token.
        """
        # 1. Lockout Check
        tracker = FAILED_AUTH_TRACKER.setdefault(device_id, {"failed_attempts": 0, "locked_until": 0})
        if time.time() < tracker["locked_until"]:
            raise ZeroTrustAuthError(f"Authentication Denied: Device '{device_id}' is LOCKED OUT due to repeated failed attempts!")

        # 2. Retrieve Identity & Secret
        identity = IdentityManagementService.verify_identity(device_id)
        shared_secret = identity["authentication_secret"]

        # 3. Verify HMAC signature if provided
        if received_hmac:
            valid_hmac = CryptoHashService.verify_hmac_sha256(shared_secret, payload_data, received_hmac)
            if not valid_hmac:
                tracker["failed_attempts"] += 1
                if tracker["failed_attempts"] >= 5:
                    tracker["locked_until"] = time.time() + 300.0 # 5 min lockout
                raise ZeroTrustAuthError(f"Authentication Failed: Invalid HMAC token for device '{device_id}'!")

        # Reset failed attempts on success
        tracker["failed_attempts"] = 0
        return {
            "authentication_status": "AUTHENTICATED",
            "device_id": device_id,
            "role": identity["role"],
            "authentication_time": time.time()
        }

    @staticmethod
    def authorize_command(role: str, command_type: str, device_id: str = None) -> bool:
        """
        Component 3: Verify command permission for the specified role.
        Role answers: What are you allowed to do?
        """
        role_upper = role.upper()
        cmd_upper = command_type.upper()

        if role_upper not in ZERO_TRUST_RBAC_MATRIX:
            raise ZeroTrustAuthError(f"Authorization Denied: Role '{role}' is UNKNOWN!")

        role_info = ZERO_TRUST_RBAC_MATRIX[role_upper]
        allowed = role_info["allowed_commands"]

        if "*" in allowed or cmd_upper in allowed:
            return True

        raise ZeroTrustAuthError(f"Authorization Denied: Role '{role}' is NOT PERMITTED to execute command '{command_type}'.")
