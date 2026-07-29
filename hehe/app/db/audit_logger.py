import json
import time

from app.db.database import AsyncSessionLocal
from app.db.models import AuditLog, Alert

class AuditLogger:
    @staticmethod
    async def log_event(
        who: str,
        what: str,
        where_loc: str,
        result: str,
        why: str = None,
        details: dict = None
    ):
        """Record immutable audit trail entry."""
        async with AsyncSessionLocal() as db:
            log_entry = AuditLog(
                who=who,
                what=what,
                when_ts=time.time(),
                where_loc=where_loc,
                why=why or "SCADA operational requirement",
                result=result,
                details_json=json.dumps(details or {})
            )
            db.add(log_entry)
            await db.commit()

    @staticmethod
    async def log_alert(
        alert_type: str,
        severity: str,
        source: str,
        description: str
    ):
        """Record a security or system alert."""
        async with AsyncSessionLocal() as db:
            alert_entry = Alert(
                alert_type=alert_type,
                severity=severity,
                source=source,
                description=description,
                timestamp=time.time(),
                resolved=False
            )
            db.add(alert_entry)
            await db.commit()
