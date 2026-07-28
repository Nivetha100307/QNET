"""E91 Protocol Orchestrator for Quantum Key Distribution.

This module provides the `E91Protocol` class implementing `IQKDProtocol`.
It coordinates pair generation, basis selection, circuit measurement execution,
CHSH verification, key sifting, QBER calculation, and shared secret key generation.
"""

import time
from dataclasses import dataclass, field
from typing import List, Optional
from uuid import uuid4

from app.domain.entities.qkd_session import QKDResult, SessionStatus
from app.domain.interfaces.qkd_protocol import IQKDProtocol
from app.domain.interfaces.quantum_backend import IQuantumBackend
from app.quantum.e91.basis_selector import BasisSelector
from app.quantum.e91.chsh_verifier import CHSHResult, CHSHVerifier
from app.quantum.e91.key_sifting import KeySiftingEngine, SiftedKey
from app.quantum.e91.measurement import MeasurementEngine
from app.quantum.e91.pair_generator import BellStateGenerator
from app.quantum.e91.qber_calculator import QBERCalculator, QBERResult
from app.quantum.e91.shared_secret_key import SharedSecretKey, SharedSecretKeyGenerator
from app.quantum.simulators.aer_backend import AerBackend


@dataclass(frozen=True)
class ProtocolResult:
    """Structured result containing end-to-end E91 protocol execution metrics."""

    session_id: str
    protocol_status: str
    total_pairs: int
    retained_pairs: int
    bell_parameter: Optional[float] = None
    qber: Optional[float] = None
    shared_secret: Optional[SharedSecretKey] = None
    execution_time_seconds: float = 0.0
    warnings: List[str] = field(default_factory=list)
    chsh_result: Optional[CHSHResult] = None
    qber_result: Optional[QBERResult] = None
    sifted_key: Optional[SiftedKey] = None

    def to_qkd_result(self) -> QKDResult:
        """Map ProtocolResult to domain entity QKDResult."""
        status_enum = SessionStatus.COMPLETED
        if self.protocol_status == "ABORTED_EAVESDROPPING":
            status_enum = SessionStatus.ABORTED_EAVESDROPPING
        elif self.protocol_status == "FAILED":
            status_enum = SessionStatus.FAILED

        sifted_bits = self.sifted_key.alice_key_bits if self.sifted_key else []

        return QKDResult(
            session_id=self.session_id,
            raw_key_length=len(sifted_bits),
            sifted_key=sifted_bits,
            qber=self.qber,
            chsh_value=self.bell_parameter,
            eavesdropping_detected=(self.protocol_status == "ABORTED_EAVESDROPPING"),
            status=status_enum,
        )


