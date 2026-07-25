"""
Port: IEavesdropDetector.

Abstraction over "is this session compromised?" -- the classical
statistical/CHSH check today, potentially an AI-based anomaly model
later (see app/ai/interfaces). Both can implement this same interface.
"""

from abc import ABC, abstractmethod

from app.domain.entities.qkd_session import QKDResult


class IEavesdropDetector(ABC):
    @abstractmethod
    def check(self, result: QKDResult) -> bool:
        """Return True if eavesdropping is detected for the given result."""
        raise NotImplementedError
