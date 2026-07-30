from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy import String, Integer, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


def utc_now() -> datetime:
    """Returns current UTC timestamp."""
    return datetime.now(timezone.utc)


class SystemAuditLog(Base):
    """SQLAlchemy model representing centralized system-wide audit logs across Modules 1 through 8."""

    __tablename__ = "system_audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_uuid: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    module_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    action: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    severity: Mapped[str] = mapped_column(String(20), index=True, nullable=False, default="INFO")
    
    operator_role: Mapped[str] = mapped_column(String(50), nullable=False, default="GRID_ADMIN")
    source_node: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    destination_node: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    details: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    def __repr__(self) -> str:
        return (
            f"<SystemAuditLog(id={self.id}, module='{self.module_id}', "
            f"action='{self.action}', severity='{self.severity}', time='{self.timestamp}')>"
        )
