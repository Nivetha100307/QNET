from typing import Optional
from app.models.session import QuantumSession
from app.models.quantum_measurement import QuantumMeasurement
from app.common.enums import SessionStatus


class KeyValidationException(ValueError):
    """Raised when Module 3 key management business rules are violated."""
    pass


def validate_session_for_key_generation(session: Optional[QuantumSession]) -> QuantumSession:
    """Validates that a session exists and is in ACTIVE status.

    Business Rule 1: Session must exist.
    Business Rule 2: Session must be ACTIVE.

    Args:
        session (Optional[QuantumSession]): Session model instance.

    Returns:
        QuantumSession: Validated session instance.

    Raises:
        KeyValidationException: If session is None or not in ACTIVE state.
    """
    if not session:
        raise KeyValidationException("Target session not found.")

    if session.status != SessionStatus.ACTIVE.value:
        raise KeyValidationException(
            f"Cannot generate quantum key for session '{session.session_id}' in state '{session.status}'. "
            f"Session must be in '{SessionStatus.ACTIVE.value}' state."
        )

    return session


def validate_measurement_exists(measurement: Optional[QuantumMeasurement]) -> QuantumMeasurement:
    """Validates that quantum measurement results exist for the session.

    Business Rule 3: Measurement results must already exist.

    Args:
        measurement (Optional[QuantumMeasurement]): QuantumMeasurement model instance.

    Returns:
        QuantumMeasurement: Validated measurement instance.

    Raises:
        KeyValidationException: If measurement results are missing.
    """
    if not measurement:
        raise KeyValidationException(
            "Raw quantum measurement results do not exist for this session. "
            "Execute Module 2 E91 Quantum Engine first before generating keys."
        )

    if not measurement.alice_basis or not measurement.bob_basis:
        raise KeyValidationException(
            "Quantum measurement data is empty or corrupted."
        )

    return measurement


def validate_sifted_keys(alice_key: str, bob_key: str) -> None:
    """Validates that Alice's and Bob's sifted keys match in length.

    Business Rule 5: Alice and Bob sifted keys must have equal length.

    Args:
        alice_key (str): Alice's sifted key.
        bob_key (str): Bob's sifted key.

    Raises:
        KeyValidationException: If lengths differ.
    """
    if len(alice_key) != len(bob_key):
        raise KeyValidationException(
            f"Sifted key length mismatch: Alice={len(alice_key)}, Bob={len(bob_key)}."
        )
