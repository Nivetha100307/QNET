"""
Port: IQKDProtocol.

Common contract for any quantum key distribution protocol (E91, and
later BB84/B92). Lets services run "a QKD protocol" without knowing
which one, and lets new protocols be added without changing callers
(Open/Closed Principle).

Implementations live in app/quantum/e91/ and app/quantum/protocols/.
"""

from abc import ABC, abstractmethod

from app.domain.entities.qkd_session import QKDResult


class IQKDProtocol(ABC):
    @abstractmethod
    def run(self, num_bits: int) -> QKDResult:
        """Execute the protocol end-to-end and return a sifted-key result."""
        raise NotImplementedError
