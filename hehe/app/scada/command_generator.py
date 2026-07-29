import secrets
import time
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.config import settings

class SCADACommandModel(BaseModel):
    command_id: str = Field(default_factory=lambda: f"CMD{secrets.randbelow(8999) + 1000}")
    command_type: str
    priority: str = "HIGH"
    device_id: str
    substation_id: str = "SUB_NORTH"
    timestamp: float = Field(default_factory=time.time)
    issuer: str = "OPERATOR_1"
    payload: Dict[str, Any] = Field(default_factory=dict)

class SCADACommandGenerator:
    """
    Component 1: SCADA Command Generator
    Generates realistic industrial control commands matching substation standards.
    """

    @staticmethod
    def generate_command(
        command_type: str,
        device_id: str,
        substation_id: str = "SUB_NORTH",
        priority: str = "HIGH",
        issuer: str = "OPERATOR_1",
        payload: Optional[dict] = None
    ) -> SCADACommandModel:
        """Constructs a validated SCADA command object."""
        cmd_type_upper = command_type.upper()
        if cmd_type_upper not in settings.SUPPORTED_COMMANDS:
            raise ValueError(f"Unsupported Command Type: '{command_type}'. Supported: {settings.SUPPORTED_COMMANDS}")

        custom_payload = payload or {}
        
        # Add default control parameters based on command type if missing
        if cmd_type_upper == "SET_TRANSFORMER_TAP" and "tap_position" not in custom_payload:
            custom_payload["tap_position"] = 5
        elif cmd_type_upper == "ISOLATE_FEEDER" and "feeder_id" not in custom_payload:
            custom_payload["feeder_id"] = "FDR_09"

        return SCADACommandModel(
            command_type=cmd_type_upper,
            device_id=device_id,
            substation_id=substation_id,
            priority=priority.upper(),
            issuer=issuer,
            payload=custom_payload
        )
