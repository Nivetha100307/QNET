from qiskit import QuantumCircuit


def apply_measurement_basis(circuit: QuantumCircuit, alice_basis: str, bob_basis: str) -> QuantumCircuit:
    """Applies basis rotation gates (H for X basis) and applies measurement operators.
    
    Args:
        circuit: Base entangled QuantumCircuit (e.g. Bell pair).
        alice_basis: Measurement basis for Alice ('Z' or 'X').
        bob_basis: Measurement basis for Bob ('Z' or 'X').
        
    Returns:
        New QuantumCircuit with basis rotations and measurement gates appended.
    """
    qc = circuit.copy()
    
    # Alice's Basis Rotation (Qubit 0)
    if alice_basis.upper() == "X":
        qc.h(0)
        
    # Bob's Basis Rotation (Qubit 1)
    if bob_basis.upper() == "X":
        qc.h(1)
        
    # Measure qubits into classical register
    qc.measure([0, 1], [0, 1])
    
    return qc
