from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy import String, Integer, Float, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base


def utc_now() -> datetime:
    """Returns current UTC timestamp."""
    return datetime.now(timezone.utc)


class QuantumSecurityReport(Base):
    """SQLAlchemy model representing persisted quantum security analysis reports for Module 4."""

    __tablename__ = "quantum_security_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_uuid: Mapped[str] = mapped_column(String(36), unique=True, index=True, nullable=False)
    
    # Bell correlation matrix E(a,b) stored as JSON/JSONB
    bell_correlations: Mapped[Dict[str, float]] = mapped_column(JSON, nullable=False, default=dict)
    
    # Security Metrics
    chsh_value: Mapped[float] = mapped_column(Float, nullable=False)
    bell_test_result: Mapped[str] = mapped_column(String(10), nullable=False)  # "PASS" or "FAIL"
    qber: Mapped[float] = mapped_column(Float, nullable=False)                 # e.g., 0.021 for 2.1%
    fidelity: Mapped[float] = mapped_column(Float, nullable=False)             # 0.0 to 1.0
    
    # Decision Engine outputs
    security_status: Mapped[str] = mapped_column(String(50), nullable=False)  # "Quantum Channel Verified", "Quantum Channel Degraded", "Quantum Channel Rejected"
    security_score: Mapped[int] = mapped_column(Integer, nullable=False)       # 0 to 100
    
    # Execution Metadata
    measurement_count: Mapped[int] = mapped_column(Integer, nullable=False)
    analysis_time_ms: Mapped[float] = mapped_column(Float, nullable=False)
    report_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)

    def __repr__(self) -> str:
        return (
            f"<QuantumSecurityReport(session_uuid='{self.session_uuid}', "
            f"status='{self.security_status}', score={self.security_score}, "
            f"chsh={self.chsh_value:.3f}, qber={self.qber:.3f}, fidelity={self.fidelity:.3f})>"
        )
