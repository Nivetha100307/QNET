from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class QuantumStartRequest(BaseModel):
    """Request schema for starting Module 2 E91 Quantum Engine."""
    session_uuid: str = Field(..., description="UUID string of active Module 1 session")
    shots: int = Field(default=1024, ge=1, le=10000, description="Number of Bell pair shots")


class QuantumMeasurementResponse(BaseModel):
    """Response schema for quantum measurement execution results."""
    session_uuid: str = Field(..., description="Session UUID string")
    status: str = Field(..., description="Measurement status (e.g. MEASURED)")
    protocol_version: str = Field(default="E91_v1", description="Protocol version identifier")
    bell_pair_count: int = Field(..., description="Total Bell pairs generated")
    shots: int = Field(..., description="Configured shots")
    alice_basis: List[str] = Field(default_factory=list, description="Measurement bases selected by Alice (X/Z)")
    bob_basis: List[str] = Field(default_factory=list, description="Measurement bases selected by Bob (X/Z)")
    alice_bits: List[int] = Field(default_factory=list, description="Raw outcome bits measured by Alice (0/1)")
    bob_bits: List[int] = Field(default_factory=list, description="Raw outcome bits measured by Bob (0/1)")
    execution_backend: str = Field(default="AerSimulator", description="Simulator backend name")
    simulation_time_ms: float = Field(default=0.0, description="Execution time in milliseconds")
    circuit_qasm: Optional[str] = Field(default=None, description="Generated QASM string")
    circuit_diagram: Optional[str] = Field(default=None, description="Text-rendered Qiskit circuit diagram")

    model_config = ConfigDict(from_attributes=True)


class MeasurementResult(QuantumMeasurementResponse):
    """Alias schema for MeasurementResult."""
    pass


class BasisResponse(BaseModel):
    """Response schema containing generated measurement bases."""
    session_uuid: str
    alice_basis: List[str]
    bob_basis: List[str]
