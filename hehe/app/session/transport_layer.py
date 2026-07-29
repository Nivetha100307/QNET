import asyncio
import time
from typing import Dict, Any, List

class SecureTransportLayer:
    """
    Component 11: Secure Transport Layer
    Simulates network transport protocol handling (REST, WebSockets, MQTT), ACKs, timeouts, retries, and queue buffering.
    """

    def __init__(self):
        self.packet_queue: List[dict] = []
        self.acknowledged_packets: Dict[str, float] = {}

    async def transmit_packet(
        self,
        packet: dict,
        receiver_callback,
        session_id: str,
        derived_key_bytes: bytes,
        max_retries: int = 3,
        user_role: str = "OPERATOR"
    ) -> Dict[str, Any]:
        """
        Transmits packet over secure transport channel with ACK confirmation and automatic retry logic.
        """
        packet_id = packet["header"]["packet_id"]
        self.packet_queue.append(packet)

        attempt = 0
        last_error = None

        while attempt < max_retries:
            try:
                attempt += 1
                # Deliver to receiver gateway
                result = receiver_callback(
                    packet=packet,
                    session_id=session_id,
                    derived_key_bytes=derived_key_bytes,
                    user_role=user_role
                )
                
                # Record ACK
                self.acknowledged_packets[packet_id] = time.time()
                return {
                    "status": "ACKNOWLEDGED",
                    "attempts": attempt,
                    "packet_id": packet_id,
                    "receiver_response": result
                }
            except Exception as e:
                last_error = str(e)
                await asyncio.sleep(0.05 * attempt) # Exponential backoff retry

        raise Exception(f"Transport Failure: Packet {packet_id} failed after {max_retries} attempts. Last error: {last_error}")

transport_layer = SecureTransportLayer()
