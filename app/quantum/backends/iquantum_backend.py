"""Pluggable Quantum Backend Interface.

Defines the `IQuantumBackend` abstract port allowing QKD protocol execution across
simulators (Qiskit Aer) and real physical quantum hardware (IBM Quantum).
"""

from abc import ABC, abstractmethod
from typing import Any, Dict


class IQuantumBackend(ABC):
    """Abstract contract for quantum circuit execution backends."""

    @abstractmethod
    def run_circuit(self, circuit: Any, shots: int = 1024) -> Dict[str, int]:
        """Execute a quantum circuit and return measurement outcome count frequencies."""
        raise NotImplementedError

    @abstractmethod
    def transpile(self, circuit: Any) -> Any:
        """Transpile a QuantumCircuit to match target backend hardware topology."""
        raise NotImplementedError

    @abstractmethod
    def backend_name(self) -> str:
        """Return unique backend system name."""
        raise NotImplementedError

    @abstractmethod
    def is_simulator(self) -> bool:
        """Return True if backend is a classical simulator, False if real quantum hardware."""
        raise NotImplementedError

    def name(self) -> str:
        """Legacy compatibility alias for backend_name()."""
        return self.backend_name()
