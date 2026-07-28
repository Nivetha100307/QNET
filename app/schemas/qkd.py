"""Pydantic DTOs for the QKD REST API boundary."""

from typing import List, Optional
from pydantic import BaseModel, Field


class QKDSessionRequest(BaseModel):
    """Request payload for starting a new QKD session."""

    num_bits: int = Field(
        default=128,
        ge=1,
        le=8192,
        description="Target sifted key length in bits (must be between 1 and 8192)",
        examples=[128],
    )
    enable_eve: bool = Field(
        default=False,
        description="Enable Eve eavesdropper intercept-resend attack on quantum channel",
    )
    channel_noise: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Channel decoherence noise ratio (0.0 to 1.0)",
    )
    backend_name: str = Field(
        default="aer_simulator",
        description="Target quantum execution backend",
    )


class QKDSessionResponse(BaseModel):
    """Response payload detailing a QKD session outcome."""

    session_id: str = Field(description="Unique session identifier")
    status: str = Field(description="Session execution status (completed, aborted_eavesdropping, failed)")
    raw_key_length: int = Field(default=0, description="Length of generated sifted key in bits")
    qber: Optional[float] = Field(default=None, description="Quantum Bit Error Rate (ratio 0.0 to 1.0)")
    bell_parameter: Optional[float] = Field(default=None, description="Calculated CHSH Bell parameter S")
    eavesdropping_detected: bool = Field(default=False, description="Flag indicating if eavesdropping was detected")
    created_at: str = Field(description="ISO 8601 creation timestamp")


class SessionListResponse(BaseModel):
    """Response payload for listing QKD sessions with pagination."""

    total: int = Field(description="Total count of sessions retrieved")
    limit: int = Field(description="Pagination limit parameter used")
    offset: int = Field(description="Pagination offset parameter used")
    sessions: List[QKDSessionResponse] = Field(description="List of session response records")
