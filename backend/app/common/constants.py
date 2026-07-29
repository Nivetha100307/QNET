"""Default constants for QNetSecure Quantum SCADA Framework."""

DEFAULT_QUANTUM_LATENCY_MS: float = 10.0
DEFAULT_QUANTUM_PHOTON_LOSS: float = 0.0
DEFAULT_QUANTUM_NOISE_LEVEL: float = 0.0

DEFAULT_CLASSICAL_LATENCY_MS: float = 5.0
DEFAULT_CLASSICAL_AUTHENTICATION_READY: bool = True
DEFAULT_CLASSICAL_ENCRYPTION_READY: bool = False

SUPPORTED_SCADA_NODES = [
    "Control_Center",
    "Substation_A",
    "Substation_B",
    "Substation_C",
    "Substation_D"
]
