import time
import secrets
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET_JWT_KEY = "SCADA_QUANTUM_JWT_SECRET_KEY_SUPER_SECURE"
ALGORITHM = "HS256"

# Registered Device Inventory & Revocation List
REGISTERED_DEVICES = {
    "SUB_NORTH_RTU_01": {"type": "RTU", "substation": "SUB_NORTH", "status": "ONLINE", "trust_score": 0.98},
    "SUB_NORTH_PLC_02": {"type": "PLC", "substation": "SUB_NORTH", "status": "ONLINE", "trust_score": 0.99},
    "BRK_12": {"type": "BREAKER", "substation": "SUB_NORTH", "status": "ONLINE", "trust_score": 1.0},
    "RELAY_04": {"type": "RELAY", "substation": "SUB_SOUTH", "status": "ONLINE", "trust_score": 0.95},
    "TRANS_TAP_01": {"type": "TRANSFORMER", "substation": "SUB_NORTH", "status": "ONLINE", "trust_score": 0.97},
    "GEN_MAIN_01": {"type": "GENERATOR", "substation": "SUB_WEST", "status": "ONLINE", "trust_score": 1.0},
    "SUB_SOUTH_RTU_01": {"type": "RTU", "substation": "SUB_SOUTH", "status": "ONLINE", "trust_score": 0.96},
}

REVOKED_DEVICES = set()

# Role-Based Access Control Permissions Table
RBAC_PERMISSIONS = {
    "OPERATOR": ["READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "LOAD_STATUS", "HEALTH_CHECK", "OPEN_BREAKER", "CLOSE_BREAKER"],
    "CONTROL_OPERATOR": ["READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "LOAD_STATUS", "HEALTH_CHECK", "OPEN_BREAKER", "CLOSE_BREAKER", "TRIP_RELAY", "RESET_RELAY"],
    "ENGINEER": ["READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "LOAD_STATUS", "HEALTH_CHECK", "OPEN_BREAKER", "CLOSE_BREAKER", "TRIP_RELAY", "RESET_RELAY", "SET_TRANSFORMER_TAP", "START_GENERATOR", "STOP_GENERATOR", "ISOLATE_FEEDER", "RESTORE_FEEDER"],
    "SUBSTATION_ENGINEER": ["READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "LOAD_STATUS", "HEALTH_CHECK", "OPEN_BREAKER", "CLOSE_BREAKER", "TRIP_RELAY", "RESET_RELAY", "SET_TRANSFORMER_TAP", "START_GENERATOR", "STOP_GENERATOR", "ISOLATE_FEEDER", "RESTORE_FEEDER"],
    "GRID_ADMIN": ["*"],
    "ADMIN": ["*"],
    "FIELD_ENGINEER": ["READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "HEALTH_CHECK", "RESET_RELAY"],
    "VIEWER": ["READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "LOAD_STATUS", "HEALTH_CHECK"],
    "MONITORING": ["READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "LOAD_STATUS", "HEALTH_CHECK"],
    "AI_AGENT": ["READ_SENSOR", "READ_VOLTAGE", "READ_CURRENT", "READ_FREQUENCY", "HEALTH_CHECK", "TRIP_RELAY"],
    "SCADA_CONTROLLER": ["*"]
}

class AuthenticationError(Exception):
    """Raised when device authentication or RBAC authorization fails."""
    pass

class DeviceAuthEngine:
    """
    Component 3: Device Authentication Engine
    Verifies mutual authentication, device credentials, JWT tokens, and RBAC permissions.
    """

    @staticmethod
    def verify_device_identity(device_id: str, substation_id: str = None) -> Dict[str, Any]:
        """Verify device existence, online status, and whitelist validity."""
        if device_id in REVOKED_DEVICES:
            raise AuthenticationError(f"Device Authentication Failed: Device {device_id} is REVOKED!")
            
        if device_id not in REGISTERED_DEVICES:
            raise AuthenticationError(f"Device Authentication Failed: Device {device_id} is NOT REGISTERED!")

        dev_info = REGISTERED_DEVICES[device_id]
        if dev_info["status"] != "ONLINE":
            raise AuthenticationError(f"Device Authentication Failed: Device {device_id} is OFFLINE or IN MAINTENANCE!")

        if substation_id and dev_info["substation"] != substation_id:
            raise AuthenticationError(f"Device Authentication Failed: Device {device_id} does not belong to Substation {substation_id}!")

        return {
            "device_id": device_id,
            "substation_id": dev_info["substation"],
            "device_type": dev_info["type"],
            "authentication_status": "AUTHENTICATED",
            "trust_score": dev_info["trust_score"],
            "last_login": time.time()
        }

    @staticmethod
    def verify_rbac_permission(role: str, command_type: str) -> bool:
        """Enforces Role-Based Access Control for SCADA commands."""
        allowed_commands = RBAC_PERMISSIONS.get(role.upper(), [])
        if "*" in allowed_commands or command_type in allowed_commands:
            return True
        raise AuthenticationError(f"RBAC Authorization Denied: Role '{role}' is NOT permitted to execute command '{command_type}'.")

    @staticmethod
    def create_jwt_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token for operators and dashboards."""
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(hours=8))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, SECRET_JWT_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_jwt_token(token: str) -> dict:
        """Decode and validate JWT access token."""
        try:
            payload = jwt.decode(token, SECRET_JWT_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise AuthenticationError("Invalid or Expired JWT Access Token!")
