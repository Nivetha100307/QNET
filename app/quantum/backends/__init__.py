"""Quantum Backends Package.

Exposes pluggable quantum backends implementing IQuantumBackend:
- AerQuantumBackend / AerBackend (Qiskit Aer Simulator)
- IBMQuantumBackend (IBM Quantum Hardware Runtime)
"""

from app.quantum.backends.aer_backend import AerBackend, AerQuantumBackend
from app.quantum.backends.ibm_quantum_backend import IBMQuantumBackend
from app.quantum.backends.iquantum_backend import IQuantumBackend

__all__ = [
    "IQuantumBackend",
    "AerQuantumBackend",
    "AerBackend",
    "IBMQuantumBackend",
]
