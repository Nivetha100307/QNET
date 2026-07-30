"""
Pydantic Schemas for Hybrid Quantum-PQC Architecture APIs.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class HybridStatusMetrics(BaseModel):
    recovery_counter: int
    key_rotation_counter: int
    last_recovery_reason: str
    last_recovery_timestamp: Optional[str] = None
    last_recovery_duration_ms: float
    avg_recovery_duration_ms: float
    packets_saved: int
    packets_flushed: int
    packets_dropped: int
    recovery_success_rate: float


class HybridStatusResponse(BaseModel):
    session_id: str
    communication_mode: str
    current_key_source: str
    current_signature_source: str
    current_cipher: str
    active_algorithms: str
    topology: Dict[str, Any]
    metrics: HybridStatusMetrics
    packet_buffer: Dict[str, Any]
    policies: List[Dict[str, Any]]
    timeline: List[Dict[str, Any]]


class PQCGenerateResponse(BaseModel):
    algorithm_kem: str
    algorithm_dsa: str
    shared_secret_bytes: int
    ciphertext_bytes: int
    signature_bytes: int
    signature_verified: bool
    derived_aes_key_fingerprint: str
    latency_ms: float


class HybridRotateRequest(BaseModel):
    force_fallback: bool = False
    reason: Optional[str] = "Manual Administrator Key Rotation Trigger"


class QuantumProbeRequest(BaseModel):
    is_simulated_attack_active: bool = False
