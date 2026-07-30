from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.services.session_service import (
    SessionService, 
    DuplicateActiveSessionError, 
    SessionNotFoundError
)
from app.core.state_machine import InvalidStateTransitionError
from app.schemas.session import (
    SessionCreateRequest,
    SessionActivateRequest,
    EndSessionRequest,
    SessionResponse,
    SessionStatusResponse
)

router = APIRouter(prefix="/session", tags=["Quantum Session Initialization"])


def get_session_service(db: AsyncSession = Depends(get_db)) -> SessionService:
    """Dependency injection helper delivering SessionService instance."""
    return SessionService(db)


@router.post("/start", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(
    request: SessionCreateRequest,
    service: SessionService = Depends(get_session_service)
) -> SessionResponse:
    """Initializes a new secure SCADA quantum communication session.

    Prepares Source/Destination nodes, protocol, quantum & classical channels,
    and transitions session FSM state to READY.
    """
    try:
        session = await service.create_session(request)
        from app.services.audit_service import audit_service
        await audit_service.log_event(
            module_id="MODULE_1_SESSION",
            action="SESSION_CREATED",
            severity="INFO",
            session_uuid=session.session_id,
            source_node=session.source_node,
            destination_node=session.destination_node,
            details={"protocol": session.protocol, "session_type": session.session_type, "status": session.status}
        )
        return SessionResponse.model_validate(session)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except DuplicateActiveSessionError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to start session: {str(e)}")


@router.post("/activate", response_model=SessionResponse)
async def activate_session(
    request: SessionActivateRequest,
    service: SessionService = Depends(get_session_service)
) -> SessionResponse:
    """Activates a READY quantum session for operational communication."""
    try:
        session = await service.activate_session(request.session_id)
        return SessionResponse.model_validate(session)
    except SessionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except InvalidStateTransitionError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to activate session: {str(e)}")


@router.post("/end", response_model=SessionResponse)
async def end_session(
    request: EndSessionRequest,
    service: SessionService = Depends(get_session_service)
) -> SessionResponse:
    """Terminates an active or ready quantum communication session."""
    try:
        session = await service.terminate_session(request.session_id)
        return SessionResponse.model_validate(session)
    except SessionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except InvalidStateTransitionError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to end session: {str(e)}")


@router.post("/end_all", response_model=List[SessionResponse])
async def end_all_sessions(
    service: SessionService = Depends(get_session_service)
) -> List[SessionResponse]:
    """Terminates ALL active, ready, or initializing quantum communication sessions globally."""
    try:
        terminated_sessions = await service.terminate_all_sessions()
        return [SessionResponse.model_validate(s) for s in terminated_sessions]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to terminate all sessions: {str(e)}")


@router.get("/list", response_model=List[SessionResponse])
async def list_sessions(
    service: SessionService = Depends(get_session_service)
) -> List[SessionResponse]:
    """Lists all initialized quantum communication sessions."""
    sessions = await service.list_sessions()
    return [SessionResponse.model_validate(s) for s in sessions]


@router.get("/status/{session_id}", response_model=SessionStatusResponse)
async def get_session_status(
    session_id: str,
    service: SessionService = Depends(get_session_service)
) -> SessionStatusResponse:
    """Fetches lightweight status summary for a specific session."""
    try:
        session = await service.get_session(session_id)
        quantum_status = session.quantum_channel.get("status", "UNKNOWN") if isinstance(session.quantum_channel, dict) else "UNKNOWN"
        classical_status = session.classical_channel.get("status", "UNKNOWN") if isinstance(session.classical_channel, dict) else "UNKNOWN"

        return SessionStatusResponse(
            session_id=session.session_id,
            status=session.status,
            source_node=session.source_node,
            destination_node=session.destination_node,
            protocol=session.protocol,
            quantum_channel_status=quantum_status,
            classical_channel_status=classical_status
        )
    except SessionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    service: SessionService = Depends(get_session_service)
) -> SessionResponse:
    """Fetches full details of a specific quantum session by UUID."""
    try:
        session = await service.get_session(session_id)
        return SessionResponse.model_validate(session)
    except SessionNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
