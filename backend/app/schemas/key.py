from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class KeyGenerationRequest(BaseModel):
    """Request schema for starting Module 3 Quantum Key Management generation."""
    session_uuid: str = Field(..., description="UUID string of active session")


class KeyGenerationResponse(BaseModel):
    """Response schema for quantum key generation results."""
    session_uuid: str = Field(..., description="Session UUID string")
    generation_status: str = Field(..., description="Key generation status (e.g. GENERATED)")
    matching_indexes: List[int] = Field(default_factory=list, description="List of 0-based matching basis indices")
    alice_key: str = Field(..., description="Alice's sifted bit string")
    bob_key: str = Field(..., description="Bob's sifted bit string")
    shared_key: str = Field(..., description="Reconciled raw shared secret key bit string")
    key_length: int = Field(..., description="Length of the sifted shared key in bits")
    created_at: Optional[datetime] = Field(default=None, description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


class KeyStatusResponse(BaseModel):
    """Response schema for lightweight key status check."""
    session_uuid: str = Field(..., description="Session UUID string")
    generation_status: str = Field(..., description="Key generation status")
    key_length: int = Field(..., description="Length of the generated key in bits")

    model_config = ConfigDict(from_attributes=True)


class SharedKeyResponse(BaseModel):
    """Response schema for extracting shared secret key."""
    session_uuid: str = Field(..., description="Session UUID string")
    shared_key: str = Field(..., description="Raw shared secret key bit string")
    key_length: int = Field(..., description="Key length in bits")

    model_config = ConfigDict(from_attributes=True)
