from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.database.connection import Base
from app.models.session import utc_now


class QuantumKey(Base):
    """SQLAlchemy model representing reconciled and sifted quantum shared secret keys for an E91 session."""

    __tablename__ = "quantum_keys"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_uuid = Column(String(36), unique=True, index=True, nullable=False)

    key_length = Column(Integer, nullable=False, default=0)
    matching_indexes = Column(JSON, nullable=False, default=list)

    alice_key = Column(Text, nullable=False, default="")
    bob_key = Column(Text, nullable=False, default="")
    shared_key = Column(Text, nullable=False, default="")

    generation_status = Column(String(30), nullable=False, default="STARTED")
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)

    def __repr__(self) -> str:
        return f"<QuantumKey(session_uuid='{self.session_uuid}', status='{self.generation_status}', length={self.key_length})>"
