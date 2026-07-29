from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, JSON
from app.database.connection import Base
from app.models.session import utc_now


class QuantumMeasurement(Base):
    """SQLAlchemy model representing raw quantum measurements for an E91 session."""

    __tablename__ = "quantum_measurements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_uuid = Column(String(36), unique=True, index=True, nullable=False)
    
    protocol_version = Column(String(20), nullable=False, default="E91_v1")
    shots = Column(Integer, nullable=False, default=1024)
    bell_pair_count = Column(Integer, nullable=False, default=1024)
    
    # Raw Measurement Data
    alice_basis = Column(JSON, nullable=False, default=list)
    bob_basis = Column(JSON, nullable=False, default=list)
    alice_bits = Column(JSON, nullable=False, default=list)
    bob_bits = Column(JSON, nullable=False, default=list)
    
    # Status & Analytics Metadata
    measurement_status = Column(String(30), nullable=False, default="STARTED")
    execution_backend = Column(String(50), nullable=False, default="AerSimulator")
    simulation_time_ms = Column(Float, nullable=False, default=0.0)
    
    # Circuit Representations
    circuit_qasm = Column(Text, nullable=True)
    circuit_diagram = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)

    def __repr__(self) -> str:
        return f"<QuantumMeasurement(session_uuid='{self.session_uuid}', status='{self.measurement_status}', shots={self.shots})>"
