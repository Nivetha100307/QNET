from dataclasses import dataclass


@dataclass(frozen=True)
class SecurityThresholds:
    """Centralized threshold configuration for Quantum Security Monitor decision engine."""
    CHSH_SECURE: float = 2.0      # CHSH value S > 2.0 indicates non-local quantum entanglement (Secure)
    CHSH_WARNING: float = 1.8     # 1.8 < S <= 2.0 indicates weak entanglement / potential noise (Warning)

    QBER_SECURE: float = 0.11     # QBER <= 11% (Standard QKD security bound for error correction)
    QBER_WARNING: float = 0.15    # 11% < QBER <= 15% (High noise / degraded channel)

    FIDELITY_SECURE: float = 0.85 # Fidelity >= 0.85 (High Bell-state purity)
    FIDELITY_WARNING: float = 0.70# 0.70 <= Fidelity < 0.85 (Moderate decoherence)


THRESHOLDS = SecurityThresholds()


def round_metric(value: float, decimal_places: int = 4) -> float:
    """Rounds floating point security metric to requested precision."""
    return round(float(value), decimal_places)
