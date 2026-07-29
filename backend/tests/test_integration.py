import pytest
from unittest.mock import AsyncMock, MagicMock
from app.schemas.session import SessionCreateRequest, NodeEnum, ProtocolEnum, SessionTypeEnum
from app.services.session_service import SessionService, DuplicateActiveSessionError
from app.models.session import QuantumSession, utc_now
from app.core.state_machine import SessionStatusEnum

@pytest.mark.asyncio
async def test_session_service_create_and_activate():
    """Tests session service creation and activation logic with repository mocks."""
    db_mock = AsyncMock()
    service = SessionService(db_mock)
    
    # Mock repository methods
    service.repository.find_active_between_nodes = AsyncMock(return_value=None)
    
    saved_session = QuantumSession(
        id=1,
        session_id="test-uuid-1234",
        source_node="Control_Center",
        destination_node="Substation_A",
        protocol="E91",
        session_type="SIMULATION",
        status="READY",
        route=["Control_Center", "Substation_A"],
        quantum_channel={"status": "CONNECTED", "latency_ms": 10},
        classical_channel={"status": "CONNECTED", "latency_ms": 5},
        node_status={"Control_Center": "HEALTHY", "Substation_A": "HEALTHY"},
        message_count=0,
        bytes_transferred=0,
        timeline=[],
        created_at=utc_now(),
        updated_at=utc_now()
    )
    
    service.repository.create = AsyncMock(return_value=saved_session)
    service.repository.find_by_session_id = AsyncMock(return_value=saved_session)
    service.repository.update = AsyncMock(return_value=saved_session)

    # 1. Create Session
    req = SessionCreateRequest(
        source_node=NodeEnum.CONTROL_CENTER,
        destination_node=NodeEnum.SUBSTATION_A,
        protocol=ProtocolEnum.E91,
        session_type=SessionTypeEnum.SIMULATION
    )
    
    created = await service.create_session(req)
    assert created.session_id == "test-uuid-1234"
    assert created.status == "READY"

    # 2. Activate Session
    activated = await service.activate_session("test-uuid-1234")
    assert activated.status == "ACTIVE"

    # 3. Terminate Session
    terminated = await service.terminate_session("test-uuid-1234")
    assert terminated.status == "TERMINATED"

@pytest.mark.asyncio
async def test_session_service_duplicate_active_error():
    """Verify service raises DuplicateActiveSessionError when an active session exists."""
    db_mock = AsyncMock()
    service = SessionService(db_mock)
    
    existing = QuantumSession(
        session_id="existing-session-uuid",
        source_node="Control_Center",
        destination_node="Substation_A",
        status="READY"
    )
    service.repository.find_active_between_nodes = AsyncMock(return_value=existing)

    req = SessionCreateRequest(
        source_node=NodeEnum.CONTROL_CENTER,
        destination_node=NodeEnum.SUBSTATION_A
    )

    with pytest.raises(DuplicateActiveSessionError):
        await service.create_session(req)