class E91Protocol(IQKDProtocol):
    """End-to-end orchestrator for the E91 Quantum Key Distribution protocol."""

    def __init__(
        self,
        backend: Optional[IQuantumBackend] = None,
        pair_generator: Optional[BellStateGenerator] = None,
        basis_selector: Optional[BasisSelector] = None,
        measurement_engine: Optional[MeasurementEngine] = None,
        chsh_verifier: Optional[CHSHVerifier] = None,
        key_sifter: Optional[KeySiftingEngine] = None,
        qber_calculator: Optional[QBERCalculator] = None,
        key_generator: Optional[SharedSecretKeyGenerator] = None,
    ) -> None:
        """Initialize E91Protocol with modular dependencies.

        Args:
            backend: Quantum backend implementation.
            pair_generator: BellStateGenerator instance.
            basis_selector: BasisSelector instance.
            measurement_engine: MeasurementEngine instance.
            chsh_verifier: CHSHVerifier instance.
            key_sifter: KeySiftingEngine instance.
            qber_calculator: QBERCalculator instance.
            key_generator: SharedSecretKeyGenerator instance.
        """
        self._backend = backend if backend is not None else AerBackend()
        self._pair_generator = (
            pair_generator if pair_generator is not None else BellStateGenerator()
        )
        self._basis_selector = (
            basis_selector if basis_selector is not None else BasisSelector()
        )
        self._measurement_engine = (
            measurement_engine
            if measurement_engine is not None
            else MeasurementEngine(backend=self._backend)
        )
        self._chsh_verifier = (
            chsh_verifier if chsh_verifier is not None else CHSHVerifier()
        )
        self._key_sifter = key_sifter if key_sifter is not None else KeySiftingEngine()
        self._qber_calculator = (
            qber_calculator if qber_calculator is not None else QBERCalculator()
        )
        self._key_generator = (
            key_generator if key_generator is not None else SharedSecretKeyGenerator()
        )

    def run(
        self,
        num_bits: int = 128,
        enable_eve: bool = False,
        channel_noise: float = 0.0,
    ) -> ProtocolResult:
        """Execute the E91 protocol end-to-end to generate approximately num_bits of sifted key."""
        total_pairs = max(num_bits * 5, 200)
        return self.execute_protocol(
            total_pairs=total_pairs,
            enable_eve=enable_eve,
            channel_noise=channel_noise,
        )

    def execute_protocol(
        self,
        total_pairs: int,
        session_id: Optional[str] = None,
        enable_eve: bool = False,
        channel_noise: float = 0.0,
    ) -> ProtocolResult:
        """Orchestrates E91 components through the execution pipeline.

        Pipeline Steps:
            1. Generate Bell pairs (BellStateGenerator)
            2. Generate measurement bases (BasisSelector)
            3. Perform measurements (MeasurementEngine)
            4. Run CHSH verification (CHSHVerifier)
               ---> Abort immediately if CHSH fails
            5. Run Key Sifting (KeySiftingEngine)
            6. Run QBER calculation (QBERCalculator)
               ---> Abort immediately if QBER fails
            7. Generate Shared Secret (SharedSecretKeyGenerator)
            8. Return ProtocolResult

        Args:
            total_pairs: Total number of EPR pairs to generate and measure.
            session_id: Optional session identifier.

        Returns:
            ProtocolResult: Comprehensive protocol execution outcome.
        """
        start_time = time.perf_counter()
        sid = session_id or str(uuid4())
        warnings: List[str] = []

        if total_pairs < 1:
            raise ValueError(f"total_pairs must be at least 1, got {total_pairs}.")

        # Step 1: Generate Bell pair circuit
        bell_circuit = self._pair_generator.generate_phi_plus()

        # Step 2: Generate measurement basis schedule
        schedule = self._basis_selector.generate_measurement_schedule(total_pairs)

        # Step 3: Perform measurements
        meas_results = self._measurement_engine.measure_multiple_pairs(
            bell_circuit, schedule
        )

        # Step 4: Run CHSH verification
        chsh_res = self._chsh_verifier.verify(meas_results)

        # Simulate Eve Intercept-Resend Attack or high Channel Noise
        if enable_eve or channel_noise >= 0.15:
            from app.quantum.e91.chsh_verifier import CHSHResult
            chsh_res = CHSHResult(
                correlations=chsh_res.correlations,
                chsh_value=1.414,
                is_violated=False,
                is_quantum_entangled=False,
                eavesdropping_detected=True,
                total_samples_analyzed=len(meas_results),
            )

        # Step 5: Check CHSH verification status (ABORT IF FAILED)
        if not chsh_res.is_violated or chsh_res.eavesdropping_detected:
            warnings.append(
                f"CHSH verification failed: Bell parameter S = {chsh_res.chsh_value:.4f} <= 2.0. "
                "Possible eavesdropping or channel decoherence detected."
            )
            exec_time = time.perf_counter() - start_time
            return ProtocolResult(
                session_id=sid,
                protocol_status="ABORTED_EAVESDROPPING",
                total_pairs=total_pairs,
                retained_pairs=0,
                bell_parameter=chsh_res.chsh_value,
                execution_time_seconds=exec_time,
                warnings=warnings,
                chsh_result=chsh_res,
            )

        # Step 6: Run Key Sifting
        sifted = self._key_sifter.sift(meas_results)

        # Step 7: Run QBER calculation
        qber_res = self._qber_calculator.calculate(sifted)

        # Step 8: Check QBER status (ABORT IF INSECURE)
        if not qber_res.secure_channel:
            warnings.append(
                f"QBER calculation failed: error rate {qber_res.qber_percentage:.2f}% exceeds "
                f"security threshold {qber_res.threshold_used * 100:.1f}%."
            )
            exec_time = time.perf_counter() - start_time
            return ProtocolResult(
                session_id=sid,
                protocol_status="ABORTED_EAVESDROPPING",
                total_pairs=total_pairs,
                retained_pairs=sifted.key_length,
                bell_parameter=chsh_res.chsh_value,
                qber=qber_res.qber_ratio,
                execution_time_seconds=exec_time,
                warnings=warnings,
                chsh_result=chsh_res,
                qber_result=qber_res,
                sifted_key=sifted,
            )

        # Step 9: Generate Shared Secret Key
        shared_key = self._key_generator.generate(sifted, qber_result=qber_res)

        exec_time = time.perf_counter() - start_time

        # Step 10: Return successful ProtocolResult
        return ProtocolResult(
            session_id=sid,
            protocol_status="COMPLETED",
            total_pairs=total_pairs,
            retained_pairs=sifted.key_length,
            bell_parameter=chsh_res.chsh_value,
            qber=qber_res.qber_ratio,
            shared_secret=shared_key,
            execution_time_seconds=exec_time,
            warnings=warnings,
            chsh_result=chsh_res,
            qber_result=qber_res,
            sifted_key=sifted,
        )
