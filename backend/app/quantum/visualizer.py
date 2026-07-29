from qiskit import QuantumCircuit
from qiskit.qasm2 import dumps as qasm2_dumps


def render_circuit_text(circuit: QuantumCircuit) -> str:
    """Renders Qiskit circuit as ASCII/text diagram."""
    try:
        return str(circuit.draw(output="text"))
    except Exception:
        return f"Qiskit Circuit (Qubits: {circuit.num_qubits}, Bits: {circuit.num_clbits})"


def export_circuit_qasm(circuit: QuantumCircuit) -> str:
    """Exports QuantumCircuit as OpenQASM 2.0 string representation."""
    try:
        return qasm2_dumps(circuit)
    except Exception:
        # Fallback to string representation if QASM export fails
        return f"OPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[{circuit.num_qubits}];\ncreg c[{circuit.num_clbits}];"
