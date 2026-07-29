import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import QuantumSession, utc_now
from app.repositories.session_repository import SessionRepository
from app.schemas.session import (
    SessionCreateRequest,
    QuantumChannelProperties,
    ClassicalChannelProperties,
)
from app.common.enums import SessionStatus
from app.common.event_types import WSEventType
from app.core.state_machine import SessionStateMachine, InvalidStateTransitionError
from app.core.logging_config import log_session_event, logger
from app.core.websocket_manager import ws_manager


class DuplicateActiveSessionError(ValueError):
    """Raised when an active session already exists between the requested nodes."""
    pass


class SessionNotFoundError(ValueError):
    """Raised when a requested session is not found."""
    pass


class SessionService:
    """Service layer handling quantum SCADA session lifecycle operations."""

    def __init__(self, db: AsyncSession) -> None:
        self.repository = SessionRepository(db)

    def _create_timeline_event(self, event_name: str, status: str, details: str = "") -> Dict[str, Any]:
        """Creates a timestamped event dictionary for timeline log."""
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": event_name,
            "status": status,
            "details": details
        }

    async def create_session(self, request: SessionCreateRequest) -> QuantumSession:
        """Initializes a new secure quantum session between two SCADA nodes."""
        if request.source_node.value == request.destination_node.value:
            raise ValueError("Destination node cannot be identical to source node.")

        existing = await self.repository.find_active_between_nodes(
            request.source_node.value, 
            request.destination_node.value
        )
        if existing:
            raise DuplicateActiveSessionError(
                f"An active session ({existing.session_id}) already exists between "
                f"'{request.source_node.value}' and '{request.destination_node.value}'."
            )

        session_id = str(uuid.uuid4())
        
        quantum_channel = QuantumChannelProperties().model_dump()
        classical_channel = ClassicalChannelProperties().model_dump()
        
        node_status = {
            request.source_node.value: "HEALTHY",
            request.destination_node.value: "HEALTHY"
        }
        
        route = [request.source_node.value, request.destination_node.value]
        
        timeline = [
            self._create_timeline_event(WSEventType.SESSION_CREATED.value, SessionStatus.INITIALIZING.value, "Session initialized"),
            self._create_timeline_event("QUANTUM_CHANNEL_INITIALIZED", SessionStatus.INITIALIZING.value, "Quantum channel status: CONNECTED"),
            self._create_timeline_event("CLASSICAL_CHANNEL_INITIALIZED", SessionStatus.INITIALIZING.value, "Classical channel status: CONNECTED"),
        ]

        # Initial FSM state: IDLE -> INITIALIZING -> READY
        SessionStateMachine.validate_transition(SessionStatus.IDLE, SessionStatus.INITIALIZING)
        SessionStateMachine.validate_transition(SessionStatus.INITIALIZING, SessionStatus.READY)

        timeline.append(self._create_timeline_event(WSEventType.SESSION_READY.value, SessionStatus.READY.value, "Session ready for key distribution"))

        session = QuantumSession(
            session_id=session_id,
            source_node=request.source_node.value,
            destination_node=request.destination_node.value,
            protocol=request.protocol.value,
            session_type=request.session_type.value,
            status=SessionStatus.READY.value,
            route=route,
            quantum_channel=quantum_channel,
            classical_channel=classical_channel,
            node_status=node_status,
            message_count=0,
            bytes_transferred=0,
            timeline=timeline,
            created_at=utc_now(),
            updated_at=utc_now()
        )

        created_session = await self.repository.create(session)

        log_session_event(
            session_id=session.session_id,
            source=session.source_node,
            destination=session.destination_node,
            state=session.status,
            message="Session successfully initialized and transition to READY"
        )

        payload = {
            "session_id": created_session.session_id,
            "source_node": created_session.source_node,
            "destination_node": created_session.destination_node,
            "protocol": created_session.protocol,
            "status": created_session.status
        }
        
        await ws_manager.broadcast(WSEventType.SESSION_CREATED.value, payload)
        await ws_manager.broadcast(WSEventType.CHANNEL_CONNECTED.value, {"session_id": session_id, "channel": "quantum"})
        await ws_manager.broadcast(WSEventType.CHANNEL_CONNECTED.value, {"session_id": session_id, "channel": "classical"})
        await ws_manager.broadcast(WSEventType.SESSION_READY.value, payload)

        return created_session

    async def activate_session(self, session_id: str) -> QuantumSession:
        """Transitions a session from READY to ACTIVE status."""
        session = await self.repository.find_by_session_id(session_id)
        if not session:
            raise SessionNotFoundError(f"Session '{session_id}' not found.")

        current_status = SessionStatus(session.status)
        SessionStateMachine.validate_transition(current_status, SessionStatus.ACTIVE)

        session.status = SessionStatus.ACTIVE.value
        session.updated_at = utc_now()
        
        timeline_list = list(session.timeline)
        timeline_list.append(self._create_timeline_event(WSEventType.SESSION_ACTIVATED.value, SessionStatus.ACTIVE.value, "Session activated"))
        session.timeline = timeline_list

        updated_session = await self.repository.update(session)

        log_session_event(
            session_id=session.session_id,
            source=session.source_node,
            destination=session.destination_node,
            state=session.status,
            message="Session status updated to ACTIVE"
        )

        await ws_manager.broadcast(WSEventType.SESSION_ACTIVATED.value, {
            "session_id": session.session_id,
            "status": session.status
        })

        return updated_session

    async def terminate_session(self, session_id: str) -> QuantumSession:
        """Terminates an existing active or ready session."""
        session = await self.repository.find_by_session_id(session_id)
        if not session:
            raise SessionNotFoundError(f"Session '{session_id}' not found.")

        current_status = SessionStatus(session.status)
        SessionStateMachine.validate_transition(current_status, SessionStatus.TERMINATED)

        session.status = SessionStatus.TERMINATED.value
        session.ended_at = utc_now()
        session.updated_at = utc_now()

        timeline_list = list(session.timeline)
        timeline_list.append(self._create_timeline_event(WSEventType.SESSION_TERMINATED.value, SessionStatus.TERMINATED.value, "Session explicitly terminated"))
        session.timeline = timeline_list

        updated_session = await self.repository.update(session)

        log_session_event(
            session_id=session.session_id,
            source=session.source_node,
            destination=session.destination_node,
            state=session.status,
            message="Session state updated to TERMINATED"
        )

        await ws_manager.broadcast(WSEventType.SESSION_TERMINATED.value, {
            "session_id": session.session_id,
            "status": session.status
        })

        return updated_session

    async def get_session(self, session_id: str) -> QuantumSession:
        """Retrieves a session by UUID."""
        session = await self.repository.find_by_session_id(session_id)
        if not session:
            raise SessionNotFoundError(f"Session '{session_id}' not found.")
        return session

    async def list_sessions(self) -> List[QuantumSession]:
        """Retrieves all sessions."""
        return await self.repository.find_all()
