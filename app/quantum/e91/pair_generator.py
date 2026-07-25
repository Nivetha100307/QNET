"""Bell/EPR pair circuit generation for the E91 protocol.

This module provides the `BellStateGenerator` class to construct quantum circuits
that prepare maximally entangled two-qubit Bell states, specifically the |Φ+⟩ state.
"""

from typing import Optional
from qiskit import QuantumCircuit


class BellStateGenerator:
    """Generator for entangled two-qubit Bell states using Qiskit circuits."""

    def __init__(self, circuit_name: str = "bell_state_phi_plus") -> None:
        """Initialize the BellStateGenerator.

        Args:
            circuit_name: Default name assigned to generated Qiskit QuantumCircuit objects.
        """
        self.circuit_name = circuit_name

    def generate_phi_plus(self, name: Optional[str] = None) -> QuantumCircuit:
        """Generates a 2-qubit quantum circuit preparing the |Φ+⟩ Bell state.

        Mathematical Definition:
            |Φ+⟩ = (1 / √2) * (|00⟩ + |11⟩)

        Quantum Gate Breakdown:
            1. Hadamard Gate (H) on Qubit 0:
               - Operation: Maps basis state |0⟩ to superposition state (|0⟩ + |1⟩) / √2.
               - System State Transformation:
                 |00⟩  --->  (1 / √2) * (|00⟩ + |10⟩)

            2. Controlled-NOT (CNOT / CX) Gate (Control: Qubit 0, Target: Qubit 1):
               - Operation: Flips the target qubit (qubit 1) if and only if the control
                 qubit (qubit 0) is |1⟩.
               - System State Transformation:
                 (1 / √2) * (|00⟩ + |10⟩)  --->  (1 / √2) * (|00⟩ + |11⟩)

        Args:
            name: Optional custom name override for the generated circuit.

        Returns:
            QuantumCircuit: A 2-qubit Qiskit QuantumCircuit without measurements,
            representing the maximally entangled |Φ+⟩ EPR pair.
        """
        qc_name = name or self.circuit_name
        qc = QuantumCircuit(2, name=qc_name)

        # Gate 1: Hadamard gate on qubit 0 creates single-qubit superposition
        qc.h(0)

        # Gate 2: CNOT gate with control qubit 0 and target qubit 1 entangles the pair
        qc.cx(0, 1)

        return qc


def create_bell_pair_circuit(name: str = "bell_state_phi_plus") -> QuantumCircuit:
    """Convenience helper function to generate a |Φ+⟩ Bell state quantum circuit.

    Args:
        name: Name for the generated QuantumCircuit.

    Returns:
        QuantumCircuit: A 2-qubit Qiskit QuantumCircuit preparing the |Φ+⟩ state.
    """
    generator = BellStateGenerator(circuit_name=name)
    return generator.generate_phi_plus()
