"""FastAPI REST API router for QKD Session management."""

from functools import lru_cache
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.domain.entities.qkd_session import QKDResult
from app.quantum.e91.e91_protocol import E91Protocol
from app.schemas.qkd import QKDSessionRequest, QKDSessionResponse, SessionListResponse
from app.services.qkd_session_service import QKDSessionService

router = APIRouter(prefix="/qkd/sessions", tags=["qkd_sessions"])


from app.dependencies import get_qkd_session_service


def map_to_session_response(domain_res: QKDResult) -> QKDSessionResponse:
    """Helper mapping domain entity QKDResult to API response schema QKDSessionResponse."""
    status_str = (
        domain_res.status.value
        if hasattr(domain_res.status, "value")
        else str(domain_res.status)
    )
    created_at_str = (
        domain_res.created_at.isoformat()
        if hasattr(domain_res.created_at, "isoformat")
        else str(domain_res.created_at)
    )

    return QKDSessionResponse(
        session_id=str(domain_res.session_id),
        status=status_str,
        raw_key_length=domain_res.raw_key_length,
        qber=domain_res.qber,
        bell_parameter=domain_res.chsh_value,
        eavesdropping_detected=domain_res.eavesdropping_detected,
        created_at=created_at_str,
    )


@router.post(
    "",
    response_model=QKDSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start a new QKD session",
    description=(
        "Executes a Quantum Key Distribution session end-to-end by invoking QKDSessionService. "
        "Performs Bell pair generation, basis selection, circuit measurement, CHSH verification, "
        "key sifting, QBER calculation, and shared secret key generation."
    ),
)
async def create_qkd_session(
    request: QKDSessionRequest,
    service: QKDSessionService = Depends(get_qkd_session_service),
) -> QKDSessionResponse:
    """POST /api/v1/qkd/sessions - Initiate a new QKD session."""
    try:
        domain_res = service.start_session(
            num_bits=request.num_bits,
            enable_eve=request.enable_eve,
            channel_noise=request.channel_noise,
            backend_name=request.backend_name,
        )
        return map_to_session_response(domain_res)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected server error occurred during QKD session execution: {exc}",
        ) from exc


@router.get(
    "/{session_id}",
    response_model=QKDSessionResponse,
    summary="Retrieve a QKD session by ID",
    description="Fetches the details and execution outcome of a previously recorded QKD session.",
)
async def get_qkd_session(
    session_id: str,
    service: QKDSessionService = Depends(get_qkd_session_service),
) -> QKDSessionResponse:
    """GET /api/v1/qkd/sessions/{session_id} - Fetch a single QKD session."""
    try:
        domain_res = service.get_session(session_id)
        if domain_res is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"QKD session with ID '{session_id}' not found.",
            )
        return map_to_session_response(domain_res)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while fetching session: {exc}",
        ) from exc


@router.get(
    "",
    response_model=SessionListResponse,
    summary="List QKD sessions",
    description="Retrieves a list of previously executed QKD sessions with pagination options.",
)
async def list_qkd_sessions(
    limit: int = Query(default=100, ge=1, le=1000, description="Max records to return"),
    offset: int = Query(default=0, ge=0, description="Offset starting index"),
    service: QKDSessionService = Depends(get_qkd_session_service),
) -> SessionListResponse:
    """GET /api/v1/qkd/sessions - List QKD sessions with pagination."""
    try:
        domain_sessions = service.list_sessions(limit=limit, offset=offset)
        mapped_sessions = [map_to_session_response(s) for s in domain_sessions]
        return SessionListResponse(
            total=len(mapped_sessions),
            limit=limit,
            offset=offset,
            sessions=mapped_sessions,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while listing sessions: {exc}",
        ) from exc
