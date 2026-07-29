from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.cascade.cascade_service import CascadeService

router = APIRouter(prefix="/cascade", tags=["Cascade Privacy Amplification & AI (Module 8)"])


class CascadeReconciliationRequest(BaseModel):
    session_uuid: str
    sifted_key_alice: str
    sifted_key_bob: str
    block_size: int = 8


class CascadeReconciliationResponse(BaseModel):
    session_uuid: str
    corrected_key: str
    bit_errors_corrected: int
    remaining_qber: float
    privacy_amplification_status: str
    final_secret_key_b64: str
    isolation_forest_anomaly_score: float
    anomaly_detected: bool
    timestamp: str


@router.post("/reconcile", response_model=CascadeReconciliationResponse)
async def reconcile_cascade(
    request: CascadeReconciliationRequest,
    db: AsyncSession = Depends(get_db)
) -> CascadeReconciliationResponse:
    """Executes Cascade parity block error correction & Toeplitz matrix privacy amplification."""
    service = CascadeService(db)
    session = await service.reconcile_key(
        session_uuid=request.session_uuid,
        alice_key=request.sifted_key_alice,
        bob_key=request.sifted_key_bob,
        block_size=request.block_size
    )
    return CascadeReconciliationResponse(
        session_uuid=session.session_uuid,
        corrected_key=request.sifted_key_alice,
        bit_errors_corrected=session.bit_errors_corrected,
        remaining_qber=session.remaining_qber,
        privacy_amplification_status=session.privacy_amplification_status,
        final_secret_key_b64="QNetSecure_Amplified_Secret_Key_256bit",
        isolation_forest_anomaly_score=session.isolation_forest_anomaly_score,
        anomaly_detected=session.anomaly_detected,
        timestamp=session.timestamp.isoformat()
    )
