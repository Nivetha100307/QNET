"""IBM Quantum Hardware Backend Implementation."""

import logging
from typing import Any, Dict, Optional
try:
    from qiskit import transpile as qiskit_transpile
    from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2 as Sampler
except Exception:
    qiskit_transpile = None  # type: ignore
    QiskitRuntimeService = None  # type: ignore
    Sampler = None  # type: ignore

from app.quantum.backends.aer_backend import AerQuantumBackend
from app.quantum.backends.iquantum_backend import IQuantumBackend

logger = logging.getLogger(__name__)


class IBMQuantumBackend(IQuantumBackend):
    """Concrete implementation of IQuantumBackend targeting IBM Quantum Hardware."""

    def __init__(
        self,
        token: Optional[str] = None,
        instance: str = "ibm-q/open/main",
        backend_name_str: str = "ibm_brisbane",
        use_runtime: bool = True,
        fallback_to_simulator: bool = True,
    ) -> None:
        """Initialize IBMQuantumBackend with Qiskit Runtime / Hardware configuration."""
        self._token = token
        self._instance = instance
        self._backend_name = backend_name_str
        self._use_runtime = use_runtime
        self._fallback_to_simulator = fallback_to_simulator
        self._fallback_backend: Optional[AerQuantumBackend] = None
        self._service: Any = None
        self._hardware_backend: Any = None

        self._initialize_service()

    def _initialize_service(self) -> None:
        """Initialize connection to IBM Quantum Runtime Service."""
        try:
            if QiskitRuntimeService is not None:
                if self._token:
                    self._service = QiskitRuntimeService(
                        channel="ibm_quantum",
                        token=self._token,
                        instance=self._instance,
                    )
                else:
                    self._service = QiskitRuntimeService()

                if self._service:
                    self._hardware_backend = self._service.backend(self._backend_name)
            else:
                raise RuntimeError("qiskit_ibm_runtime is not installed.")
        except Exception as exc:
            logger.warning(
                f"Failed to connect to IBM Quantum hardware '{self._backend_name}': {exc}. "
                f"Fallback simulator mode = {self._fallback_to_simulator}."
            )
            if self._fallback_to_simulator:
                self._fallback_backend = AerQuantumBackend()

    def run_circuit(self, circuit: Any, shots: int = 1024) -> Dict[str, int]:
        """Execute a quantum circuit on IBM Quantum hardware (or fallback simulator)."""
        if self._hardware_backend is not None and self._service is not None:
            try:
                compiled = self.transpile(circuit)
                sampler = Sampler(backend=self._hardware_backend)
                job = sampler.run([compiled], shots=shots)
                result = job.result()
                pub_result = result[0]
                counts_dict = pub_result.data.meas.get_counts()
                return dict(counts_dict)
            except Exception as exc:
                logger.error(f"IBM Quantum hardware execution failed: {exc}.")
                if not self._fallback_to_simulator:
                    raise RuntimeError(
                        f"IBM Quantum hardware execution failed: {exc}"
                    ) from exc

        if not self._fallback_to_simulator:
            raise RuntimeError(
                f"IBM Quantum hardware execution failed: Backend '{self._backend_name}' is unavailable."
            )

        if self._fallback_backend is None:
            self._fallback_backend = AerQuantumBackend()

        return self._fallback_backend.run_circuit(circuit, shots=shots)

    def transpile(self, circuit: Any) -> Any:
        """Transpile circuit to target hardware coupling map and gate set."""
        if qiskit_transpile is not None:
            if self._hardware_backend is not None:
                try:
                    return qiskit_transpile(circuit, self._hardware_backend)
                except Exception:
                    pass
            try:
                return qiskit_transpile(circuit)
            except Exception:
                pass
        return circuit

    def backend_name(self) -> str:
        """Return target IBM physical backend name."""
        return self._backend_name

    def is_simulator(self) -> bool:
        """Return False indicating this backend targets physical quantum hardware."""
        return False
