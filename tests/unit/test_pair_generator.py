"""Unit tests for the E91 BellStateGenerator and EPR pair creation."""

import numpy as np
import pytest
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

from app.quantum.e91.pair_generator import BellStateGenerator, create_bell_pair_circuit


def test_bell_state_generator_initialization():
    generator = BellStateGenerator(circuit_name="custom_bell_name")
    assert generator.circuit_name == "custom_bell_name"


def test_generate_phi_plus_structure():
    generator = BellStateGenerator()
    qc = generator.generate_phi_plus()

    assert isinstance(qc, QuantumCircuit)
    assert qc.num_qubits == 2
    assert qc.num_clbits == 0
    assert qc.name == "bell_state_phi_plus"

    # Check gate instructions (expecting 1 'h' and 1 'cx')
    gate_names = [instruction.operation.name for instruction in qc.data]
    assert gate_names == ["h", "cx"]


def test_generate_phi_plus_statevector():
    generator = BellStateGenerator()
    qc = generator.generate_phi_plus()

    # Calculate quantum statevector of circuit
    state = Statevector.from_instruction(qc)
    expected_state = np.array([1 / np.sqrt(2), 0, 0, 1 / np.sqrt(2)])

    # Verify statevector fidelity matches |Φ+⟩ state
    np.testing.assert_allclose(state.data, expected_state, atol=1e-7)


def test_create_bell_pair_circuit_helper():
    qc = create_bell_pair_circuit(name="helper_test")

    assert isinstance(qc, QuantumCircuit)
    assert qc.num_qubits == 2
    assert qc.name == "helper_test"
