import time
from typing import Dict, Any, List
from app.db.audit_logger import AuditLogger

class NotificationEngine:
    """
    Component 20: Notification Engine
    Generates real-time security alerts and system events for SCADA SOC operators and threat monitoring dashboards.
    """

    def __init__(self):
        self.alert_history: List[dict] = []

    async def raise_alert(
        self,
        alert_type: str,
        severity: str,
        source: str,
        description: str
    ) -> Dict[str, Any]:
        """
        Triggers a security alert, persists to database, and queues for WebSocket broadcast.
        """
        alert = {
            "alert_id": f"ALT_{len(self.alert_history) + 1001}",
            "alert_type": alert_type,
            "severity": severity.upper(), # INFO, WARNING, HIGH, CRITICAL
            "source": source,
            "description": description,
            "timestamp": time.time(),
            "resolved": False
        }
        
        self.alert_history.insert(0, alert)
        if len(self.alert_history) > 100:
            self.alert_history.pop()

        # Persist alert to Database Audit system
        await AuditLogger.log_alert(
            alert_type=alert_type,
            severity=severity,
            source=source,
            description=description
        )

        return alert

notification_engine = NotificationEngine()
