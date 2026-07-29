import time
from typing import Optional
from app.quantum.context import E91SessionContext
from app.quantum.bell_state import create_bell_pair_circuit
from app.quantum.basis_generator import generate_random_bases
from app.quantum.measurement import apply_measurement_basis
from app.quantum.visualizer import render_circuit_text, export_circuit_qasm
from app.core.logging_config import logger

try:
    from qiskit_aer import AerSimulator
    HAS_AER = True
except Exception:
    HAS_AER = False

from qiskit.providers.basic_provider import BasicSimulator


class QuantumEngine:
    """E91 Quantum Communication Simulation & Execution Engine."""

    def __init__(self, use_aer: bool = True) -> None:
        """Initializes QuantumEngine with appropriate simulator backend."""
        if use_aer and HAS_AER:
            self.backend = AerSimulator()
            self.backend_name = "AerSimulator"
        else:
            self.backend = BasicSimulator()
            self.backend_name = "BasicSimulator"

    def execute_e91_measurement(self, context: E91SessionContext) -> E91SessionContext:
        """Executes E91 Bell-state entanglement measurement for the configured shot count.

        Args:
            context (E91SessionContext): Session execution context.

        Returns:
            E91SessionContext: Population context populated with measurement results.
        """
        shots = max(1, min(context.shots, 10000))
        context.shots = shots
        context.bell_pair_count = shots

        # 1. Generate basis choices for Alice and Bob
        alice_bases, bob_bases = generate_random_bases(shots)
        context.alice_basis = alice_bases
        context.bob_basis = bob_bases

        start_time = time.time()

        # 2. Build circuits for each shot
        circuits = []
        base_bell_circuit = create_bell_pair_circuit()
        for a_basis, b_basis in zip(alice_bases, bob_bases):
            qc = apply_measurement_basis(base_bell_circuit, a_basis, b_basis)
            circuits.append(qc)

        # 3. Execute circuits on simulator backend
        alice_bits = []
        bob_bits = []

        try:
            job = self.backend.run(circuits, shots=1)
            result = job.result()

            for i in range(shots):
                counts = result.get_counts(i)
                bitstring = list(counts.keys())[0].zfill(2)
                # In Qiskit classical register: bitstring[0] = q[1] (Bob), bitstring[1] = q[0] (Alice)
                bob_bits.append(int(bitstring[0]))
                alice_bits.append(int(bitstring[1]))
        except Exception as e:
            logger.error(f"Execution error on backend {self.backend_name}: {str(e)}")
            # Fallback execution per-circuit if batched run fails
            alice_bits = []
            bob_bits = []
            for qc in circuits:
                job = self.backend.run(qc, shots=1)
                result = job.result()
                counts = result.get_counts()
                bitstring = list(counts.keys())[0].zfill(2)
                bob_bits.append(int(bitstring[0]))
                alice_bits.append(int(bitstring[1]))

        elapsed_ms = (time.time() - start_time) * 1000.0

        # 4. Populate output attributes
        context.alice_bits = alice_bits
        context.bob_bits = bob_bits
        context.execution_backend = self.backend_name
        context.simulation_time_ms = round(elapsed_ms, 2)

        # Representative circuit for visualizer / QASM
        sample_qc = circuits[0] if circuits else apply_measurement_basis(base_bell_circuit, "Z", "Z")
        context.circuit_qasm = export_circuit_qasm(sample_qc)
        context.circuit_diagram = render_circuit_text(sample_qc)
        context.status = "COMPLETED"

        logger.info(
            f"E91 Quantum Measurement completed for session '{context.session_uuid}' "
            f"({shots} shots, {context.simulation_time_ms} ms, backend={self.backend_name})"
        )

        return context
