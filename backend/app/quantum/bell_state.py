from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister


def create_bell_pair_circuit() -> QuantumCircuit:
    """Constructs a 2-qubit QuantumCircuit generating the |Φ+⟩ Bell State.
    
    |Φ+⟩ = 1/√2 (|00⟩ + |11⟩)
    
    Applies Hadamard gate H(0) on qubit 0 followed by CNOT CX(0, 1) on qubit 1.
    """
    qr = QuantumRegister(2, name="q")
    cr = ClassicalRegister(2, name="c")
    qc = QuantumCircuit(qr, cr, name="bell_phi_plus")
    
    # Generate entanglement
    qc.h(qr[0])
    qc.cx(qr[0], qr[1])
    
    return qc
