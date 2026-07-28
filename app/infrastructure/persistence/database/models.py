"""SQLAlchemy ORM Data Models for Supabase PostgreSQL persistence."""

from datetime import datetime, timezone
import uuid
from typing import Any, Dict, List, Optional

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.persistence.database.base import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SessionModel(Base):
    """SQLAlchemy ORM model for QKD Session results."""

    __tablename__ = "sessions"

    session_id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    backend: Mapped[str] = mapped_column(String(128), default="AerSimulator")
    status: Mapped[str] = mapped_column(String(64), index=True, default="COMPLETED")
    bell_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    qber: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    execution_time: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    key_length: Mapped[int] = mapped_column(Integer, default=128)
    shared_key: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    eavesdropping_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    events: Mapped[List["EventModel"]] = relationship("EventModel", back_populates="session", cascade="all, delete-orphan")
    measurements: Mapped[List["MeasurementModel"]] = relationship("MeasurementModel", back_populates="session", cascade="all, delete-orphan")
    metrics: Mapped[List["MetricModel"]] = relationship("MetricModel", back_populates="session", cascade="all, delete-orphan")


class EventModel(Base):
    """SQLAlchemy ORM model for live WebSocket protocol events."""

    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.session_id", ondelete="CASCADE"), index=True)
    event_type: Mapped[str] = mapped_column(String(64), index=True)
    payload: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    session: Mapped["SessionModel"] = relationship("SessionModel", back_populates="events")


class MeasurementModel(Base):
    """SQLAlchemy ORM model for quantum photon measurement results."""

    __tablename__ = "measurements"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.session_id", ondelete="CASCADE"), index=True)
    alice_basis: Mapped[float] = mapped_column(Float)
    bob_basis: Mapped[float] = mapped_column(Float)
    alice_measurement: Mapped[int] = mapped_column(Integer)
    bob_measurement: Mapped[int] = mapped_column(Integer)
    is_kept: Mapped[bool] = mapped_column(Boolean, default=False)

    session: Mapped["SessionModel"] = relationship("SessionModel", back_populates="measurements")


class MetricModel(Base):
    """SQLAlchemy ORM model for protocol performance metrics."""

    __tablename__ = "metrics"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(64), ForeignKey("sessions.session_id", ondelete="CASCADE"), index=True)
    bell_parameter: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    qber: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    execution_time: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    key_length: Mapped[int] = mapped_column(Integer, default=128)
    success_rate: Mapped[float] = mapped_column(Float, default=1.0)

    session: Mapped["SessionModel"] = relationship("SessionModel", back_populates="metrics")
