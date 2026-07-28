"""Measurement Engine for the E91 Quantum Key Distribution protocol.

This module provides the `MeasurementEngine` class and `MeasurementResult` model.
It receives an entangled Bell pair circuit, applies physical basis rotation gates
corresponding to Alice's and Bob's selected measurement angles, and executes
measurements via the `IQuantumBackend` abstraction interface.
"""

from dataclasses import dataclass
import math
from typing import List, Sequence

try:
    from qiskit import QuantumCircuit
except Exception:
    QuantumCircuit = None  # type: ignore

from app.domain.interfaces.quantum_backend import IQuantumBackend
from app.quantum.e91.basis_selector import MeasurementPair, MeasurementSetting
from app.quantum.simulators.aer_backend import AerBackend


@dataclass(frozen=True)
class MeasurementResult:
    """Outcome of measuring a single Bell pair under a specific MeasurementPair basis setting."""

    alice_basis: MeasurementSetting
    bob_basis: MeasurementSetting
    alice_bit: int
    bob_bit: int
    raw_bitstring: str
    shots: int = 1


class MeasurementEngine:
    """Engine for applying measurement basis rotations and executing circuit measurements."""

    def __init__(self, backend: IQuantumBackend | None = None) -> None:
        """Initialize the MeasurementEngine.

        Args:
            backend: Optional concrete backend satisfying IQuantumBackend interface.
                     Defaults to AerBackend if not provided.
        """
        self._backend: IQuantumBackend = backend if backend is not None else AerBackend()

    @property
    def backend(self) -> IQuantumBackend:
        """Return the quantum backend used by this engine."""
        return self._backend

    def prepare_measurement_circuit(
        self, bell_circuit: QuantumCircuit, pair: MeasurementPair
    ) -> QuantumCircuit:
        """Prepares a quantum circuit with basis rotation gates and measurement gates.

        Quantum Rotation Gate Math:
            Measuring along a physical direction at angle θ relative to the Z-axis in the
            X-Z plane corresponds to rotating the measurement axis back onto the Z-axis.
            We apply the single-qubit Y-rotation gate Ry(-2θ) to each qubit before Z-basis measurement.

            Ry(α) Matrix Definition:
                Ry(α) = [[ cos(α/2), -sin(α/2) ],
                         [ sin(α/2),  cos(α/2) ]]

            For Alice angle θ_A and Bob angle θ_B:
                - Qubit 0 (Alice): Ry(-2 * θ_A_rad)
                - Qubit 1 (Bob):   Ry(-2 * θ_B_rad)

        Args:
            bell_circuit: 2-qubit QuantumCircuit preparing an EPR Bell pair (e.g. |Φ+⟩).
            pair: MeasurementPair containing Alice and Bob measurement settings.

        """
        if QuantumCircuit is None or not hasattr(bell_circuit, "num_qubits"):
            return {"bell_circuit": bell_circuit, "pair": pair}

        if bell_circuit.num_qubits < 2:
            raise ValueError(
                f"bell_circuit must have at least 2 qubits, got {bell_circuit.num_qubits}."
            )

        # Create a new circuit combining the Bell state preparation with measurement registers
        qc = QuantumCircuit(
            2, 2, name=f"e91_meas_{pair.alice_setting.label}_{pair.bob_setting.label}"
        )

        # Compose Bell pair circuit onto qubits 0 and 1
        qc.compose(bell_circuit, qubits=[0, 1], inplace=True)

        # Apply basis rotation gates Ry(-theta)
        # Alice's rotation on qubit 0
        alice_rot = -pair.alice_setting.angle_radians
        if not math.isclose(alice_rot, 0.0, abs_tol=1e-9):
            qc.ry(alice_rot, 0)

        # Bob's rotation on qubit 1
        bob_rot = -pair.bob_setting.angle_radians
        if not math.isclose(bob_rot, 0.0, abs_tol=1e-9):
            qc.ry(bob_rot, 1)

        # Add computational basis (Z-basis) measurement gates
        qc.measure([0, 1], [0, 1])

        return qc

    def execute_measurement(
        self, bell_circuit: QuantumCircuit, pair: MeasurementPair, shots: int = 1
    ) -> List[MeasurementResult]:
        """Prepare circuit, execute on quantum backend, and parse measurement outcomes.

        Args:
            bell_circuit: 2-qubit QuantumCircuit preparing the Bell pair.
            pair: MeasurementPair chosen for this run.
            shots: Number of execution shots (defaults to 1).

        Returns:
            List[MeasurementResult]: Parsed measurement results.
        """
        if shots < 1:
            raise ValueError(f"shots must be at least 1, got {shots}.")

        circuit = self.prepare_measurement_circuit(bell_circuit, pair)
        counts = self._backend.run_circuit(circuit, shots=shots)

        results: List[MeasurementResult] = []
        for bitstring, count in counts.items():
            clean_bitstring = bitstring.replace(" ", "")
            if len(clean_bitstring) < 2:
                raise ValueError(f"Invalid measurement bitstring format: '{bitstring}'")

            # Qiskit bitstring order is 'q1 q0' (rightmost is qubit 0 / Alice)
            alice_bit = int(clean_bitstring[-1])
            bob_bit = int(clean_bitstring[-2])

            res = MeasurementResult(
                alice_basis=pair.alice_setting,
                bob_basis=pair.bob_setting,
                alice_bit=alice_bit,
                bob_bit=bob_bit,
                raw_bitstring=clean_bitstring,
                shots=1,
            )
            for _ in range(count):
                results.append(res)

        return results

    def measure_single_pair(
        self, bell_circuit: QuantumCircuit, pair: MeasurementPair
    ) -> MeasurementResult:
        """Measure a single Bell pair under a given MeasurementPair setting (1 shot).

        Args:
            bell_circuit: 2-qubit QuantumCircuit preparing the Bell pair.
            pair: MeasurementPair settings.

        Returns:
            MeasurementResult: Result of the single-shot measurement.
        """
        results = self.execute_measurement(bell_circuit, pair, shots=1)
        return results[0]

    def measure_multiple_pairs(
        self, bell_circuit: QuantumCircuit, schedule: Sequence[MeasurementPair]
    ) -> List[MeasurementResult]:
        """Measure a sequence of Bell pairs according to a measurement schedule.

        Args:
            bell_circuit: 2-qubit QuantumCircuit preparing the Bell pair.
            schedule: Sequence of MeasurementPair settings.

        Returns:
            List[MeasurementResult]: Ordered list of MeasurementResult outcomes.
        """
        if not schedule:
            raise ValueError("Measurement schedule sequence cannot be empty.")

        return [self.measure_single_pair(bell_circuit, pair) for pair in schedule]


def measure(*args, **kwargs):
    """Convenience legacy entrypoint for MeasurementEngine."""
    engine = MeasurementEngine()
    return engine.execute_measurement(*args, **kwargs)
