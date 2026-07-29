from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database.connection import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class RepeaterNode(Base):
    """SQLAlchemy model representing Quantum Repeater nodes and Entanglement Swapping state."""

    __tablename__ = "repeater_nodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    repeater_id: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ONLINE")
    memory_fidelity: Mapped[float] = mapped_column(Float, nullable=False, default=0.95)
    swapping_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
