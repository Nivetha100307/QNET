import asyncio
import random
from typing import Dict, Any, Tuple
from app.core.logging_config import logger
from app.core.websocket_manager import ws_manager
from app.common.event_types import WSEventType

# Distance matrix between SCADA nodes in kilometers
SCADA_DISTANCE_MATRIX_KM: Dict[Tuple[str, str], float] = {
    ("Control_Center", "Substation_A"): 15.0,
    ("Control_Center", "Substation_B"): 28.0,
    ("Control_Center", "Substation_C"): 42.0,
    ("Control_Center", "Substation_D"): 65.0,
    ("Substation_A", "Substation_B"): 18.0,
    ("Substation_A", "Substation_C"): 35.0,
    ("Substation_A", "Substation_D"): 55.0,
    ("Substation_B", "Substation_C"): 22.0,
    ("Substation_B", "Substation_D"): 40.0,
    ("Substation_C", "Substation_D"): 30.0,
}


def get_node_distance(node_a: str, node_b: str) -> float:
    """Returns simulated fiber optic physical distance between two SCADA nodes in km."""
    if node_a == node_b:
        return 0.0
    pair = (node_a, node_b)
    reverse_pair = (node_b, node_a)
    return SCADA_DISTANCE_MATRIX_KM.get(pair, SCADA_DISTANCE_MATRIX_KM.get(reverse_pair, 30.0))


def generate_dynamic_quantum_channel(source_node: str, destination_node: str) -> Dict[str, Any]:
    """Generates physics-informed dynamic quantum channel metrics based on distance and jitter."""
    distance = get_node_distance(source_node, destination_node)
    
    # Optical fiber propagation (~5 microseconds / km) + hardware buffer jitter
    base_latency = 2.5 + (distance * 0.08)
    latency_ms = round(base_latency + random.uniform(-0.3, 0.6), 2)
    
    # Fiber attenuation (~0.2 dB/km) translated to photon loss percentage
    loss_factor = min(35.0, 1.2 + (distance * 0.32) + random.uniform(-0.2, 0.4))
    photon_loss = round(max(0.1, loss_factor), 2)
    
    # Environmental thermal/polarization noise
    noise_level = round(max(0.001, 0.008 + (distance * 0.0003) + random.uniform(-0.002, 0.005)), 4)
    
    return {
        "status": "CONNECTED",
        "latency_ms": max(0.5, latency_ms),
        "photon_loss": photon_loss,
        "noise_level": noise_level,
        "bell_score": None,
        "qber": None,
        "fidelity": None
    }


def generate_dynamic_classical_channel(source_node: str, destination_node: str) -> Dict[str, Any]:
    """Generates dynamic classical channel metrics with micro-jitter."""
    distance = get_node_distance(source_node, destination_node)
    
    # Ethernet/fiber network propagation + routing overhead
    base_latency = 1.2 + (distance * 0.04)
    latency_ms = round(base_latency + random.uniform(-0.2, 0.5), 2)
    
    return {
        "status": "CONNECTED",
        "latency_ms": max(0.3, latency_ms),
        "authentication_ready": True,
        "encryption_ready": True
    }


def generate_dynamic_node_health() -> Dict[str, Any]:
    """Generates dynamic status & ping latency for SCADA nodes."""
    all_nodes = ["Control_Center", "Substation_A", "Substation_B", "Substation_C", "Substation_D"]
    health_map = {}
    for node in all_nodes:
        ping = round(random.uniform(0.8, 3.5), 1)
        health_map[node] = {
            "status": "HEALTHY",
            "ping_ms": ping
        }
    return health_map


class TelemetrySimulator:
    """Manages active session live telemetry streaming over WebSockets."""
    
    def __init__(self) -> None:
        self._active_sessions: Dict[str, Dict[str, Any]] = {}
        self._running: bool = False
        self._task: asyncio.Task | None = None

    def start_session_telemetry(self, session_id: str, source_node: str, destination_node: str, initial_msg_count: int = 0, initial_bytes: int = 0) -> None:
        """Registers an ACTIVE session for live telemetry updates."""
        self._active_sessions[session_id] = {
            "session_id": session_id,
            "source_node": source_node,
            "destination_node": destination_node,
            "message_count": initial_msg_count,
            "bytes_transferred": initial_bytes,
        }
        logger.info(f"Started live telemetry simulation for session {session_id}")

    def stop_session_telemetry(self, session_id: str) -> None:
        """Removes a session from live telemetry streaming."""
        if session_id in self._active_sessions:
            del self._active_sessions[session_id]
            logger.info(f"Stopped telemetry simulation for session {session_id}")

    async def _telemetry_loop(self) -> None:
        """Background loop broadcasting dynamic telemetry updates every 2 seconds."""
        logger.info("TelemetrySimulator background streaming loop started.")
        while self._running:
            try:
                if self._active_sessions:
                    for session_id, data in list(self._active_sessions.items()):
                        # Fluctuate telemetry metrics dynamically
                        q_channel = generate_dynamic_quantum_channel(data["source_node"], data["destination_node"])
                        c_channel = generate_dynamic_classical_channel(data["source_node"], data["destination_node"])
                        
                        # Increment active session traffic counters
                        data["message_count"] += random.randint(1, 4)
                        data["bytes_transferred"] += random.randint(128, 512)
                        
                        node_health = generate_dynamic_node_health()
                        
                        payload = {
                            "event": WSEventType.TELEMETRY_UPDATE.value,
                            "session_id": session_id,
                            "quantum_channel": q_channel,
                            "classical_channel": c_channel,
                            "message_count": data["message_count"],
                            "bytes_transferred": data["bytes_transferred"],
                            "node_health": node_health,
                        }
                        await ws_manager.broadcast(payload)
                
                await asyncio.sleep(2.0)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in telemetry background loop: {str(e)}")
                await asyncio.sleep(2.0)

    def start_loop(self) -> None:
        """Launches the background telemetry broadcasting loop."""
        if not self._running:
            self._running = True
            self._task = asyncio.create_task(self._telemetry_loop())

    def stop_loop(self) -> None:
        """Stops the background telemetry broadcasting loop."""
        self._running = False
        if self._task:
            self._task.cancel()


# Singleton instance
telemetry_simulator = TelemetrySimulator()
