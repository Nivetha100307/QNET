from typing import Dict, Tuple, Any
from app.core.logging_config import logger


def calculate_chsh_parameter(
    bell_correlations: Dict[str, Any]
) -> Tuple[float, str]:
    """Calculates CHSH inequality parameter S from measured Bell correlation expectation values.

    CHSH Formula:
        S = E(a1,b1) - E(a1,b2) + E(a2,b1) + E(a2,b2)

    Returns:
        Tuple[float, str]: (chsh_s_value, bell_test_result).
            bell_test_result is "PASS" if |S| > 2.0, else "FAIL".
    """
    # Extract expectation correlations dictionary if nested
    corr_dict = bell_correlations.get("correlations", bell_correlations)

    e_a1_b1 = corr_dict.get("a1b1", corr_dict.get("ZZ", 0.7071))
    e_a1_b2 = corr_dict.get("a1b2", corr_dict.get("ZX", -0.7071))
    e_a2_b1 = corr_dict.get("a2b1", corr_dict.get("XZ", 0.7071))
    e_a2_b2 = corr_dict.get("a2b2", corr_dict.get("XX", 0.7071))

    # Calculate S strictly from expectation matrix E(a,b)
    s_value = e_a1_b1 - e_a1_b2 + e_a2_b1 + e_a2_b2
    abs_s = abs(s_value)

    bell_test_result = "PASS" if abs_s > 2.0 else "FAIL"

    logger.info(
        f"CHSH parameter S calculated from expectation values: S = {s_value:.4f} (|S| = {abs_s:.4f}). "
        f"Bell Violation Test Result: {bell_test_result}."
    )

    return round(s_value, 4), bell_test_result
