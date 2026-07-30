from datetime import datetime
from typing import Dict, Optional, Any
from pydantic import BaseModel, Field, ConfigDict


class SecurityAnalysisRequest(BaseModel):
    """Request payload for triggering Module 4 security analysis."""
    session_uuid: str = Field(..., description="UUID of active session with completed key generation.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "session_uuid": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd"
            }
        }
    )


class SecurityAnalysisResponse(BaseModel):
    """Complete security evaluation report response payload."""
    session_uuid: str = Field(..., description="Session UUID string.")
    bell_test_result: str = Field(..., description="Bell test decision ('PASS' or 'FAIL').")
    chsh_value: float = Field(..., description="Calculated CHSH parameter S value.")
    qber: float = Field(..., description="Quantum Bit Error Rate (e.g., 0.021 for 2.1%).")
    fidelity: float = Field(..., description="Estimated quantum state fidelity (0.0 to 1.0).")
    security_score: int = Field(..., description="Normalized security score (0 to 100).")
    security_status: str = Field(..., description="Security decision.")
    measurement_count: int = Field(..., description="Total measurement shots analyzed.")
    analysis_time_ms: float = Field(..., description="Analysis duration in milliseconds.")
    bell_correlations: Dict[str, Any] = Field(default_factory=dict, description="Bell correlation matrix E(a,b) and coincidences.")
    report_timestamp: datetime = Field(..., description="Report creation timestamp.")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "session_uuid": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd",
                "bell_test_result": "PASS",
                "chsh_value": 2.67,
                "qber": 0.021,
                "fidelity": 0.982,
                "security_score": 96,
                "security_status": "SECURE",
                "measurement_count": 1024,
                "analysis_time_ms": 118.5,
                "bell_correlations": {
                    "ZZ": 0.98,
                    "ZX": 0.02,
                    "XZ": 0.01,
                    "XX": 0.97
                },
                "report_timestamp": "2026-07-30T00:30:00Z"
            }
        }
    )


class SecurityStatusResponse(BaseModel):
    """Lightweight security status overview response."""
    session_uuid: str = Field(..., description="Session UUID string.")
    security_status: str = Field(..., description="Security status ('SECURE', 'WARNING', 'COMPROMISED').")
    security_score: int = Field(..., description="Normalized security score (0 to 100).")
    chsh_value: float = Field(..., description="Calculated CHSH value.")
    qber: float = Field(..., description="Quantum Bit Error Rate.")

    model_config = ConfigDict(from_attributes=True)


class SecurityMetricsResponse(BaseModel):
    """Detailed security metrics response without full report metadata."""
    session_uuid: str = Field(..., description="Session UUID string.")
    chsh_value: float = Field(..., description="Calculated CHSH parameter.")
    qber: float = Field(..., description="Quantum Bit Error Rate.")
    fidelity: float = Field(..., description="State fidelity estimate.")
    bell_test_result: str = Field(..., description="Bell test result ('PASS' or 'FAIL').")
    bell_correlations: Dict[str, Any] = Field(default_factory=dict, description="Bell correlation matrix.")

    model_config = ConfigDict(from_attributes=True)
