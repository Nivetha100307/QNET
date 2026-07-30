from typing import Dict
from app.core.logging_config import logger


def derive_fidelity_from_gamma(gamma: float) -> float:
    """Derives quantum state fidelity F relative to ideal Bell state |Phi+> from channel visibility gamma.

    Simulation Assumption (Simplified Depolarizing Channel):
        Fidelity = (1 + gamma) / 2

    Args:
        gamma (float): Effective channel visibility [0.0, 1.0].

    Returns:
        float: State fidelity bounded within [0.50, 1.0].
    """
    gamma_clamped = max(0.0, min(1.0, float(gamma)))
    fidelity = (1.0 + gamma_clamped) / 2.0
    fidelity_val = round(fidelity, 4)
    logger.info(f"Fidelity derived from channel gamma={gamma_clamped:.4f}: {fidelity_val * 100:.2f}%.")
    return fidelity_val


def estimate_quantum_fidelity(
    bell_correlations: Dict[str, float],
    qber: float
) -> float:
    """Estimates quantum state fidelity F relative to ideal entangled Bell state |Phi+>."""
    e_zz = bell_correlations.get("ZZ", bell_correlations.get("a1b1", 1.0))
    e_xx = bell_correlations.get("XX", bell_correlations.get("a2b2", 1.0))

    f_corr = (1.0 + abs(e_zz) + abs(e_xx)) / 4.0
    f_qber = 1.0 - qber
    estimated_f = (f_corr + f_qber) / 2.0
    return max(0.0, min(1.0, round(estimated_f, 4)))
