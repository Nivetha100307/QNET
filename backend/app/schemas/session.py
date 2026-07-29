from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict

from app.common.enums import NodeName, ProtocolType, SessionType, SessionStatus
from app.common.constants import (
    DEFAULT_QUANTUM_LATENCY_MS,
    DEFAULT_QUANTUM_PHOTON_LOSS,
    DEFAULT_QUANTUM_NOISE_LEVEL,
    DEFAULT_CLASSICAL_LATENCY_MS,
    DEFAULT_CLASSICAL_AUTHENTICATION_READY,
    DEFAULT_CLASSICAL_ENCRYPTION_READY
)

# Aliases for backward compatibility
NodeEnum = NodeName
ProtocolEnum = ProtocolType
SessionTypeEnum = SessionType
SessionStatusEnum = SessionStatus


class QuantumChannelProperties(BaseModel):
    """Properties of the simulated Quantum Channel."""
    status: str = Field(default="CONNECTED", description="Channel connection status")
    latency_ms: float = Field(default=DEFAULT_QUANTUM_LATENCY_MS, description="Quantum channel latency in ms")
    photon_loss: float = Field(default=DEFAULT_QUANTUM_PHOTON_LOSS, description="Percentage photon loss")
    noise_level: float = Field(default=DEFAULT_QUANTUM_NOISE_LEVEL, description="Channel noise ratio")
    bell_score: Optional[float] = Field(default=None, description="Measured CHSH Bell score")
    qber: Optional[float] = Field(default=None, description="Quantum Bit Error Rate")
    fidelity: Optional[float] = Field(default=None, description="Quantum state fidelity")

    model_config = ConfigDict(from_attributes=True)


class ClassicalChannelProperties(BaseModel):
    """Properties of the Classical Communication Channel."""
    status: str = Field(default="CONNECTED", description="Channel connection status")
    latency_ms: float = Field(default=DEFAULT_CLASSICAL_LATENCY_MS, description="Classical channel latency in ms")
    authentication_ready: bool = Field(default=DEFAULT_CLASSICAL_AUTHENTICATION_READY, description="Authentication flag")
    encryption_ready: bool = Field(default=DEFAULT_CLASSICAL_ENCRYPTION_READY, description="Classical payload encryption ready flag")

    model_config = ConfigDict(from_attributes=True)


class TimelineEvent(BaseModel):
    """Event entry in session timeline."""
    timestamp: str
    event: str
    status: str
    details: Optional[str] = ""


class SessionCreateRequest(BaseModel):
    """Request schema for creating a secure quantum session."""
    source_node: NodeName = Field(..., description="Origin SCADA node")
    destination_node: NodeName = Field(..., description="Target SCADA node")
    protocol: ProtocolType = Field(default=ProtocolType.E91, description="Quantum protocol")
    session_type: SessionType = Field(default=SessionType.SIMULATION, description="Session type")

    @field_validator("destination_node")
    @classmethod
    def validate_nodes_not_equal(cls, v: NodeName, info: Any) -> NodeName:
        if "source_node" in info.data and v == info.data["source_node"]:
            raise ValueError("Destination node cannot be equal to source node.")
        return v


class SessionActivateRequest(BaseModel):
    """Request schema for activating a READY session."""
    session_id: str = Field(..., description="UUID string of session to activate")


class EndSessionRequest(BaseModel):
    """Request schema for terminating a session."""
    session_id: str = Field(..., description="UUID string of session to end")


class SessionResponse(BaseModel):
    """Full session response object."""
    id: int
    session_id: str
    source_node: str
    destination_node: str
    protocol: str
    session_type: str
    status: str
    route: List[str]
    quantum_channel: QuantumChannelProperties
    classical_channel: ClassicalChannelProperties
    node_status: Dict[str, str]
    message_count: int
    bytes_transferred: int
    timeline: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    ended_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SessionStatusResponse(BaseModel):
    """Lightweight session status response object."""
    session_id: str
    status: str
    source_node: str
    destination_node: str
    protocol: str
    quantum_channel_status: str
    classical_channel_status: str

    model_config = ConfigDict(from_attributes=True)
