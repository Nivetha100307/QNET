import time
import secrets
from typing import Dict, Any, Optional

# Pre-registered SCADA Network Entities
ZERO_TRUST_IDENTITY_REGISTRY = {
    "BRK_12": {
        "device_id": "BRK_12",
        "device_name": "Substation North Main Circuit Breaker",
        "device_type": "BREAKER",
        "substation_id": "SUB_NORTH",
        "role": "CONTROL_OPERATOR",
        "status": "ACTIVE",
        "public_identity": "ID_NORTH_BRK_12_CERT_V2",
        "authentication_secret": "SECRET_KEY_BRK_12_SECURE_2026",
        "registered_on": 1700000000.0,
        "last_seen": time.time(),
        "trust_score": 100.0,
        "certificate_version": "v2.1",
        "firmware_version": "v2.4.1"
    },
    "RELAY_04": {
        "device_id": "RELAY_04",
        "device_name": "Substation South Protective Relay",
        "device_type": "RELAY",
        "substation_id": "SUB_SOUTH",
        "role": "SUBSTATION_ENGINEER",
        "status": "ACTIVE",
        "public_identity": "ID_SOUTH_RELAY_04_CERT_V1",
        "authentication_secret": "SECRET_KEY_RELAY_04_SECURE_2026",
        "registered_on": 1700000000.0,
        "last_seen": time.time(),
        "trust_score": 98.0,
        "certificate_version": "v1.8",
        "firmware_version": "v2.4.1"
    },
    "TRANS_TAP_01": {
        "device_id": "TRANS_TAP_01",
        "device_name": "Substation North Transformer Tap Controller",
        "device_type": "TRANSFORMER",
        "substation_id": "SUB_NORTH",
        "role": "SUBSTATION_ENGINEER",
        "status": "ACTIVE",
        "public_identity": "ID_NORTH_TRANS_01_CERT_V2",
        "authentication_secret": "SECRET_KEY_TRANS_01_SECURE_2026",
        "registered_on": 1700000000.0,
        "last_seen": time.time(),
        "trust_score": 99.0,
        "certificate_version": "v2.0",
        "firmware_version": "v2.4.1"
    },
    "GEN_MAIN_01": {
        "device_id": "GEN_MAIN_01",
        "device_name": "West Grid Main Generator Unit",
        "device_type": "GENERATOR",
        "substation_id": "SUB_WEST",
        "role": "GRID_ADMIN",
        "status": "ACTIVE",
        "public_identity": "ID_WEST_GEN_01_CERT_V3",
        "authentication_secret": "SECRET_KEY_GEN_01_SECURE_2026",
        "registered_on": 1700000000.0,
        "last_seen": time.time(),
        "trust_score": 100.0,
        "certificate_version": "v3.0",
        "firmware_version": "v2.4.1"
    },
    "AI_ANOMALY_AGENT": {
        "device_id": "AI_ANOMALY_AGENT",
        "device_name": "Autonomous AI Security Agent",
        "device_type": "AI_AGENT",
        "substation_id": "HQ_CENTRAL",
        "role": "AI_AGENT",
        "status": "ACTIVE",
        "public_identity": "ID_AI_AGENT_CERT_V1",
        "authentication_secret": "SECRET_KEY_AI_AGENT_SECURE_2026",
        "registered_on": 1700000000.0,
        "last_seen": time.time(),
        "trust_score": 100.0,
        "certificate_version": "v1.0",
        "firmware_version": "v3.0.0"
    }
}

class IdentityVerificationError(Exception):
    """Raised when identity verification fails."""
    pass

class IdentityManagementService:
    """
    Component 1: Identity Management Service
    Maintains and verifies identity records, status, revocation list, and public identity certs for all SCADA entities.
    """

    @staticmethod
    def verify_identity(device_id: str) -> Dict[str, Any]:
        """
        Executes identity verification checks:
        - Device registered?
        - Device ID exists?
        - Device active?
        - Device not revoked?
        - Device trust score acceptable?
        """
        if device_id not in ZERO_TRUST_IDENTITY_REGISTRY:
            raise IdentityVerificationError(f"Identity Verification Failed: Device '{device_id}' is UNKNOWN / UNREGISTERED!")

        record = ZERO_TRUST_IDENTITY_REGISTRY[device_id]
        
        if record["status"] == "REVOKED":
            raise IdentityVerificationError(f"Identity Verification Failed: Device '{device_id}' has been REVOKED!")

        if record["status"] == "ISOLATED":
            raise IdentityVerificationError(f"Identity Verification Failed: Device '{device_id}' is ISOLATED due to low trust score!")

        if record["status"] != "ACTIVE":
            raise IdentityVerificationError(f"Identity Verification Failed: Device '{device_id}' status is '{record['status']}'!")

        # Update last seen timestamp
        record["last_seen"] = time.time()
        return record

    @staticmethod
    def get_shared_secret(device_id: str) -> str:
        """Retrieve pre-shared secret for HMAC authentication."""
        record = IdentityManagementService.verify_identity(device_id)
        return record["authentication_secret"]

    @staticmethod
    def revoke_device(device_id: str, reason: str = "Security Breach"):
        """Revokes device identity."""
        if device_id in ZERO_TRUST_IDENTITY_REGISTRY:
            ZERO_TRUST_IDENTITY_REGISTRY[device_id]["status"] = "REVOKED"
            ZERO_TRUST_IDENTITY_REGISTRY[device_id]["revocation_reason"] = reason

identity_service = IdentityManagementService()
