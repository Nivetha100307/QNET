import time
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.zero_trust.identity_service import identity_service, ZERO_TRUST_IDENTITY_REGISTRY
from app.zero_trust.auth_engine import ZeroTrustAuthEngine, ZeroTrustAuthError
from app.zero_trust.session_validator import SessionValidationEngine, ZeroTrustSessionError
from app.zero_trust.crypto_hash import CryptoHashService
from app.zero_trust.integrity_engine import IntegrityVerificationEngine
from app.zero_trust.trust_engine import trust_engine
from app.zero_trust.decision_engine import decision_engine
from app.zero_trust.audit_engine import ZeroTrustAuditEngine
from app.monitoring.metrics_engine import metrics_engine
from app.api.websockets import ws_manager

router_m6 = APIRouter()

# Zero-Trust Request Schemas
class VerifyPacketRequest(BaseModel):
    packet: dict
    user_role: str = Field(default="OPERATOR")
    command_type: str = Field(default="READ_VOLTAGE")

class AuthenticateRequest(BaseModel):
    device_id: str
    hmac_token: Optional[str] = None
    payload: Optional[dict] = None

class AuthorizeRequest(BaseModel):
    role: str
    command_type: str
    device_id: Optional[str] = None

class HMACVerifyRequest(BaseModel):
    secret_key: str
    message: dict
    received_hmac: str

class UpdateTrustRequest(BaseModel):
    device_id: str
    action: str = Field(..., json_schema_extra={"example": "PENALIZE"}) # PENALIZE, REWARD, RESET
    incident_type: Optional[str] = "Manual Security Action"
    points: float = 10.0
    reason: Optional[str] = "Operator override"

@router_m6.post("/verify")
async def verify_zero_trust_packet(req: VerifyPacketRequest):
    """
    POST /api/zero-trust/verify
    Executes complete 20-stage Security Verification Pipeline.
    Returns unified Security Decision object (ALLOW / BLOCK + Risk level + 20-step breakdown).
    """
    decision_obj = await decision_engine.evaluate_packet_zero_trust(
        packet=req.packet,
        user_role=req.user_role,
        command_type=req.command_type
    )

    # Record decision audit & broadcast over WebSockets
    await ZeroTrustAuditEngine.record_decision_event(
        device_id=decision_obj["device_id"],
        packet_id=decision_obj["packet_id"],
        decision=decision_obj["decision"],
        overall_risk=decision_obj["overall_risk"],
        checks_passed=decision_obj["checks_passed"],
        checks_failed=decision_obj["checks_failed"],
        rationale=decision_obj["rationale"],
        step_breakdown=decision_obj["step_breakdown"]
    )

    return decision_obj

@router_m6.post("/authenticate")
async def authenticate_device_identity(req: AuthenticateRequest):
    """POST /api/zero-trust/authenticate: Authenticates device identity & HMAC signature."""
    try:
        res = ZeroTrustAuthEngine.authenticate_sender(req.device_id, req.payload or {}, req.hmac_token)
        return res
    except ZeroTrustAuthError as e:
        await ZeroTrustAuditEngine.record_security_event("Authentication Failed", "HIGH", req.device_id, str(e))
        raise HTTPException(status_code=401, detail=str(e))

@router_m6.post("/authorize")
async def authorize_role_command(req: AuthorizeRequest):
    """POST /api/zero-trust/authorize: Verifies RBAC permission matrix for role and command."""
    try:
        ZeroTrustAuthEngine.authorize_command(req.role, req.command_type, req.device_id)
        return {"status": "AUTHORIZED", "role": req.role, "command_type": req.command_type}
    except ZeroTrustAuthError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router_m6.post("/verify-hmac")
async def verify_hmac_signature(req: HMACVerifyRequest):
    """POST /api/zero-trust/verify-hmac: Constant-time HMAC-SHA256 signature verification."""
    is_valid = CryptoHashService.verify_hmac_sha256(req.secret_key, req.message, req.received_hmac)
    return {"status": "VALID" if is_valid else "INVALID", "is_valid": is_valid}

@router_m6.post("/verify-integrity")
async def verify_packet_integrity_endpoint(packet: dict):
    """POST /api/zero-trust/verify-integrity: SHA-256 fingerprint & structural integrity check."""
    return IntegrityVerificationEngine.verify_packet_integrity(packet)

@router_m6.post("/update-trust")
async def update_device_trust_score(req: UpdateTrustRequest):
    """POST /api/zero-trust/update-trust: Dynamic trust score update endpoint."""
    action = req.action.upper()
    if action == "PENALIZE":
        new_score = trust_engine.penalize_trust_score(req.device_id, req.incident_type or "Incident", req.points, req.reason or "Reason")
    elif action == "REWARD":
        new_score = trust_engine.reward_trust_score(req.device_id, req.points)
    elif action == "RESET":
        if req.device_id in ZERO_TRUST_IDENTITY_REGISTRY:
            ZERO_TRUST_IDENTITY_REGISTRY[req.device_id]["trust_score"] = 100.0
            ZERO_TRUST_IDENTITY_REGISTRY[req.device_id]["status"] = "ACTIVE"
            new_score = 100.0
        else:
            raise HTTPException(status_code=404, detail="Device not found.")
    else:
        raise HTTPException(status_code=400, detail="Invalid action.")

    t_info = trust_engine.get_trust_score(req.device_id)
    await ws_manager.broadcast("TRUST_UPDATED", t_info)
    return t_info

@router_m6.get("/trust-score/{device_id}")
async def get_device_trust_score(device_id: str):
    """GET /api/zero-trust/trust-score/{device_id}: Retrieve dynamic trust score."""
    return trust_engine.get_trust_score(device_id)

@router_m6.get("/devices")
async def get_zero_trust_devices():
    """GET /api/zero-trust/devices: Retrieve zero-trust registered device inventory."""
    return {"devices": ZERO_TRUST_IDENTITY_REGISTRY}

@router_m6.get("/metrics")
async def get_zero_trust_metrics():
    """GET /api/zero-trust/metrics: Operational & Zero-Trust security metrics."""
    return metrics_engine.get_snapshot()
