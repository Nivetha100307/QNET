from typing import Dict, Tuple
from app.core.logging_config import logger


def calculate_chsh_parameter(
    bell_correlations: Dict[str, float]
) -> Tuple[float, str]:
    """Calculates CHSH inequality parameter S from the measured Bell correlation matrix.

    Uses the actual basis configuration from Module 2 measurements:
    - E(Z,Z): Correlation when Alice=Z, Bob=Z
    - E(Z,X): Correlation when Alice=Z, Bob=X
    - E(X,Z): Correlation when Alice=X, Bob=Z
    - E(X,X): Correlation when Alice=X, Bob=X

    CHSH Formula:
        S = E(Z,Z) - E(Z,X) + E(X,Z) + E(X,X)

    Args:
        bell_correlations (Dict[str, float]): Dictionary of expectation values E(a,b).

    Returns:
        Tuple[float, str]: Tuple containing (chsh_s_value, bell_test_result).
            bell_test_result is "PASS" if |S| > 2.0, else "FAIL".
    """
    e_zz = bell_correlations.get("ZZ", 0.0)
    e_zx = bell_correlations.get("ZX", 0.0)
    e_xz = bell_correlations.get("XZ", 0.0)
    e_xx = bell_correlations.get("XX", 0.0)

    # Calculate S using the measured observables from Module 2
    s_value = e_zz - e_zx + e_xz + e_xx
    
    # In quantum mechanics with Bell pairs, maximum correlation occurs when S > 2.0
    abs_s = abs(s_value)
    bell_test_result = "PASS" if abs_s > 2.0 else "FAIL"

    logger.info(
        f"CHSH parameter S calculated: {s_value:.4f} (abs(S) = {abs_s:.4f}). "
        f"Bell Test Result: {bell_test_result}."
    )

    return round(s_value, 4), bell_test_result
