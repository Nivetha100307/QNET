"""Unit tests for the E91 MeasurementEngine and basis rotation logic."""

import pytest
from qiskit import QuantumCircuit

from app.domain.interfaces.quantum_backend import IQuantumBackend
from app.quantum.e91.basis_selector import (
    ALICE_E91_SETTINGS,
    BOB_E91_SETTINGS,
    BasisSelector,
    MeasurementPair,
    MeasurementSetting,
)
from app.quantum.e91.measurement import MeasurementEngine, MeasurementResult
from app.quantum.e91.pair_generator import create_bell_pair_circuit
from app.quantum.simulators.aer_backend import AerBackend


class MockBackend(IQuantumBackend):
    """Mock backend implementation to verify dependency injection abstraction."""

    def __init__(self) -> None:
        self.called_with_shots: int | None = None
        self.called_with_circuit: QuantumCircuit | None = None

    def run_circuit(self, circuit: QuantumCircuit, shots: int = 1) -> dict[str, int]:
        self.called_with_circuit = circuit
        self.called_with_shots = shots
        return {"00": shots}

    def name(self) -> str:
        return "mock_backend"

    def backend_name(self) -> str:
        return "mock_backend"

    def is_simulator(self) -> bool:
        return True

    def transpile(self, circuit: QuantumCircuit) -> QuantumCircuit:
        return circuit


def test_prepare_measurement_circuit_structure():
    bell_circuit = create_bell_pair_circuit()
    pair = MeasurementPair(
        alice_setting=MeasurementSetting(label="A2", angle_degrees=45.0),
        bob_setting=MeasurementSetting(label="B1", angle_degrees=45.0),
    )

    engine = MeasurementEngine()
    meas_circuit = engine.prepare_measurement_circuit(bell_circuit, pair)

    assert isinstance(meas_circuit, QuantumCircuit)
    assert meas_circuit.num_qubits == 2
    assert meas_circuit.num_clbits == 2

    # Expecting H, CX, Ry(Alice), Ry(Bob), and Measure operations
    gate_names = [instruction.operation.name for instruction in meas_circuit.data]
    assert "h" in gate_names
    assert "cx" in gate_names
    assert "ry" in gate_names
    assert "measure" in gate_names


def test_matching_basis_perfect_correlation():
    """When Alice and Bob measure in identical bases (45° & 45°), bits must match 100%."""
    bell_circuit = create_bell_pair_circuit()
    matching_pair = MeasurementPair(
        alice_setting=MeasurementSetting(label="A2", angle_degrees=45.0),
        bob_setting=MeasurementSetting(label="B1", angle_degrees=45.0),
    )

    # Use deterministic seed backend
    backend = AerBackend(seed_simulator=42)
    engine = MeasurementEngine(backend=backend)

    results = engine.execute_measurement(bell_circuit, matching_pair, shots=500)

    assert len(results) == 500
    for res in results:
        assert isinstance(res, MeasurementResult)
        assert res.alice_bit == res.bob_bit, "Matching basis must yield identical outcomes"
        assert res.raw_bitstring in ["00", "11"]


def test_custom_backend_dependency_injection():
    mock_backend = MockBackend()
    engine = MeasurementEngine(backend=mock_backend)

    bell_circuit = create_bell_pair_circuit()
    pair = MeasurementPair(
        alice_setting=ALICE_E91_SETTINGS[0],
        bob_setting=BOB_E91_SETTINGS[0],
    )

    results = engine.execute_measurement(bell_circuit, pair, shots=10)

    assert mock_backend.called_with_shots == 10
    assert mock_backend.called_with_circuit is not None
    assert len(results) == 10
    assert all(r.alice_bit == 0 and r.bob_bit == 0 for r in results)


def test_measure_single_pair_and_multiple_pairs():
    bell_circuit = create_bell_pair_circuit()
    selector = BasisSelector(seed=100)
    engine = MeasurementEngine(backend=AerBackend(seed_simulator=100))

    # Single pair measurement
    pair = selector.generate_measurement_pair()
    single_res = engine.measure_single_pair(bell_circuit, pair)
    assert isinstance(single_res, MeasurementResult)
    assert single_res.alice_bit in [0, 1]
    assert single_res.bob_bit in [0, 1]

    # Multiple pairs schedule measurement
    schedule = selector.generate_measurement_schedule(20)
    batch_results = engine.measure_multiple_pairs(bell_circuit, schedule)
    assert len(batch_results) == 20
    for res in batch_results:
        assert isinstance(res, MeasurementResult)


def test_invalid_inputs_raise_exceptions():
    engine = MeasurementEngine()
    bell_circuit = create_bell_pair_circuit()

    # Invalid small circuit
    invalid_circuit = QuantumCircuit(1)
    pair = MeasurementPair(
        alice_setting=ALICE_E91_SETTINGS[0],
        bob_setting=BOB_E91_SETTINGS[0],
    )

    with pytest.raises(ValueError, match="must have at least 2 qubits"):
        engine.prepare_measurement_circuit(invalid_circuit, pair)

    with pytest.raises(ValueError, match="shots must be at least 1"):
        engine.execute_measurement(bell_circuit, pair, shots=0)

    with pytest.raises(ValueError, match="Measurement schedule sequence cannot be empty"):
        engine.measure_multiple_pairs(bell_circuit, [])
