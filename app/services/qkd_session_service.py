"""Application Layer Service: QKDSessionService.

Coordinates end-to-end QKD session execution by delegating to the `IQKDProtocol` port,
persisting outcomes to `IQKDSessionRepository` (if provided), and publishing real-time
session events to `IQKDEventPublisher` (if provided).
"""

from typing import List, Optional
from uuid import UUID, uuid4

from app.domain.entities.qkd_session import QKDResult, SessionStatus
from app.domain.interfaces.qkd_event_publisher import IQKDEventPublisher
from app.domain.interfaces.qkd_protocol import IQKDProtocol
from app.domain.interfaces.qkd_repository import IQKDSessionRepository


class QKDSessionService:
    """Use-case orchestrator for running and managing QKD sessions."""

    def __init__(
        self,
        protocol: IQKDProtocol,
        repository: Optional[IQKDSessionRepository] = None,
        event_publisher: Optional[IQKDEventPublisher] = None,
    ) -> None:
        """Initialize QKDSessionService with injected dependencies.

        Args:
            protocol: An implementation of the IQKDProtocol domain interface.
            repository: Optional repository port for persisting QKD session results.
            event_publisher: Optional event publisher port for streaming live session events.

        Raises:
            TypeError: If protocol is None.
        """
        if protocol is None:
            raise TypeError("protocol dependency cannot be None.")

        self._protocol = protocol
        self._repository = repository
        self._event_publisher = event_publisher

    def start_session(
        self, num_bits: int = 128, session_id: Optional[str] = None
    ) -> QKDResult:
        """Start and execute a QKD session end-to-end.

        Workflow:
            1. Generate or validate unique session ID.
            2. Publish 'session started' event (if publisher exists).
            3. Invoke protocol.run(num_bits).
            4. Convert outcome to domain QKDResult.
            5. Persist result in repository (if repository exists).
            6. Publish completed/failed events (if publisher exists).
            7. Return domain QKDResult.

        Args:
            num_bits: Number of target key bits to request (default: 128).
            session_id: Optional custom session ID string.

        Returns:
            QKDResult: Domain entity representing the session outcome.

        Raises:
            ValueError: If num_bits < 1.
        """
        if num_bits < 1:
            raise ValueError(f"num_bits must be at least 1, got {num_bits}.")

        sid_str = session_id or str(uuid4())

        # 1. Publish session started event
        if self._event_publisher is not None:
            try:
                self._event_publisher.publish_session_started(
                    session_id=sid_str, num_bits=num_bits
                )
            except Exception:
                pass

        # 2. Invoke IQKDProtocol.run()
        try:
            protocol_outcome = self._protocol.run(num_bits=num_bits)

            # Convert protocol_outcome to QKDResult
            if hasattr(protocol_outcome, "to_qkd_result"):
                qkd_result = protocol_outcome.to_qkd_result()
            elif isinstance(protocol_outcome, QKDResult):
                qkd_result = protocol_outcome
            else:
                raise TypeError(
                    f"Unexpected protocol return type: {type(protocol_outcome)}"
                )

            # Ensure session_id matches if a custom session_id was requested
            try:
                parsed_uuid = UUID(sid_str)
                qkd_result.session_id = parsed_uuid
            except (ValueError, TypeError, AttributeError):
                pass

        except Exception as exc:
            # Handle protocol level exception failure
            qkd_result = QKDResult(
                session_id=UUID(sid_str) if self._is_valid_uuid(sid_str) else uuid4(),
                status=SessionStatus.FAILED,
                eavesdropping_detected=False,
            )
            if self._event_publisher is not None:
                try:
                    self._event_publisher.publish_session_failed(
                        session=qkd_result, reason=str(exc)
                    )
                except Exception:
                    pass
            raise

        # 3. Persist in repository
        if self._repository is not None:
            try:
                self._repository.save_session(qkd_result)
            except Exception:
                pass

        # 4. Publish completion or failure event
        if self._event_publisher is not None:
            try:
                if qkd_result.status == SessionStatus.COMPLETED:
                    self._event_publisher.publish_session_completed(qkd_result)
                else:
                    self._event_publisher.publish_session_failed(
                        session=qkd_result,
                        reason=f"Session status: {qkd_result.status.value}",
                    )
            except Exception:
                pass

        return qkd_result

    def run_session(self, num_bits: int = 128) -> QKDResult:
        """Convenience method for running a session."""
        return self.start_session(num_bits=num_bits)

    def get_session(self, session_id: UUID | str) -> Optional[QKDResult]:
        """Fetch session by ID from the repository."""
        if self._repository is None:
            return None
        return self._repository.get_session(session_id)

    def list_sessions(self, limit: int = 100, offset: int = 0) -> List[QKDResult]:
        """List sessions from the repository."""
        if self._repository is None:
            return []
        return self._repository.list_sessions(limit=limit, offset=offset)

    @staticmethod
    def _is_valid_uuid(val: str) -> bool:
        try:
            UUID(val)
            return True
        except (ValueError, TypeError):
            return False
