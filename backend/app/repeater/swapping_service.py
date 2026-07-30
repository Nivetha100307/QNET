import time
import random
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import utc_now
from app.api.websocket import ws_manager
from app.core.logging_config import logger
from app.repeater.fidelity_service import FidelityService


class SwappingService:
    """Service layer orchestrating Module 7 Bell State Measurement (BSM) Entanglement Swapping."""

    BSM_STATES = ["|Phi+>", "|Phi->", "|Psi+>", "|Psi->"]

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.fidelity_service = FidelityService()

    async def execute_swapping(
        self,
        session_uuid: str,
        repeater_node: str,
        source_node: str,
        destination_node: str,
        noise_enabled: bool = False,
        distance_km: float = 120.0
    ) -> Dict[str, Any]:
        swapping_id = f"swap_{int(time.time() * 1000)}"
        bsm_outcome = random.choice(self.BSM_STATES)
        
        metrics = self.fidelity_service.calculate_metrics(distance_km=distance_km, noise_enabled=noise_enabled)
        fidelity = metrics["repeater_fidelity"]
        swap_prob = metrics["swap_success_probability"]

        # Emit WebSocket event for real-time frontend animation
        await ws_manager.broadcast("SWAP_COMPLETED", {
            "session_id": session_uuid,
            "swapping_id": swapping_id,
            "repeater_node": repeater_node,
            "source_node": source_node,
            "destination_node": destination_node,
            "bsm_result": bsm_outcome,
            "fidelity": fidelity,
            "swap_success_probability": swap_prob,
            "timestamp": utc_now().isoformat()
        })

        logger.info(f"BSM Entanglement Swapping executed at '{repeater_node}': BSM = {bsm_outcome}, Fidelity = {fidelity}.")
        return {
            "swapping_id": swapping_id,
            "session_uuid": session_uuid,
            "repeater_node": repeater_node,
            "bsm_result": bsm_outcome,
            "swapped_fidelity": fidelity,
            "swap_success_probability": swap_prob,
            "entanglement_status": "SWAPPED_LONG_DISTANCE_ESTABLISHED",
            "timestamp": utc_now().isoformat()
        }
