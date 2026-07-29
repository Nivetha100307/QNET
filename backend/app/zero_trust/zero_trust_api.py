from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.zero_trust.zero_trust_service import ZeroTrustService

router = APIRouter(tags=["Zero Trust & Attack Simulator (Module 6)"])


class ZeroTrustVerificationRequest(BaseModel):
    session_uuid: str
    packet_id: str
    source_node: str
    command: str
    hmac_signature: str
    nonce: str
    sequence_number: int


class ZeroTrustVerificationResponse(BaseModel):
    decision: str
    trust_score: float
    risk_level: str
    checks_passed: int
    total_checks: int = 20
    failed_checks: List[str]
    rationale: Dict[str, Any]
    timestamp: str


class AttackSimulationRequest(BaseModel):
    session_uuid: str
    attack_type: str
    intensity: float = 1.0


class AttackSimulationResponse(BaseModel):
    attack_id: str
    session_uuid: str
    attack_type: str
    detected: bool
    mitigation_action: str
    trust_score_impact: float
    details: str
    timestamp: str


@router.post("/zero-trust/verify", response_model=ZeroTrustVerificationResponse)
async def verify_zero_trust(
    request: ZeroTrustVerificationRequest,
    db: AsyncSession = Depends(get_db)
) -> ZeroTrustVerificationResponse:
    """Executes 20-stage zero-trust security pipeline on a SCADA command packet."""
    service = ZeroTrustService(db)
    log = await service.verify_packet(
        session_uuid=request.session_uuid,
        packet_id=request.packet_id,
        source_node=request.source_node,
        command=request.command,
        hmac_signature=request.hmac_signature,
        nonce=request.nonce,
        sequence_number=request.sequence_number
    )
    return ZeroTrustVerificationResponse(
        decision=log.decision,
        trust_score=log.trust_score,
        risk_level=log.risk_level,
        checks_passed=log.checks_passed,
        total_checks=20,
        failed_checks=log.failed_checks or [],
        rationale=log.rationale or {},
        timestamp=log.timestamp.isoformat()
    )


@router.post("/attacks/simulate", response_model=AttackSimulationResponse)
async def simulate_attack(
    request: AttackSimulationRequest,
    db: AsyncSession = Depends(get_db)
) -> AttackSimulationResponse:
    """Simulates quantum or classical network attacks to test zero-trust defenses."""
    service = ZeroTrustService(db)
    res = await service.simulate_attack(
        session_uuid=request.session_uuid,
        attack_type=request.attack_type,
        intensity=request.intensity
    )
    return AttackSimulationResponse(**res)
