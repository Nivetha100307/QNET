import pytest
from unittest.mock import AsyncMock
from app.security.bell_test import compute_bell_correlations, calculate_expectation_value
from app.security.chsh import calculate_chsh_parameter
from app.security.qber import calculate_qber
from app.security.fidelity import estimate_quantum_fidelity
from app.security.decision_engine import evaluate_security_status
from app.security.security_service import SecurityService, SecurityAnalysisError
from app.security.utils import THRESHOLDS
from app.models.quantum_security_report import QuantumSecurityReport, utc_now
from app.models.session import QuantumSession
from app.models.quantum_measurement import QuantumMeasurement
from app.models.quantum_key import QuantumKey


def test_expectation_value_calculation():
    alice_bits = [0, 1, 0, 1]
    bob_bits   = [0, 1, 1, 0]
    indices    = [0, 1, 2, 3]

    val = calculate_expectation_value(alice_bits, bob_bits, indices)
    # same = 2, diff = 2 -> (2 - 2)/4 = 0.0
    assert val == 0.0

    # Perfect correlation
    val_perfect = calculate_expectation_value([0, 1], [0, 1], [0, 1])
    assert val_perfect == 1.0


def test_compute_bell_correlations():
    alice_basis = ["Z", "Z", "X", "X"]
    bob_basis   = ["Z", "Z", "X", "X"]
    alice_bits  = [1,   0,   1,   0]
    bob_bits    = [1,   0,   1,   0]

    matrix = compute_bell_correlations(alice_basis, bob_basis, alice_bits, bob_bits)

    assert "ZZ" in matrix
    assert "XX" in matrix
    assert matrix["ZZ"] == 1.0
    assert matrix["XX"] == 1.0


def test_chsh_parameter_calculation():
    bell_correlations = {
        "ZZ": 0.95,
        "ZX": -0.70,
        "XZ": 0.70,
        "XX": 0.95
    }

    s_val, result = calculate_chsh_parameter(bell_correlations)
    # S = 0.95 - (-0.70) + 0.70 + 0.95 = 3.30
    assert s_val == 3.3
    assert result == "PASS"


def test_qber_calculation():
    alice_bits  = [1, 0, 1, 1, 0]
    bob_bits    = [1, 0, 0, 1, 1]  # Errors at index 2 and index 4
    matching_idx = [0, 1, 2, 3, 4]

    qber = calculate_qber(alice_bits, bob_bits, matching_idx)
    assert qber == 0.4  # 2 errors / 5 bits = 0.40


def test_fidelity_estimation():
    bell_correlations = {"ZZ": 0.98, "XX": 0.96}
    qber = 0.02

    f_est = estimate_quantum_fidelity(bell_correlations, qber)
    assert 0.85 <= f_est <= 1.0


def test_decision_engine_rules():
    # 1. SECURE state
    status_sec, score_sec = evaluate_security_status(chsh_value=2.67, qber=0.02, fidelity=0.98)
    assert status_sec == "SECURE"
    assert score_sec >= 85

    # 2. COMPROMISED state due to high QBER and low CHSH
    status_comp, score_comp = evaluate_security_status(chsh_value=1.5, qber=0.25, fidelity=0.60)
    assert status_comp == "COMPROMISED"
    assert score_comp <= 65


@pytest.mark.asyncio
async def test_security_service_workflow():
    db_mock = AsyncMock()
    service = SecurityService(db_mock)

    session_mock = QuantumSession(
        id=1,
        session_id="active-sec-uuid-100",
        status="ACTIVE",
        timeline=[],
        quantum_channel={}
    )
    measurement_mock = QuantumMeasurement(
        id=1,
        session_uuid="active-sec-uuid-100",
        alice_basis=["Z", "X", "Z", "X"],
        bob_basis=["Z", "Z", "Z", "X"],
        alice_bits=[1, 0, 1, 0],
        bob_bits=[1, 1, 1, 0]
    )
    key_mock = QuantumKey(
        id=1,
        session_uuid="active-sec-uuid-100",
        generation_status="GENERATED",
        matching_indexes=[0, 2, 3],
        shared_key="110"
    )
    report_mock = QuantumSecurityReport(
        id=1,
        session_uuid="active-sec-uuid-100",
        bell_correlations={"ZZ": 1.0, "XX": 1.0},
        chsh_value=2.67,
        bell_test_result="PASS",
        qber=0.0,
        fidelity=0.99,
        security_status="SECURE",
        security_score=98,
        measurement_count=4,
        analysis_time_ms=15.2,
        report_timestamp=utc_now()
    )

    service.session_repo.find_by_session_id = AsyncMock(return_value=session_mock)
    service.session_repo.update = AsyncMock(return_value=session_mock)
    service.measurement_repo.find_by_session_id = AsyncMock(return_value=measurement_mock)
    service.key_repo.find_by_session = AsyncMock(return_value=key_mock)
    service.security_repo.find_by_session = AsyncMock(return_value=None)
    service.security_repo.create = AsyncMock(return_value=report_mock)

    report = await service.analyze_security("active-sec-uuid-100")
    assert report.session_uuid == "active-sec-uuid-100"
    assert report.security_status == "SECURE"
    assert report.chsh_value == 2.67
