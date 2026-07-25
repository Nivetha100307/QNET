"""
Application-wide exception hierarchy.

Domain/service/quantum code should raise these instead of generic
Exceptions, so the API layer can map them to consistent HTTP responses
in one place (see app/main.py exception handlers).
"""


class EntangleNetError(Exception):
    """Base class for all application-specific errors."""


class QuantumBackendError(EntangleNetError):
    """Raised when a Qiskit/Aer backend fails to execute a circuit."""


class ProtocolExecutionError(EntangleNetError):
    """Raised when a QKD protocol (e.g. E91) fails mid-run."""


class EavesdropDetectedError(EntangleNetError):
    """Raised when eavesdropping is detected (e.g. CHSH violation threshold)."""


class InvalidChannelStateError(EntangleNetError):
    """Raised when a quantum channel is used in an invalid state."""


class ResourceNotFoundError(EntangleNetError):
    """Raised when a requested entity (session, node, key) does not exist."""


class ConfigurationError(EntangleNetError):
    """Raised on invalid or missing configuration at startup."""
