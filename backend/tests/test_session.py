import pytest
from app.core.state_machine import SessionStateMachine, SessionStatusEnum, InvalidStateTransitionError
from app.schemas.session import SessionCreateRequest, NodeEnum, ProtocolEnum, SessionTypeEnum

def test_state_machine_valid_transitions():
    """Verify valid state machine transitions."""
    # IDLE -> INITIALIZING
    SessionStateMachine.validate_transition(SessionStatusEnum.IDLE, SessionStatusEnum.INITIALIZING)
    # INITIALIZING -> READY
    SessionStateMachine.validate_transition(SessionStatusEnum.INITIALIZING, SessionStatusEnum.READY)
    # READY -> ACTIVE
    SessionStateMachine.validate_transition(SessionStatusEnum.READY, SessionStatusEnum.ACTIVE)
    # ACTIVE -> TERMINATED
    SessionStateMachine.validate_transition(SessionStatusEnum.ACTIVE, SessionStatusEnum.TERMINATED)

def test_state_machine_invalid_transitions():
    """Verify invalid state transitions raise InvalidStateTransitionError."""
    # Cannot go directly from IDLE to ACTIVE
    with pytest.raises(InvalidStateTransitionError):
        SessionStateMachine.validate_transition(SessionStatusEnum.IDLE, SessionStatusEnum.ACTIVE)

    # Cannot transition out of TERMINATED
    with pytest.raises(InvalidStateTransitionError):
        SessionStateMachine.validate_transition(SessionStatusEnum.TERMINATED, SessionStatusEnum.READY)

def test_session_create_request_validation():
    """Verify schema raises ValueError when source == destination."""
    with pytest.raises(ValueError, match="Destination node cannot be equal to source node"):
        SessionCreateRequest(
            source_node=NodeEnum.SUBSTATION_A,
            destination_node=NodeEnum.SUBSTATION_A,
            protocol=ProtocolEnum.E91,
            session_type=SessionTypeEnum.SIMULATION
        )
