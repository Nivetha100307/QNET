from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class E91SessionContext:
    """Carries complete state during E91 Quantum Communication Engine execution."""
    session_uuid: str
    shots: int = 1024
    bell_pair_count: int = 1024
    protocol_version: str = "E91_v1"
    
    alice_basis: List[str] = field(default_factory=list)
    bob_basis: List[str] = field(default_factory=list)
    
    alice_bits: List[int] = field(default_factory=list)
    bob_bits: List[int] = field(default_factory=list)
    
    circuit_qasm: Optional[str] = None
    circuit_diagram: Optional[str] = None
    
    execution_backend: str = "AerSimulator"
    simulation_time_ms: float = 0.0
    status: str = "INITIALIZED"

    def to_dict(self) -> dict:
        """Converts context state into a dictionary representation."""
        return {
            "session_uuid": self.session_uuid,
            "protocol_version": self.protocol_version,
            "shots": self.shots,
            "bell_pair_count": self.bell_pair_count,
            "alice_basis": self.alice_basis,
            "bob_basis": self.bob_basis,
            "alice_bits": self.alice_bits,
            "bob_bits": self.bob_bits,
            "circuit_qasm": self.circuit_qasm,
            "circuit_diagram": self.circuit_diagram,
            "execution_backend": self.execution_backend,
            "simulation_time_ms": self.simulation_time_ms,
            "status": self.status
        }
