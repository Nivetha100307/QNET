"""
Hybrid Security Policy Engine.
Provides configurable, rule-based policy evaluation for quantum channel health,
PQC fallback triggers, and automatic quantum channel re-probing recovery.
"""

from typing import Dict, Any, List


class PolicyRule:
    def __init__(self, name: str, condition_type: str, threshold: float, action: str, description: str):
        self.name = name
        self.condition_type = condition_type  # 'QBER_MAX', 'CHSH_MIN', 'FIDELITY_MIN', 'CONSECUTIVE_PROBES_MAX'
        self.threshold = threshold
        self.action = action  # 'TRIGGER_PQC_FALLBACK', 'BUFFER_PACKETS', 'RETURN_TO_QUANTUM', 'LOCK_PQC_ONLY'
        self.description = description


class HybridPolicyEngine:
    """Configurable Hybrid Cryptography & Channel Policy Evaluator."""

    def __init__(self):
        self.rules: List[PolicyRule] = [
            PolicyRule(
                name="Policy_A_QBER_Threshold",
                condition_type="QBER_MAX",
                threshold=11.0,
                action="TRIGGER_PQC_FALLBACK",
                description="If QBER >= 11.0%, quantum channel is compromised or degraded; switch to ML-KEM PQC mode."
            ),
            PolicyRule(
                name="Policy_B_CHSH_Violation",
                condition_type="CHSH_MIN",
                threshold=2.0,
                action="BUFFER_PACKETS",
                description="If CHSH < 2.0 (Bell test failure), buffer incoming SCADA packets in priority queue."
            ),
            PolicyRule(
                name="Policy_C_Quantum_Restoration",
                condition_type="RESTORE_HEALTH",
                threshold=5.0,  # QBER < 5% and CHSH > 2.2
                action="RETURN_TO_QUANTUM",
                description="If QBER < 5.0% and CHSH > 2.2 on probe, return seamlessly to E91/GHZ Quantum mode."
            ),
            PolicyRule(
                name="Policy_D_Max_Probe_Failures",
                condition_type="CONSECUTIVE_PROBES_MAX",
                threshold=5.0,
                action="LOCK_PQC_ONLY",
                description="If 5 consecutive quantum probes fail, lock channel in PQC_ONLY mode until admin reset."
            )
        ]

    def evaluate_security_metrics(self, qber: float, chsh: float, fidelity: float) -> Dict[str, Any]:
        """
        Evaluate physical quantum metrics against policy rules.
        Returns evaluation result with recommended action.
        """
        violations = []
        recommended_action = "MAINTAIN_QUANTUM"

        if qber >= 11.0:
            violations.append(f"QBER {qber:.1f}% exceeds max threshold 11.0%")
            recommended_action = "TRIGGER_PQC_FALLBACK"

        if chsh < 2.0:
            violations.append(f"CHSH {chsh:.2f} violates Bell Inequality limit 2.0")
            if recommended_action != "TRIGGER_PQC_FALLBACK":
                recommended_action = "BUFFER_PACKETS"

        if fidelity < 80.0:
            violations.append(f"Entanglement Fidelity {fidelity:.1f}% below minimum 80.0%")
            recommended_action = "TRIGGER_PQC_FALLBACK"

        is_healthy_for_restoration = (qber < 5.0 and chsh >= 2.2 and fidelity >= 92.0)

        return {
            "policy_passed": len(violations) == 0,
            "violations": violations,
            "recommended_action": recommended_action,
            "is_healthy_for_restoration": is_healthy_for_restoration
        }

    def get_policy_summary(self) -> List[Dict[str, Any]]:
        """Return list of active security policies."""
        return [
            {
                "name": r.name,
                "condition": r.condition_type,
                "threshold": r.threshold,
                "action": r.action,
                "description": r.description
            }
            for r in self.rules
        ]


# Singleton Policy Engine
policy_engine = HybridPolicyEngine()
