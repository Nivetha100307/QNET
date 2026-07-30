"""
SecurityEventBus - Decoupled Pub/Sub System & Security Event Dispatcher.
Allows Module 4 (Quantum Security Engine) to publish SecurityEvent payloads without executing recovery logic,
allowing HybridController, AuditLogger, UI Dashboard, and Recovery Engines to subscribe asynchronously.
"""

import asyncio
from typing import Callable, Dict, List, Any
from datetime import datetime


class SecurityEventBus:
    """Asynchronous Pub/Sub Event Bus for QNetSecure."""

    def __init__(self):
        self._subscribers: Dict[str, List[Callable[[Dict[str, Any]], None]]] = {
            "SecurityEvent": [],
            "ChannelHealthEvent": [],
            "KeyRotationEvent": [],
            "SessionEvent": [],
            "AttackEvent": [],
            "RecoveryEvent": [],
            "AuditEvent": []
        }
        self._event_history: List[Dict[str, Any]] = []

    def subscribe(self, event_type: str, callback: Callable[[Dict[str, Any]], None]) -> None:
        """Subscribe callback to specific event_type."""
        if event_type in self._subscribers:
            self._subscribers[event_type].append(callback)
        else:
            self._subscribers[event_type] = [callback]

    def publish(self, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publish an event to all registered subscribers.
        Returns the formatted event object.
        """
        event_obj = {
            "event_id": f"evt-{len(self._event_history) + 1:05d}",
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "payload": payload
        }
        self._event_history.append(event_obj)

        # Notify subscribers synchronously or async
        callbacks = self._subscribers.get(event_type, [])
        for cb in callbacks:
            try:
                cb(event_obj)
            except Exception as e:
                print(f"[EventBus Error] Exception handling event {event_type}: {e}")

        return event_obj

    def get_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Return recent event history."""
        return self._event_history[-limit:]


# Global Singleton Event Bus Instance
event_bus = SecurityEventBus()
