"""
Core domain entities related to a QKD (Quantum Key Distribution) run.

Plain dataclasses on purpose: no Pydantic, no FastAPI, no Qiskit types.
This keeps the domain layer importable/testable in total isolation.
API-facing shapes belong in app/schemas instead, and get mapped
to/from these entities at the service boundary.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import List
from uuid import UUID, uuid4


class SessionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    ABORTED_EAVESDROPPING = "aborted_eavesdropping"
    FAILED = "failed"


@dataclass
class QKDResult:
    """Outcome of running a QKD protocol (e.g. one E91 execution)."""

    session_id: UUID = field(default_factory=uuid4)
    raw_key_length: int = 0
    sifted_key: List[int] = field(default_factory=list)
    qber: float | None = None  # quantum bit error rate
    chsh_value: float | None = None  # CHSH S-value, for E91 eavesdrop check
    eavesdropping_detected: bool = False
    status: SessionStatus = SessionStatus.PENDING
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass
class QuantumNode:
    """A participant (e.g. Alice, Bob) in the quantum network graph."""

    node_id: UUID = field(default_factory=uuid4)
    label: str = ""
    is_online: bool = True
