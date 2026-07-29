from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class KeyManagementContext:
    """Carries complete state during Quantum Key Management lifecycle execution."""
    session_uuid: str

    alice_basis: List[str] = field(default_factory=list)
    bob_basis: List[str] = field(default_factory=list)

    alice_bits: List[int] = field(default_factory=list)
    bob_bits: List[int] = field(default_factory=list)

    matching_indexes: List[int] = field(default_factory=list)

    alice_key: str = ""
    bob_key: str = ""
    shared_key: str = ""
    key_length: int = 0

    generation_status: str = "INITIALIZED"
    error_message: Optional[str] = None

    def to_dict(self) -> dict:
        """Converts key management context to dictionary representation."""
        return {
            "session_uuid": self.session_uuid,
            "matching_indexes": self.matching_indexes,
            "key_length": self.key_length,
            "alice_key": self.alice_key,
            "bob_key": self.bob_key,
            "shared_key": self.shared_key,
            "generation_status": self.generation_status,
            "error_message": self.error_message
        }
