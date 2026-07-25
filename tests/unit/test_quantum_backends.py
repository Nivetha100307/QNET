"""Unit tests for pluggable quantum backends (AerQuantumBackend and IBMQuantumBackend)."""

from unittest.mock import MagicMock, patch
import pytest
from qiskit import QuantumCircuit

from app.quantum.backends.aer_backend import AerBackend, AerQuantumBackend
from app.quantum.backends.ibm_quantum_backend import IBMQuantumBackend
from app.quantum.backends.iquantum_backend import IQuantumBackend
from app.quantum.e91.e91_protocol import E91Protocol, ProtocolResult


@pytest.fixture
def bell_circuit() -> QuantumCircuit:
    qc = QuantumCircuit(2, 2)
    qc.h(0)
    qc.cx(0, 1)
    qc.measure([0, 1], [0, 1])
    return qc


def test_aer_quantum_backend_properties_and_execution(bell_circuit):
    backend = AerQuantumBackend(seed_simulator=42)

    assert isinstance(backend, IQuantumBackend)
    assert backend.backend_name() == "aer_simulator"
    assert backend.is_simulator() is True

    # Test transpilation
    transpiled = backend.transpile(bell_circuit)
    assert transpiled is not None

    # Test circuit execution
    counts = backend.run_circuit(bell_circuit, shots=100)
    assert isinstance(counts, dict)
    assert sum(counts.values()) == 100
    assert "00" in counts or "11" in counts


@patch("app.quantum.backends.ibm_quantum_backend.QiskitRuntimeService")
def test_ibm_quantum_backend_properties_and_fallback(mock_service, bell_circuit):
    mock_service.side_effect = RuntimeError("IBM Service Unavailable")

    backend = IBMQuantumBackend(
        token="mock_test_token",
        backend_name_str="ibm_brisbane",
        fallback_to_simulator=True,
    )

    assert isinstance(backend, IQuantumBackend)
    assert backend.backend_name() == "ibm_brisbane"
    assert backend.is_simulator() is False

    counts = backend.run_circuit(bell_circuit, shots=100)
    assert isinstance(counts, dict)
    assert sum(counts.values()) == 100


@patch("app.quantum.backends.ibm_quantum_backend.QiskitRuntimeService")
def test_ibm_quantum_backend_failure_without_fallback(mock_service, bell_circuit):
    mock_service.side_effect = RuntimeError("IBM Service Unavailable")

    backend = IBMQuantumBackend(
        token="invalid_dummy_token",
        backend_name_str="non_existent_hardware",
        fallback_to_simulator=False,
    )

    with pytest.raises(RuntimeError, match="IBM Quantum hardware execution failed"):
        backend.run_circuit(bell_circuit, shots=100)


@patch("app.quantum.backends.ibm_quantum_backend.QiskitRuntimeService")
def test_e91_protocol_backend_switching(mock_service):
    """Verify E91Protocol executes identically with Aer or IBM backends via Dependency Injection."""
    mock_service.side_effect = RuntimeError("Offline fallback")

    aer_b = AerQuantumBackend(seed_simulator=42)
    ibm_b = IBMQuantumBackend(
        token="mock_test_token",
        backend_name_str="ibm_kyiv",
        fallback_to_simulator=True,
    )

    protocol_aer = E91Protocol(backend=aer_b)
    protocol_ibm = E91Protocol(backend=ibm_b)

    res_aer = protocol_aer.execute_protocol(total_pairs=40)
    res_ibm = protocol_ibm.execute_protocol(total_pairs=40)

    assert isinstance(res_aer, ProtocolResult)
    assert isinstance(res_ibm, ProtocolResult)
    assert res_aer.protocol_status == "COMPLETED"
    assert res_ibm.protocol_status == "COMPLETED"
