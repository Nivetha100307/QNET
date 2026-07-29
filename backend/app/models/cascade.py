from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from app.database.connection import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class CascadeSession(Base):
    """SQLAlchemy model representing Cascade error correction & Toeplitz privacy amplification records."""

    __tablename__ = "cascade_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_uuid: Mapped[str] = mapped_column(String(36), unique=True, index=True, nullable=False)
    bit_errors_corrected: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    remaining_qber: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    privacy_amplification_status: Mapped[str] = mapped_column(String(30), nullable=False, default="COMPLETED")
    isolation_forest_anomaly_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.05)
    anomaly_detected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
