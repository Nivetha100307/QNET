from typing import Dict, Set
from app.common.enums import SessionStatus

# Retain SessionStatusEnum alias for backward compatibility
SessionStatusEnum = SessionStatus

class InvalidStateTransitionError(ValueError):
    """Exception raised when an invalid session status transition is requested."""
    pass


class SessionStateMachine:
    """Session Finite State Machine (FSM) enforcing transition rules."""

    ALLOWED_TRANSITIONS: Dict[SessionStatus, Set[SessionStatus]] = {
        SessionStatus.IDLE: {SessionStatus.INITIALIZING},
        SessionStatus.INITIALIZING: {SessionStatus.READY, SessionStatus.TERMINATED},
        SessionStatus.READY: {SessionStatus.ACTIVE, SessionStatus.TERMINATED},
        SessionStatus.ACTIVE: {SessionStatus.TERMINATED},
        SessionStatus.TERMINATED: set(),
    }

    @classmethod
    def validate_transition(
        cls, 
        current_status: SessionStatus, 
        target_status: SessionStatus
    ) -> None:
        """Validates if transitioning from current_status to target_status is allowed.

        Args:
            current_status (SessionStatus): Current state.
            target_status (SessionStatus): Intended target state.

        Raises:
            InvalidStateTransitionError: If the transition is illegal.
        """
        if current_status == target_status:
            return

        allowed = cls.ALLOWED_TRANSITIONS.get(current_status, set())
        if target_status not in allowed:
            raise InvalidStateTransitionError(
                f"Cannot transition session from state '{current_status.value}' to '{target_status.value}'. "
                f"Allowed transitions from '{current_status.value}': {[s.value for s in allowed]}"
            )
