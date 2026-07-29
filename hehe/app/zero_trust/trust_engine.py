import time
from typing import Dict, Any
from app.zero_trust.identity_service import ZERO_TRUST_IDENTITY_REGISTRY

class TrustEvaluationEngine:
    """
    Component 12 & 18: Trust Evaluation Engine (Innovation Layer)
    Dynamically adjusts device trust scores (0-100) based on real-time security events, auth failures, replay attempts, and packet tampering.
    Automatically isolates devices when trust drops below threshold (50.0).
    """

    @staticmethod
    def get_trust_score(device_id: str) -> Dict[str, Any]:
        """Retrieve current trust score and reputation metrics."""
        record = ZERO_TRUST_IDENTITY_REGISTRY.get(device_id)
        if not record:
            return {"device_id": device_id, "trust_score": 0.0, "reputation": "UNKNOWN", "threat_level": "CRITICAL", "status": "UNREGISTERED"}

        score = record.get("trust_score", 100.0)
        reputation = "EXCELLENT" if score >= 90 else ("GOOD" if score >= 75 else ("SUSPICIOUS" if score >= 50 else "COMPROMISED"))
        threat = "LOW" if score >= 90 else ("MEDIUM" if score >= 75 else ("HIGH" if score >= 50 else "CRITICAL"))

        return {
            "device_id": device_id,
            "trust_score": round(score, 1),
            "reputation": reputation,
            "threat_level": threat,
            "status": record.get("status", "ACTIVE"),
            "last_incident": record.get("last_incident")
        }

    @staticmethod
    def penalize_trust_score(device_id: str, incident_type: str, penalty_points: float, reason: str) -> float:
        """
        Applies dynamic penalty points to a device's trust score.
        If score drops below 50.0, device status is set to ISOLATED!
        """
        if device_id not in ZERO_TRUST_IDENTITY_REGISTRY:
            return 0.0

        record = ZERO_TRUST_IDENTITY_REGISTRY[device_id]
        current_score = record.get("trust_score", 100.0)
        new_score = max(0.0, current_score - penalty_points)

        record["trust_score"] = new_score
        record["last_incident"] = f"{incident_type}: {reason}"

        if new_score < 50.0 and record["status"] == "ACTIVE":
            record["status"] = "ISOLATED"
            record["isolation_reason"] = f"Trust score dropped below 50.0 ({new_score:.1f}) due to {incident_type}"

        return new_score

    @staticmethod
    def reward_trust_score(device_id: str, reward_points: float = 1.0) -> float:
        """Gradually rewards trust score for continuous clean operations up to 100.0."""
        if device_id not in ZERO_TRUST_IDENTITY_REGISTRY:
            return 0.0

        record = ZERO_TRUST_IDENTITY_REGISTRY[device_id]
        current_score = record.get("trust_score", 100.0)
        new_score = min(100.0, current_score + reward_points)
        record["trust_score"] = new_score
        return new_score

trust_engine = TrustEvaluationEngine()
