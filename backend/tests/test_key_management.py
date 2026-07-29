import pytest
from unittest.mock import AsyncMock
from app.key_management.key_sifting import sift_bits, perform_key_sifting
from app.key_management.reconciliation import reconcile_bases
from app.key_management.key_generator import generate_shared_secret, KeyGeneratorError
from app.key_management.key_validator import validate_session_for_key_generation, KeyValidationException
from app.key_management.key_service import KeyService
from app.models.quantum_key import QuantumKey
from app.models.quantum_measurement import QuantumMeasurement
from app.models.session import QuantumSession, utc_now


def test_key_sifting_matching_bases():
    alice_bits  = [1, 0, 1, 1, 0]
    bob_bits    = [1, 1, 1, 0, 0]
    matching_idx = [0, 2, 4]

    alice_key, bob_key = perform_key_sifting(alice_bits, bob_bits, matching_idx)

    assert alice_key == "110"
    assert bob_key == "110"


def test_reconcile_bases():
    alice_basis = ["Z", "X", "Z", "W", "Z"]
    bob_basis   = ["Z", "Z", "Z", "X", "Z"]

    matching_idx = reconcile_bases(alice_basis, bob_basis)
    assert matching_idx == [0, 2, 4]


def test_generate_shared_secret():
    alice_key = "110101"
    bob_key = "110101"
    shared = generate_shared_secret(alice_key, bob_key)
    assert shared == "110101"

    with pytest.raises(KeyGeneratorError):
        generate_shared_secret("", "")


def test_key_validator_session_state():
    active_session = QuantumSession(session_id="active-123", status="ACTIVE")
    validate_session_for_key_generation(active_session)

    ready_session = QuantumSession(session_id="ready-123", status="READY")
    with pytest.raises(KeyValidationException):
        validate_session_for_key_generation(ready_session)


@pytest.mark.asyncio
async def test_key_service_generate_key():
    db_mock = AsyncMock()
    service = KeyService(db_mock)

    session_mock = QuantumSession(
        id=1,
        session_id="active-uuid-100",
        status="ACTIVE",
        timeline=[],
        classical_channel={}
    )
    measurement_mock = QuantumMeasurement(
        id=1,
        session_uuid="active-uuid-100",
        alice_basis=["Z", "X", "Z", "W"],
        bob_basis=["Z", "Z", "Z", "W"],
        alice_bits=[1, 0, 1, 0],
        bob_bits=[1, 1, 1, 0]
    )
    saved_key = QuantumKey(
        id=1,
        session_uuid="active-uuid-100",
        key_length=3,
        matching_indexes=[0, 2, 3],
        alice_key="110",
        bob_key="110",
        shared_key="110",
        generation_status="GENERATED",
        created_at=utc_now()
    )

    service.session_repo.find_by_session_id = AsyncMock(return_value=session_mock)
    service.session_repo.update = AsyncMock(return_value=session_mock)
    service.measurement_repo.find_by_session_id = AsyncMock(return_value=measurement_mock)
    service.key_repo.find_by_session = AsyncMock(return_value=None)
    service.key_repo.create = AsyncMock(return_value=saved_key)

    result = await service.generate_key("active-uuid-100")
    assert result.session_uuid == "active-uuid-100"
    assert result.generation_status == "GENERATED"
    assert result.shared_key == "110"
    assert result.key_length == 3
