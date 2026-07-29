from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class SwappingContext:
    """Execution context for Entanglement Swapping & Repeater Mesh operations."""
    session_uuid: str
    repeater_node: str
    source_node: str
    destination_node: str
    bsm_result: str = "00"
    swapped_fidelity: float = 0.92
    entanglement_status: str = "SWACTUATED"
