import time
import random
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import utc_now
from app.api.websocket import ws_manager
from app.core.logging_config import logger


class SwappingService:
    """Service layer orchestrating Module 7 Bell State Measurement (BSM) Entanglement Swapping."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def execute_swapping(
        self,
        session_uuid: str,
        repeater_node: str,
        source_node: str,
        destination_node: str
    ) -> Dict[str, Any]:
        swapping_id = f"swap_{int(time.time() * 1000)}"
        bsm_results = ["|Phi+>", "|Phi->", "|Psi+>", "|Psi->"]
        bsm_outcome = random.choice(bsm_results)
        fidelity = round(random.uniform(0.91, 0.97), 4)

        await ws_manager.broadcast("REPEATERS_SWAPPED", {
            "session_id": session_uuid,
            "swapping_id": swapping_id,
            "repeater_node": repeater_node,
            "bsm_result": bsm_outcome,
            "fidelity": fidelity
        })

        logger.info(f"Entanglement Swapping executed at repeater '{repeater_node}': BSM = {bsm_outcome}, Fidelity = {fidelity}.")
        return {
            "swapping_id": swapping_id,
            "session_uuid": session_uuid,
            "bsm_result": bsm_outcome,
            "swapped_fidelity": fidelity,
            "entanglement_status": "SWAPPED_LONG_DISTANCE_ESTABLISHED",
            "timestamp": utc_now().isoformat()
        }
