"""Unit tests for the E91Protocol orchestrator."""

import pytest

from app.domain.entities.qkd_session import QKDResult, SessionStatus
from app.quantum.e91.chsh_verifier import CHSHResult, CHSHVerifier
from app.quantum.e91.e91_protocol import E91Protocol, ProtocolResult
from app.quantum.e91.qber_calculator import QBERCalculator, QBERResult
from app.quantum.e91.shared_secret_key import SharedSecretKey
from app.quantum.simulators.aer_backend import AerBackend


class MockCHSHFailingVerifier(CHSHVerifier):
    """Mock verifier simulating CHSH violation failure (e.g. S <= 2.0)."""

    def verify(self, results):
        return CHSHResult(
            correlations={},
            chsh_value=1.5,
            is_violated=False,
            is_quantum_entangled=False,
            eavesdropping_detected=True,
            total_samples_analyzed=len(results),
        )


class MockQBERFailingCalculator(QBERCalculator):
    """Mock calculator simulating high QBER failure (e.g. QBER >= 11%)."""

    def calculate(self, sifted_key):
        return QBERResult(
            compared_bits=sifted_key.key_length,
            matching_bits=int(sifted_key.key_length * 0.8),
            mismatching_bits=int(sifted_key.key_length * 0.2),
            qber_ratio=0.20,
            qber_percentage=20.0,
            secure_channel=False,
            threshold_used=0.11,
            status_message="Insecure Channel",
        )


def test_successful_e91_protocol_run():
    backend = AerBackend(seed_simulator=42)
    protocol = E91Protocol(backend=backend)

    result = protocol.execute_protocol(total_pairs=200)

    assert isinstance(result, ProtocolResult)
    assert result.protocol_status == "COMPLETED"
    assert result.total_pairs == 200
    assert result.retained_pairs > 0
    assert result.bell_parameter is not None
    assert result.bell_parameter > 2.0
    assert result.qber is not None
    assert result.qber == 0.0
    assert result.shared_secret is not None
    assert isinstance(result.shared_secret, SharedSecretKey)
    assert len(result.shared_secret.key_bits) == result.retained_pairs
    assert len(result.warnings) == 0

    domain_res = result.to_qkd_result()
    assert isinstance(domain_res, QKDResult)
    assert domain_res.status == SessionStatus.COMPLETED
    assert domain_res.eavesdropping_detected is False
    assert domain_res.chsh_value == result.bell_parameter


def test_chsh_failure_abort():
    failing_verifier = MockCHSHFailingVerifier()
    protocol = E91Protocol(chsh_verifier=failing_verifier)

    result = protocol.execute_protocol(total_pairs=20)

    assert isinstance(result, ProtocolResult)
    assert result.protocol_status == "ABORTED_EAVESDROPPING"
    assert result.bell_parameter == 1.5
    assert result.retained_pairs == 0
    assert result.shared_secret is None
    assert len(result.warnings) == 1
    assert "CHSH verification failed" in result.warnings[0]

    domain_res = result.to_qkd_result()
    assert domain_res.status == SessionStatus.ABORTED_EAVESDROPPING
    assert domain_res.eavesdropping_detected is True


def test_qber_failure_abort():
    backend = AerBackend(seed_simulator=42)
    failing_qber = MockQBERFailingCalculator()
    protocol = E91Protocol(backend=backend, qber_calculator=failing_qber)

    result = protocol.execute_protocol(total_pairs=100)

    assert isinstance(result, ProtocolResult)
    assert result.protocol_status == "ABORTED_EAVESDROPPING"
    assert result.qber == 0.20
    assert result.shared_secret is None
    assert len(result.warnings) == 1
    assert "QBER calculation failed" in result.warnings[0]


def test_invalid_total_pairs_raises_value_error():
    protocol = E91Protocol()
    with pytest.raises(ValueError, match="total_pairs must be at least 1"):
        protocol.execute_protocol(total_pairs=0)
