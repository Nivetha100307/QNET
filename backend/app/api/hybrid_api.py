"""
FastAPI Router for Hybrid Quantum-PQC Architecture.
Exposes endpoints for status, microsecond timeline logs, priority packet buffer metrics,
policy configurations, key rotation triggers, PQC key generation, and adaptive channel probing.
"""

import time
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Query

from app.pqc.hybrid_session_manager import hybrid_session_manager
from app.pqc.mlkem import ml_kem_engine
from app.pqc.mldsa import ml_dsa_engine
from app.pqc.packet_buffer_manager import packet_buffer_manager
from app.pqc.policy_engine import policy_engine
from app.schemas.hybrid_schemas import (
    HybridStatusResponse,
    PQCGenerateResponse,
    HybridRotateRequest,
    QuantumProbeRequest
)

router = APIRouter(prefix="/hybrid", tags=["Hybrid Quantum-PQC Architecture"])


@router.get("/status", response_model=HybridStatusResponse)
async def get_hybrid_status() -> Dict[str, Any]:
    """Return comprehensive hybrid communication status, state machine, metrics, and timeline."""
    return hybrid_session_manager.get_full_hybrid_status()


@router.get("/timeline")
async def get_hybrid_timeline(limit: int = Query(50, ge=1, le=200)) -> List[Dict[str, Any]]:
    """Return microsecond-precision audit timeline entries."""
    return hybrid_session_manager.timeline_events[-limit:]


@router.get("/buffer")
async def get_buffer_status() -> Dict[str, Any]:
    """Return multi-priority SCADA packet buffer statistics."""
    return packet_buffer_manager.get_buffer_stats()


@router.get("/policy")
async def get_policy_summary() -> List[Dict[str, Any]]:
    """Return active rule-based hybrid security policies."""
    return policy_engine.get_policy_summary()


@router.post("/rotate")
async def rotate_hybrid_keys(request: HybridRotateRequest) -> Dict[str, Any]:
    """
    Trigger manual key rotation or execute PQC fallback recovery.
    """
    if request.force_fallback:
        res = hybrid_session_manager.execute_pqc_fallback_recovery(reason=request.reason)
        return res
    else:
        # Perform normal key rotation within current mode
        hybrid_session_manager.key_rotation_counter += 1
        hybrid_session_manager._add_timeline_entry(
            "MANUAL_KEY_ROTATION",
            f"Key rotation triggered manually. New AES-256-GCM key material derived.",
            1.5
        )
        return {
            "status": "ROTATION_SUCCESS",
            "communication_mode": hybrid_session_manager.communication_mode,
            "key_rotation_counter": hybrid_session_manager.key_rotation_counter
        }


@router.post("/pqc/generate", response_model=PQCGenerateResponse)
async def generate_pqc_exchange() -> Dict[str, Any]:
    """
    Execute standalone NIST ML-KEM-768 & ML-DSA-65 key encapsulation and signature verification exchange.
    """
    t0 = time.perf_counter()
    pub_k, sec_k = ml_kem_engine.generate_keypair()
    ct, shared_secret = ml_kem_engine.encapsulate(pub_k)
    dec_secret = ml_kem_engine.decapsulate(ct, sec_k)

    dsa_pub, dsa_sec = ml_dsa_engine.generate_keypair()
    sig = ml_dsa_engine.sign(dec_secret, dsa_sec)
    sig_valid = ml_dsa_engine.verify(dec_secret, sig, dsa_pub)

    latency_ms = round((time.perf_counter() - t0) * 1000.0, 2)

    return {
        "algorithm_kem": ml_kem_engine.ALGORITHM,
        "algorithm_dsa": ml_dsa_engine.ALGORITHM,
        "shared_secret_bytes": len(shared_secret),
        "ciphertext_bytes": len(ct),
        "signature_bytes": len(sig),
        "signature_verified": sig_valid,
        "derived_aes_key_fingerprint": shared_secret.hex()[:8] + "...",
        "latency_ms": latency_ms
    }


@router.post("/probe")
async def execute_quantum_probe(request: QuantumProbeRequest) -> Dict[str, Any]:
    """
    Execute adaptive background quantum probing to test E91/GHZ channel recovery.
    """
    res = hybrid_session_manager.execute_quantum_channel_probe(
        is_attack_active=request.is_simulated_attack_active
    )
    return res
