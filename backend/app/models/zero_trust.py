from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database.connection import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ZeroTrustAuditLog(Base):
    """SQLAlchemy model representing 20-stage Zero-Trust verification & attack simulation audit logs."""

    __tablename__ = "zero_trust_audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_uuid: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    packet_id: Mapped[str] = mapped_column(String(36), nullable=False)
    decision: Mapped[str] = mapped_column(String(10), nullable=False)  # "ALLOW" or "BLOCK"
    trust_score: Mapped[float] = mapped_column(Float, nullable=False)   # 0.0 to 100.0
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)    # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    checks_passed: Mapped[int] = mapped_column(Integer, nullable=False) # e.g. 20
    failed_checks: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    rationale: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
