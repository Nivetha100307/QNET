from typing import Tuple, Dict, Any
from app.security.utils import THRESHOLDS, SecurityThresholds
from app.core.logging_config import logger


def evaluate_security_status(
    chsh_value: float,
    qber: float,
    fidelity: float,
    thresholds: SecurityThresholds = THRESHOLDS
) -> Tuple[str, int, Dict[str, Any]]:
    """Sequential E91 Security Decision Engine with 2 Hard Gatekeepers, Quality Assessment & Weighted Score.

    Step 7 & Step 8 Rules:
        Gate 1 (CHSH Bell Inequality Test):
            if |S| <= 2.0:
                Status: 'Quantum Channel Rejected'
                Bell Test: FAIL
                Raw Key: Discarded
                Module 5: Disabled
                STOP

        Gate 2 (QBER Error Rate Check):
            if QBER >= 11% (0.11):
                Status: 'Quantum Channel Rejected'
                Raw Key: Discarded
                Module 5: Disabled
                STOP

        Quality Assessment:
            if Fidelity >= 95% (0.95):
                Status: 'Quantum Channel Verified' (Verified)
            else:
                Status: 'Quantum Channel Degraded' (Degraded)

        Weighted Security Score:
            Score = 40% * (CHSH / 2.8284 * 100) + 35% * ((1 - QBER) * 100) + 25% * (Fidelity * 100)
            Clamped strictly to [0, 100].

    Returns:
        Tuple[str, int, Dict[str, Any]]: (status_string, security_score, decision_metadata)
    """
    abs_s = abs(chsh_value)

    # 1. Gate 1: CHSH Inequality Test (Bell Violation Gatekeeper)
    if abs_s <= thresholds.CHSH_THRESHOLD:
        status = "Quantum Channel Rejected"
        # Score calculation clamped for rejection state
        score = max(0, min(45, int(round((abs_s / thresholds.CHSH_MAX) * 40.0))))
        decision_meta = {
            "gate_1_chsh_pass": False,
            "gate_2_qber_pass": False,
            "key_accepted": False,
            "scada_module_5_enabled": False,
            "rejection_reason": f"Bell inequality not violated (|S| = {abs_s:.3f} <= 2.0). Quantum entanglement unproven."
        }
        logger.warning(f"E91 Gate 1 FAILED: CHSH S = {abs_s:.3f} <= 2.0. Quantum session rejected.")
        return status, score, decision_meta

    # 2. Gate 2: QBER Error Rate Check (E91 Key Generation Bound)
    if qber >= thresholds.QBER_WARNING:
        status = "Quantum Channel Rejected"
        score = max(0, min(45, int(round(45.0 - qber * 100.0))))
        decision_meta = {
            "gate_1_chsh_pass": True,
            "gate_2_qber_pass": False,
            "key_accepted": False,
            "scada_module_5_enabled": False,
            "rejection_reason": f"QBER error rate ({qber * 100.0:.1f}%) exceeds E91 security bound (11.0%). High eavesdropping risk."
        }
        logger.warning(f"E91 Gate 2 FAILED: QBER = {qber * 100.0:.1f}% >= 11.0%. Quantum session rejected.")
        return status, score, decision_meta

    # 3. Quality Assessment Stage (Fidelity & Scoring)
    if fidelity >= thresholds.FIDELITY_SECURE:
        status = "Quantum Channel Verified"
    else:
        status = "Quantum Channel Degraded"

    # Compute weighted score: 40% CHSH, 35% QBER, 25% Fidelity
    chsh_score = min(100.0, (abs_s / thresholds.CHSH_MAX) * 100.0)
    qber_score = max(0.0, (1.0 - qber) * 100.0)
    fidelity_score = max(0.0, min(100.0, fidelity * 100.0))

    weighted_score = int(round(0.40 * chsh_score + 0.35 * qber_score + 0.25 * fidelity_score))
    score = max(0, min(100, weighted_score))

    decision_meta = {
        "gate_1_chsh_pass": True,
        "gate_2_qber_pass": True,
        "key_accepted": True,
        "scada_module_5_enabled": True,
        "rejection_reason": None
    }

    logger.info(
        f"E91 Security Decision Engine: Status = '{status}', Score = {score}/100 "
        f"(CHSH={chsh_value:.3f}, QBER={qber*100:.1f}%, Fidelity={fidelity*100:.1f}%)."
    )

    return status, score, decision_meta
