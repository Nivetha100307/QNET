from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database.connection import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SCADAPacket(Base):
    """SQLAlchemy model representing encrypted SCADA packets for Module 5."""

    __tablename__ = "scada_packets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    packet_id: Mapped[str] = mapped_column(String(36), unique=True, index=True, nullable=False)
    session_uuid: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    source_node: Mapped[str] = mapped_column(String(50), nullable=False)
    destination_node: Mapped[str] = mapped_column(String(50), nullable=False)
    command: Mapped[str] = mapped_column(String(100), nullable=False)
    ciphertext_b64: Mapped[str] = mapped_column(String, nullable=False)
    nonce_b64: Mapped[str] = mapped_column(String, nullable=False)
    tag_b64: Mapped[str] = mapped_column(String, nullable=False)
    hmac_signature: Mapped[str] = mapped_column(String, nullable=False)
    sequence_number: Mapped[int] = mapped_column(Integer, nullable=False)
    execution_status: Mapped[str] = mapped_column(String(30), nullable=False, default="EXECUTED")
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utc_now)
