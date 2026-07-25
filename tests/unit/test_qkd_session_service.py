"""Unit tests for the QKDSessionService application layer orchestrator."""

from typing import List, Optional
from uuid import UUID, uuid4
import pytest

from app.domain.entities.qkd_session import QKDResult, SessionStatus
from app.domain.interfaces.qkd_event_publisher import IQKDEventPublisher
from app.domain.interfaces.qkd_protocol import IQKDProtocol
from app.domain.interfaces.qkd_repository import IQKDSessionRepository
from app.services.qkd_session_service import QKDSessionService


class MockGenericProtocol(IQKDProtocol):
    """Mock protocol implementing IQKDProtocol without depending on E91Protocol."""

    def __init__(self, should_fail: bool = False, status: SessionStatus = SessionStatus.COMPLETED) -> None:
        self.should_fail = should_fail
        self.status = status
        self.called_with_bits: Optional[int] = None

    def run(self, num_bits: int) -> QKDResult:
        self.called_with_bits = num_bits
        if self.should_fail:
            raise RuntimeError("Quantum channel simulation fault")

        return QKDResult(
            session_id=uuid4(),
            raw_key_length=num_bits,
            sifted_key=[1, 0] * (num_bits // 2),
            qber=0.01,
            chsh_value=2.80,
            eavesdropping_detected=(self.status == SessionStatus.ABORTED_EAVESDROPPING),
            status=self.status,
        )


class MockRepository(IQKDSessionRepository):
    """Mock in-memory repository."""

    def __init__(self) -> None:
        self.saved_sessions: List[QKDResult] = []

    def save_session(self, session: QKDResult) -> None:
        self.saved_sessions.append(session)

    def get_session(self, session_id: UUID | str) -> Optional[QKDResult]:
        sid_str = str(session_id)
        for s in self.saved_sessions:
            if str(s.session_id) == sid_str:
                return s
        return None

    def list_sessions(self, limit: int = 100, offset: int = 0) -> List[QKDResult]:
        return self.saved_sessions[offset : offset + limit]


class MockEventPublisher(IQKDEventPublisher):
    """Mock event publisher."""

    def __init__(self) -> None:
        self.started_events: List[tuple] = []
        self.completed_events: List[QKDResult] = []
        self.failed_events: List[tuple] = []

    def publish_session_started(self, session_id: str, num_bits: int) -> None:
        self.started_events.append((session_id, num_bits))

    def publish_session_completed(self, session: QKDResult) -> None:
        self.completed_events.append(session)

    def publish_session_failed(self, session: QKDResult, reason: str) -> None:
        self.failed_events.append((session, reason))


def test_successful_session_execution():
    mock_protocol = MockGenericProtocol()
    mock_repo = MockRepository()
    mock_pub = MockEventPublisher()

    service = QKDSessionService(
        protocol=mock_protocol,
        repository=mock_repo,
        event_publisher=mock_pub,
    )

    result = service.start_session(num_bits=64)

    assert isinstance(result, QKDResult)
    assert result.status == SessionStatus.COMPLETED
    assert result.raw_key_length == 64
    assert mock_protocol.called_with_bits == 64

    # Verify repository saved session
    assert len(mock_repo.saved_sessions) == 1
    assert mock_repo.saved_sessions[0] == result

    # Verify event publisher received lifecycle events
    assert len(mock_pub.started_events) == 1
    assert len(mock_pub.completed_events) == 1
    assert len(mock_pub.failed_events) == 0


def test_protocol_failure_and_event_publishing():
    mock_protocol = MockGenericProtocol(should_fail=True)
    mock_repo = MockRepository()
    mock_pub = MockEventPublisher()

    service = QKDSessionService(
        protocol=mock_protocol,
        repository=mock_repo,
        event_publisher=mock_pub,
    )

    with pytest.raises(RuntimeError, match="Quantum channel simulation fault"):
        service.start_session(num_bits=32)

    assert len(mock_pub.started_events) == 1
    assert len(mock_pub.completed_events) == 0
    assert len(mock_pub.failed_events) == 1
    assert "Quantum channel simulation fault" in mock_pub.failed_events[0][1]


def test_no_dependency_on_concrete_e91_protocol():
    """Verify service operates with any abstract IQKDProtocol implementation."""
    mock_protocol = MockGenericProtocol(status=SessionStatus.ABORTED_EAVESDROPPING)
    service = QKDSessionService(protocol=mock_protocol)

    result = service.start_session(num_bits=128)

    assert isinstance(result, QKDResult)
    assert result.status == SessionStatus.ABORTED_EAVESDROPPING
    assert result.eavesdropping_detected is True


def test_null_protocol_raises_type_error():
    with pytest.raises(TypeError, match="protocol dependency cannot be None"):
        QKDSessionService(protocol=None)


def test_invalid_num_bits_raises_value_error():
    mock_protocol = MockGenericProtocol()
    service = QKDSessionService(protocol=mock_protocol)

    with pytest.raises(ValueError, match="num_bits must be at least 1"):
        service.start_session(num_bits=0)
