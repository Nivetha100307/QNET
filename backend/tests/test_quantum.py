import pytest
from unittest.mock import AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database.connection import get_db
from app.quantum.context import E91SessionContext
from app.quantum.engine import QuantumEngine
from app.services.quantum_service import QuantumService, InvalidQuantumExecutionStateError
from app.models.quantum_measurement import QuantumMeasurement
from app.models.session import QuantumSession, utc_now


@pytest.mark.asyncio
async def test_quantum_engine_execution():
    """Tests raw QuantumEngine execution with 64 shots."""
    engine = QuantumEngine(use_aer=True)
    context = E91SessionContext(session_uuid="test-uuid-1234", shots=64)
    result_context = engine.execute_e91_measurement(context)

    assert result_context.status == "COMPLETED"
    assert len(result_context.alice_basis) == 64
    assert len(result_context.bob_basis) == 64
    assert len(result_context.alice_bits) == 64
    assert len(result_context.bob_bits) == 64
    assert result_context.simulation_time_ms >= 0
    assert result_context.circuit_qasm is not None
    assert result_context.execution_backend in ("AerSimulator", "BasicSimulator")


@pytest.mark.asyncio
async def test_quantum_service_execution_mocked():
    """Tests QuantumService execution logic with mocked database session and repository."""
    db_mock = AsyncMock()
    service = QuantumService(db_mock)

    session_mock = QuantumSession(
        id=1,
        session_id="test-session-uuid-999",
        source_node="Substation_A",
        destination_node="Control_Center",
        status="READY",
        quantum_channel={},
        timeline=[]
    )

    service.session_repo.find_by_session_id = AsyncMock(return_value=session_mock)
    service.session_repo.update = AsyncMock(return_value=session_mock)
    service.measurement_repo.find_by_session_id = AsyncMock(return_value=None)

    saved_m = QuantumMeasurement(
        id=10,
        session_uuid="test-session-uuid-999",
        protocol_version="E91_v1",
        shots=100,
        bell_pair_count=100,
        alice_basis=["Z"] * 100,
        bob_basis=["Z"] * 100,
        alice_bits=[0] * 100,
        bob_bits=[0] * 100,
        measurement_status="COMPLETED",
        execution_backend="AerSimulator",
        simulation_time_ms=12.5,
        circuit_qasm="OPENQASM 2.0;",
        circuit_diagram="q_0: -H-M-"
    )
    service.measurement_repo.create = AsyncMock(return_value=saved_m)

    result = await service.execute_measurement("test-session-uuid-999", shots=100)

    assert result.session_uuid == "test-session-uuid-999"
    assert result.shots == 100
    assert result.measurement_status == "COMPLETED"


@pytest.mark.asyncio
async def test_quantum_service_terminated_session_error():
    """Verify executing measurement on a terminated session raises InvalidQuantumExecutionStateError."""
    db_mock = AsyncMock()
    service = QuantumService(db_mock)

    terminated_session = QuantumSession(
        session_id="term-uuid-000",
        status="TERMINATED"
    )
    service.session_repo.find_by_session_id = AsyncMock(return_value=terminated_session)

    with pytest.raises(InvalidQuantumExecutionStateError):
        await service.execute_measurement("term-uuid-000", shots=50)


@pytest.mark.asyncio
async def test_quantum_api_mocked_endpoints():
    """Tests FastAPI /api/v1/quantum routes with mocked DB session override."""
    db_mock = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    db_mock.execute = AsyncMock(return_value=mock_result)

    async def override_get_db():
        yield db_mock

    app.dependency_overrides[get_db] = override_get_db

    try:
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            resp = await ac.get("/api/v1/quantum/measurement/non-existent-uuid")
            assert resp.status_code == 404
    finally:
        app.dependency_overrides.clear()
