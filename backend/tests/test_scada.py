import pytest
from unittest.mock import AsyncMock
from app.scada.scada_service import SCADAService, SCADAExecutionError
from app.models.session import QuantumSession
from app.models.quantum_key import QuantumKey


@pytest.mark.asyncio
async def test_scada_encryption_and_send():
    db_mock = AsyncMock()
    service = SCADAService(db_mock)

    session_mock = QuantumSession(
        session_id="active-scada-100",
        status="ACTIVE",
        source_node="Substation_A",
        destination_node="Control_Center",
        message_count=5,
        bytes_transferred=1024
    )
    key_mock = QuantumKey(
        session_uuid="active-scada-100",
        shared_key="110101011010"
    )

    service.session_repo.find_by_session_id = AsyncMock(return_value=session_mock)
    service.session_repo.update = AsyncMock(return_value=session_mock)
    service.key_repo.find_by_session = AsyncMock(return_value=key_mock)

    packet = await service.send_command(
        session_uuid="active-scada-100",
        source_node="Substation_A",
        destination_node="Control_Center",
        command="TRIP_BREAKER",
        parameters={"voltage_kV": 132.5}
    )

    assert packet.session_uuid == "active-scada-100"
    assert packet.command == "TRIP_BREAKER"
    assert packet.execution_status == "EXECUTED"
    assert packet.ciphertext_b64 is not None
    assert packet.hmac_signature is not None
