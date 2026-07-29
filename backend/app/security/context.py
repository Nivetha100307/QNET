from dataclasses import dataclass, field
from typing import List, Dict, Optional


@dataclass
class SecurityAnalysisContext:
    """Execution context containing quantum measurement data and intermediate calculation results."""
    session_uuid: str
    alice_basis: List[str]
    bob_basis: List[str]
    alice_bits: List[int]
    bob_bits: List[int]
    matching_indexes: List[int]
    shared_key: str

    # Computed metrics
    bell_correlations: Dict[str, float] = field(default_factory=dict)
    chsh_value: float = 0.0
    bell_test_result: str = "FAIL"
    qber: float = 0.0
    fidelity: float = 0.0
    security_status: str = "COMPROMISED"
    security_score: int = 0
    analysis_time_ms: float = 0.0

    @property
    def total_shots(self) -> int:
        """Returns total measurement shots count."""
        return len(self.alice_basis)
