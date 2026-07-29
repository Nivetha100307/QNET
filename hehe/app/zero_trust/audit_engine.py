import time
from typing import Dict, Any, List
from app.db.audit_logger import AuditLogger
from app.api.websockets import ws_manager

class ZeroTrustAuditEngine:
    """
    Component 14 & 15: Audit Trail Engine & Security Event Engine
    Permanently logs all verification checks, authentication attempts, authorization decisions, replay attacks, and trust score changes.
    Streams security events over WebSockets in real time.
    """

    @staticmethod
    async def record_decision_event(
        device_id: str,
        packet_id: str,
        decision: str,
        overall_risk: str,
        checks_passed: int,
        checks_failed: int,
        rationale: str,
        step_breakdown: list
    ):
        """Record complete Security Decision Engine result."""
        # 1. DB Audit Log
        await AuditLogger.log_event(
            who=device_id,
            what=f"ZERO_TRUST_DECISION: {decision}",
            where_loc="SECURITY_DECISION_ENGINE",
            result=decision,
            why=rationale,
            details={
                "packet_id": packet_id,
                "overall_risk": overall_risk,
                "checks_passed": checks_passed,
                "checks_failed": checks_failed,
                "step_breakdown": step_breakdown
            }
        )

        # 2. WebSocket Real-Time Event Broadcast
        await ws_manager.broadcast("ZERO_TRUST_DECISION", {
            "device_id": device_id,
            "packet_id": packet_id,
            "decision": decision,
            "overall_risk": overall_risk,
            "checks_passed": checks_passed,
            "checks_failed": checks_failed,
            "rationale": rationale,
            "step_breakdown": step_breakdown,
            "timestamp": time.time()
        })

    @staticmethod
    async def record_security_event(
        event_type: str,
        severity: str,
        device_id: str,
        description: str
    ):
        """Record specific security threat event and broadcast alert."""
        await AuditLogger.log_alert(
            alert_type=event_type,
            severity=severity,
            source=device_id,
            description=description
        )

        await ws_manager.broadcast("SECURITY_ALERT", {
            "event_type": event_type,
            "severity": severity,
            "device_id": device_id,
            "description": description,
            "timestamp": time.time()
        })
