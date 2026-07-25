"""Unit tests for the QKD REST API endpoints in app/api/v1/endpoints/qkd_session.py."""

from typing import List, Optional
from uuid import UUID, uuid4
import pytest
from fastapi.testclient import TestClient

from app.api.v1.endpoints.qkd_session import get_qkd_session_service
from app.domain.entities.qkd_session import QKDResult, SessionStatus
from app.main import app


class MockServiceForAPI:
    """Mock QKDSessionService for API layer unit tests."""

    def __init__(self) -> None:
        self.mock_session_id = uuid4()
        self.sessions: List[QKDResult] = [
            QKDResult(
                session_id=self.mock_session_id,
                raw_key_length=128,
                sifted_key=[1, 0] * 64,
                qber=0.0,
                chsh_value=2.828,
                eavesdropping_detected=False,
                status=SessionStatus.COMPLETED,
            )
        ]

    def start_session(self, num_bits: int = 128, session_id: Optional[str] = None) -> QKDResult:
        sid = UUID(session_id) if session_id else uuid4()
        res = QKDResult(
            session_id=sid,
            raw_key_length=num_bits,
            sifted_key=[1, 0] * (num_bits // 2),
            qber=0.0,
            chsh_value=2.828,
            eavesdropping_detected=False,
            status=SessionStatus.COMPLETED,
        )
        self.sessions.append(res)
        return res

    def get_session(self, session_id: UUID | str) -> Optional[QKDResult]:
        sid_str = str(session_id)
        for s in self.sessions:
            if str(s.session_id) == sid_str:
                return s
        return None

    def list_sessions(self, limit: int = 100, offset: int = 0) -> List[QKDResult]:
        return self.sessions[offset : offset + limit]


@pytest.fixture
def mock_api_client():
    mock_service = MockServiceForAPI()
    app.dependency_overrides[get_qkd_session_service] = lambda: mock_service
    client = TestClient(app)
    yield client, mock_service
    app.dependency_overrides.clear()


def test_post_create_session_success(mock_api_client):
    client, mock_service = mock_api_client

    response = client.post("/api/v1/qkd/sessions", json={"num_bits": 128})

    assert response.status_code == 201
    body = response.json()
    assert "session_id" in body
    assert body["status"] == "completed"
    assert body["raw_key_length"] == 128
    assert body["qber"] == 0.0
    assert body["bell_parameter"] == 2.828
    assert body["eavesdropping_detected"] is False


def test_get_session_by_id_success(mock_api_client):
    client, mock_service = mock_api_client
    target_id = str(mock_service.mock_session_id)

    response = client.get(f"/api/v1/qkd/sessions/{target_id}")

    assert response.status_code == 200
    body = response.json()
    assert body["session_id"] == target_id
    assert body["status"] == "completed"


def test_get_session_by_id_not_found(mock_api_client):
    client, mock_service = mock_api_client
    fake_id = str(uuid4())

    response = client.get(f"/api/v1/qkd/sessions/{fake_id}")

    assert response.status_code == 404
    assert f"QKD session with ID '{fake_id}' not found" in response.json()["detail"]


def test_list_sessions_success(mock_api_client):
    client, mock_service = mock_api_client

    response = client.get("/api/v1/qkd/sessions?limit=10&offset=0")

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == len(mock_service.sessions)
    assert body["limit"] == 10
    assert body["offset"] == 0
    assert isinstance(body["sessions"], list)


def test_post_validation_error_invalid_num_bits(mock_api_client):
    client, mock_service = mock_api_client

    # Less than 1
    res1 = client.post("/api/v1/qkd/sessions", json={"num_bits": 0})
    assert res1.status_code == 422

    # Exceeds max 8192
    res2 = client.post("/api/v1/qkd/sessions", json={"num_bits": 99999})
    assert res2.status_code == 422
