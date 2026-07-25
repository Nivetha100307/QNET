"""Qiskit Aer Simulator Backend Implementation."""

from typing import Any, Dict, Optional
from qiskit import transpile as qiskit_transpile
from qiskit_aer import AerSimulator

from app.quantum.backends.iquantum_backend import IQuantumBackend


class AerQuantumBackend(IQuantumBackend):
    """Concrete implementation of IQuantumBackend using Qiskit AerSimulator."""

    def __init__(self, seed_simulator: Optional[int] = None) -> None:
        """Initialize AerQuantumBackend simulator.

        Args:
            seed_simulator: Optional random seed for deterministic simulation.
        """
        self._seed = seed_simulator
        self._simulator = (
            AerSimulator(seed_simulator=seed_simulator)
            if seed_simulator is not None
            else AerSimulator()
        )

    def run_circuit(self, circuit: Any, shots: int = 1024) -> Dict[str, int]:
        """Execute a quantum circuit on the Aer simulator.

        Args:
            circuit: Qiskit QuantumCircuit to execute.
            shots: Number of measurement shots (default: 1024).

        Returns:
            Dict[str, int]: Dictionary mapping measurement bitstrings to counts.
        """
        compiled = self.transpile(circuit)
        job = self._simulator.run(compiled, shots=shots)
        result = job.result()
        counts = result.get_counts(compiled)
        return dict(counts)

    def transpile(self, circuit: Any) -> Any:
        """Transpile circuit for Aer backend."""
        return qiskit_transpile(circuit, self._simulator)

    def backend_name(self) -> str:
        """Return unique backend system name."""
        return "aer_simulator"

    def is_simulator(self) -> bool:
        """Return True indicating this backend is a classical simulator."""
        return True


# Backward compatibility alias
AerBackend = AerQuantumBackend
