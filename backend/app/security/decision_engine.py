from typing import Tuple
from app.security.utils import THRESHOLDS, SecurityThresholds
from app.core.logging_config import logger


def evaluate_security_status(
    chsh_value: float,
    qber: float,
    fidelity: float,
    thresholds: SecurityThresholds = THRESHOLDS
) -> Tuple[str, int]:
    """Evaluates Security Decision ('SECURE', 'WARNING', 'COMPROMISED') and normalized score (0-100).

    Business Rules:
        If CHSH > CHSH_SECURE (2.0) AND QBER <= QBER_SECURE (0.11) AND Fidelity >= FIDELITY_SECURE (0.85):
            Return "SECURE"
        Else if CHSH > CHSH_WARNING (1.8) OR QBER <= QBER_WARNING (0.15) OR Fidelity >= FIDELITY_WARNING (0.70):
            Return "WARNING"
        Else:
            Return "COMPROMISED"

    Score Formula:
        Score = clamp(0, 100, (|S| / 2.8284 * 50) + ((1 - QBER) * 30) + (Fidelity * 20))

    Args:
        chsh_value (float): Calculated CHSH parameter S.
        qber (float): Quantum Bit Error Rate (0.0 to 1.0).
        fidelity (float): Quantum state fidelity (0.0 to 1.0).
        thresholds (SecurityThresholds): Configured threshold boundaries.

    Returns:
        Tuple[str, int]: Tuple containing (security_status, security_score).
    """
    abs_s = abs(chsh_value)

    # 1. Determine Security Decision Status
    if (
        abs_s > thresholds.CHSH_SECURE and
        qber <= thresholds.QBER_SECURE and
        fidelity >= thresholds.FIDELITY_SECURE
    ):
        status = "SECURE"
    elif (
        abs_s > thresholds.CHSH_WARNING or
        qber <= thresholds.QBER_WARNING or
        fidelity >= thresholds.FIDELITY_WARNING
    ):
        status = "WARNING"
    else:
        status = "COMPROMISED"

    # 2. Compute Normalized Security Score (0 to 100)
    chsh_component = min(50.0, (abs_s / 2.8284) * 50.0)
    qber_component = max(0.0, (1.0 - qber) * 30.0)
    fidelity_component = max(0.0, min(20.0, fidelity * 20.0))

    raw_score = int(round(chsh_component + qber_component + fidelity_component))
    score = max(0, min(100, raw_score))

    logger.info(
        f"Security Decision Engine evaluated: Status = '{status}', "
        f"Score = {score}/100 (CHSH={chsh_value:.3f}, QBER={qber*100:.1f}%, Fidelity={fidelity:.3f})."
    )

    return status, score
