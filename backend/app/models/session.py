from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, JSON
from app.database.connection import Base

def utc_now() -> datetime:
    """Helper to return naive/aware UTC timestamp consistently."""
    return datetime.now(timezone.utc)

class QuantumSession(Base):
    """SQLAlchemy model representing a quantum-secured communication session."""
    
    __tablename__ = "quantum_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(String(36), unique=True, index=True, nullable=False)
    
    source_node = Column(String(50), nullable=False)
    destination_node = Column(String(50), nullable=False)
    protocol = Column(String(20), nullable=False, default="E91")
    session_type = Column(String(20), nullable=False, default="SIMULATION")
    status = Column(String(20), nullable=False, default="IDLE")
    
    # Session Topology & Channels
    route = Column(JSON, nullable=False, default=list)
    quantum_channel = Column(JSON, nullable=False, default=dict)
    classical_channel = Column(JSON, nullable=False, default=dict)
    node_status = Column(JSON, nullable=False, default=dict)
    
    # Session Metrics
    message_count = Column(Integer, nullable=False, default=0)
    bytes_transferred = Column(Integer, nullable=False, default=0)
    
    # Event Timeline
    timeline = Column(JSON, nullable=False, default=list)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)
    ended_at = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<QuantumSession(session_id='{self.session_id}', source='{self.source_node}', dest='{self.destination_node}', status='{self.status}')>"
