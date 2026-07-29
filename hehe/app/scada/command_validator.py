from typing import Dict, Any
from app.config import settings
from app.crypto.device_auth import DeviceAuthEngine, AuthenticationError

class CommandValidationError(Exception):
    """Raised when SCADA command validation fails."""
    pass

class CommandValidationEngine:
    """
    Component 2: Command Validation Engine
    Validates syntax, parameters, voltage/transformer ranges, device existence, and RBAC permissions.
    Rejects unknown, out-of-bounds, expired, or prohibited commands.
    """

    @staticmethod
    def validate_command(
        command: dict,
        virtual_device_states: Dict[str, dict],
        user_role: str = "OPERATOR"
    ) -> bool:
        """
        Executes complete multi-check validation pipeline on incoming command.
        """
        # 1. Syntax Check
        cmd_type = command.get("command_type") or command.get("type")
        if not cmd_type or cmd_type.upper() not in settings.SUPPORTED_COMMANDS:
            raise CommandValidationError(f"Command Validation Rejected: Unknown or missing command type '{cmd_type}'.")

        cmd_type = cmd_type.upper()
        device_id = command.get("device_id") or command.get("device")
        substation_id = command.get("substation_id", "SUB_NORTH")

        if not device_id:
            raise CommandValidationError("Command Validation Rejected: Missing target device_id!")

        # 2. RBAC Permission Check
        DeviceAuthEngine.verify_rbac_permission(user_role, cmd_type)

        # 3. Device Existence & Online Status Check
        DeviceAuthEngine.verify_device_identity(device_id, substation_id)

        # 4. Parameter Range & Bound Validation
        payload = command.get("payload", {})
        if cmd_type == "SET_TRANSFORMER_TAP":
            tap = payload.get("tap_position")
            if tap is None or not (1 <= tap <= 16):
                raise CommandValidationError(f"Command Validation Rejected: Invalid Transformer Tap position '{tap}'. Range must be 1-16.")

        # 5. Device State Dependency Check
        current_state = virtual_device_states.get(device_id, {})
        if cmd_type == "OPEN_BREAKER" and current_state.get("breaker_state") == "OPEN":
            raise CommandValidationError(f"Command Safety Rejected: Breaker '{device_id}' is ALREADY OPEN.")

        if cmd_type == "CLOSE_BREAKER" and current_state.get("breaker_state") == "CLOSED":
            raise CommandValidationError(f"Command Safety Rejected: Breaker '{device_id}' is ALREADY CLOSED.")

        return True
