from enum import Enum

class SessionStatus(str, Enum):
    """Session state machine statuses."""
    IDLE = "IDLE"
    INITIALIZING = "INITIALIZING"
    READY = "READY"
    ACTIVE = "ACTIVE"
    TERMINATED = "TERMINATED"


class NodeName(str, Enum):
    """Supported SCADA Network Nodes."""
    CONTROL_CENTER = "Control_Center"
    SUBSTATION_A = "Substation_A"
    SUBSTATION_B = "Substation_B"
    SUBSTATION_C = "Substation_C"
    SUBSTATION_D = "Substation_D"


class ProtocolType(str, Enum):
    """Quantum Key Distribution Protocols."""
    E91 = "E91"
    BB84 = "BB84"


class SessionType(str, Enum):
    """Session Execution Modes."""
    SIMULATION = "SIMULATION"
    HARDWARE = "HARDWARE"


class ChannelStatus(str, Enum):
    """Communication Channel Statuses."""
    CONNECTED = "CONNECTED"
    DISCONNECTED = "DISCONNECTED"
    DEGRADED = "DEGRADED"
