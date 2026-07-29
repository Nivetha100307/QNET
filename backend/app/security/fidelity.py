from typing import Dict
from app.core.logging_config import logger


def estimate_quantum_fidelity(
    bell_correlations: Dict[str, float],
    qber: float
) -> float:
    """Estimates quantum state fidelity F relative to ideal entangled Bell state |Phi+>.

    Note: This is an estimated fidelity derived from measured Bell-state correlations E(a,b)
    and QBER, as full quantum state tomography is not executed on every shot.

    Derivation:
        F_corr = (1 + E(Z,Z) + E(X,X)) / 4
        F_qber = 1.0 - qber
        F = (F_corr + F_qber) / 2

    Args:
        bell_correlations (Dict[str, float]): Measured Bell correlation matrix.
        qber (float): Calculated Quantum Bit Error Rate (0.0 to 1.0).

    Returns:
        float: Estimated state fidelity bounded within [0.0, 1.0].
    """
    e_zz = bell_correlations.get("ZZ", 1.0)
    e_xx = bell_correlations.get("XX", 1.0)

    # Correlation component
    f_corr = (1.0 + abs(e_zz) + abs(e_xx)) / 4.0

    # QBER component
    f_qber = 1.0 - qber

    # Combined estimated fidelity
    estimated_f = (f_corr + f_qber) / 2.0

    # Clamp strictly to [0.0, 1.0]
    final_fidelity = max(0.0, min(1.0, round(estimated_f, 4)))

    logger.info(f"Estimated quantum state fidelity: {final_fidelity:.4f} (Derived from correlations & QBER).")
    return final_fidelity
