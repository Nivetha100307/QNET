import sys
import os
import pytest
from unittest.mock import AsyncMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.security.utils import compute_channel_gamma, THRESHOLDS
from app.security.bell_test import generate_e91_coincidences, compute_bell_correlations, compute_coincidence_counts
from app.security.chsh import calculate_chsh_parameter
from app.security.qber import derive_qber_from_gamma, calculate_qber
from app.security.fidelity import derive_fidelity_from_gamma
from app.security.decision_engine import evaluate_security_status
from app.security.security_service import SecurityService, SecurityAnalysisError
from app.models.quantum_security_report import QuantumSecurityReport, utc_now
from app.models.session import QuantumSession
from app.models.quantum_measurement import QuantumMeasurement
from app.models.quantum_key import QuantumKey


def test_channel_gamma_calculation():
    # Short link channel at 2km
    gamma_exc = compute_channel_gamma(distance_km=2.0, fiber_loss_db_per_km=0.20, detector_efficiency=0.98, phase_noise=0.01, dark_count=0.005)
    assert 0.85 <= gamma_exc <= 1.0

    # Long link channel at 120km
    gamma_poor = compute_channel_gamma(distance_km=120.0, fiber_loss_db_per_km=0.20, detector_efficiency=0.90, phase_noise=0.05, dark_count=0.02)
    assert gamma_poor < 0.7071


def test_coincidence_counts_and_expectations():
    gamma = 0.95
    coincidences = generate_e91_coincidences(gamma=gamma, total_shots_per_basis=1024)

    assert "a1b1" in coincidences
    assert coincidences["a1b1"]["total_coincidences"] == 1024
    assert coincidences["a1b1"]["n_plus_plus"] + coincidences["a1b1"]["n_plus_minus"] + coincidences["a1b1"]["n_minus_plus"] + coincidences["a1b1"]["n_minus_minus"] == 1024

    # Calculate CHSH parameter from generated coincidences
    correlations = {k: v["expectation"] for k, v in coincidences.items()}
    s_val, result = calculate_chsh_parameter(correlations)
    # Expected S = 2.8284 * 0.95 = 2.687
    assert 2.50 <= s_val <= 2.85
    assert result == "PASS"


def test_derived_metrics_consistency():
    gamma = 0.92
    qber = derive_qber_from_gamma(gamma)
    fidelity = derive_fidelity_from_gamma(gamma)

    assert qber == 0.04  # (1 - 0.92) / 2 = 0.04 (4.0%)
    assert fidelity == 0.96  # (1 + 0.92) / 2 = 0.96 (96.0%)


def test_decision_engine_rules():
    # 1. Quantum Channel Verified state
    status_sec, score_sec, meta_sec = evaluate_security_status(chsh_value=2.67, qber=0.02, fidelity=0.98)
    assert status_sec == "Quantum Channel Verified"
    assert score_sec >= 85
    assert meta_sec["gate_1_chsh_pass"] is True
    assert meta_sec["key_accepted"] is True
    assert meta_sec["scada_module_5_enabled"] is True

    # 2. Quantum Channel Rejected state due to low CHSH (S <= 2.0)
    status_comp, score_comp, meta_comp = evaluate_security_status(chsh_value=1.5, qber=0.25, fidelity=0.60)
    assert status_comp == "Quantum Channel Rejected"
    assert score_comp <= 45
    assert meta_comp["gate_1_chsh_pass"] is False
    assert meta_comp["key_accepted"] is False
    assert meta_comp["scada_module_5_enabled"] is False


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
        bell_correlations={"ZZ": 0.95, "XX": 0.95},
        chsh_value=2.67,
        bell_test_result="PASS",
        qber=0.02,
        fidelity=0.98,
        security_status="Quantum Channel Verified",
        security_score=98,
        measurement_count=4096,
        analysis_time_ms=15.2,
        report_timestamp=utc_now()
    )

    service.session_repo.find_by_session_id = AsyncMock(return_value=session_mock)
    service.session_repo.update = AsyncMock(return_value=session_mock)
    service.measurement_repo.find_by_session_id = AsyncMock(return_value=measurement_mock)
    service.key_repo.find_by_session = AsyncMock(return_value=key_mock)
    service.security_repo.find_by_session = AsyncMock(return_value=None)
    service.security_repo.create = AsyncMock(return_value=report_mock)

    report = await service.analyze_security("active-sec-uuid-100", distance_km=10.0)
    assert report.session_uuid == "active-sec-uuid-100"
    assert report.security_status == "Quantum Channel Verified"
