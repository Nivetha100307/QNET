from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.schemas.security import (
    SecurityAnalysisRequest,
    SecurityAnalysisResponse,
    SecurityStatusResponse,
    SecurityMetricsResponse
)
from app.security.security_service import (
    SecurityService,
    SecurityAnalysisError,
    SecurityReportNotFoundError
)

router = APIRouter(prefix="/security", tags=["Quantum Security Monitor (Module 4)"])


@router.post("/analyze", response_model=SecurityAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_quantum_security(
    request: SecurityAnalysisRequest,
    db: AsyncSession = Depends(get_db)
) -> SecurityAnalysisResponse:
    """Executes Bell correlation, CHSH, QBER, Fidelity, and Security Decision evaluation for an active session.

    Args:
        request (SecurityAnalysisRequest): Request body containing session_uuid.
        db (AsyncSession): Database session dependency.

    Returns:
        SecurityAnalysisResponse: Complete security evaluation report payload.
    """
    service = SecurityService(db)
    try:
        report = await service.analyze_security(request.session_uuid)
        return SecurityAnalysisResponse(
            session_uuid=report.session_uuid,
            bell_test_result=report.bell_test_result,
            chsh_value=report.chsh_value,
            qber=report.qber,
            fidelity=report.fidelity,
            security_score=report.security_score,
            security_status=report.security_status,
            measurement_count=report.measurement_count,
            analysis_time_ms=report.analysis_time_ms,
            bell_correlations=report.bell_correlations or {},
            report_timestamp=report.report_timestamp
        )
    except SecurityAnalysisError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Security analysis execution error: {str(e)}"
        )


@router.get("/{session_uuid}", response_model=SecurityAnalysisResponse)
async def get_security_report(
    session_uuid: str,
    db: AsyncSession = Depends(get_db)
) -> SecurityAnalysisResponse:
    """Retrieves full persisted quantum security report for a session.

    Args:
        session_uuid (str): Session UUID string.
        db (AsyncSession): Database session.

    Returns:
        SecurityAnalysisResponse: Full security report payload.
    """
    service = SecurityService(db)
    try:
        report = await service.get_report(session_uuid)
        return SecurityAnalysisResponse(
            session_uuid=report.session_uuid,
            bell_test_result=report.bell_test_result,
            chsh_value=report.chsh_value,
            qber=report.qber,
            fidelity=report.fidelity,
            security_score=report.security_score,
            security_status=report.security_status,
            measurement_count=report.measurement_count,
            analysis_time_ms=report.analysis_time_ms,
            bell_correlations=report.bell_correlations or {},
            report_timestamp=report.report_timestamp
        )
    except SecurityReportNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/status/{session_uuid}", response_model=SecurityStatusResponse)
async def get_security_status(
    session_uuid: str,
    db: AsyncSession = Depends(get_db)
) -> SecurityStatusResponse:
    """Retrieves lightweight security status and score overview for a session.

    Args:
        session_uuid (str): Session UUID string.
        db (AsyncSession): Database session.

    Returns:
        SecurityStatusResponse: Session UUID, status, score, CHSH, and QBER.
    """
    service = SecurityService(db)
    try:
        report = await service.get_report(session_uuid)
        return SecurityStatusResponse(
            session_uuid=report.session_uuid,
            security_status=report.security_status,
            security_score=report.security_score,
            chsh_value=report.chsh_value,
            qber=report.qber
        )
    except SecurityReportNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
