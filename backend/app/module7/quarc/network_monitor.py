import time
from typing import List, Dict, Any
from app.module7.quarc.link_state_database import qlsdb, LinkState


class NetworkStateMonitor:
    """Network State Monitor.
    Continuously polls live quantum link health and reports network-wide telemetry updates.
    """

    def __init__(self):
        self.last_update_timestamp = time.time()

    def poll_quantum_conditions(self) -> List[LinkState]:
        """Polls current quantum conditions from Quantum Link State Database (QLSDB)."""
        qlsdb.sample_telemetry_tick()
        self.last_update_timestamp = time.time()
        return qlsdb.get_all_links()

    def get_summary_telemetry(self) -> Dict[str, Any]:
        links = qlsdb.get_all_links()
        if not links:
            return {
                "active_links": 0,
                "avg_fidelity": 0.0,
                "avg_qber": 0.0,
                "avg_chsh": 0.0,
                "avg_memory_ms": 0.0
            }

        avg_fid = sum(l.fidelity for l in links) / len(links)
        avg_qber = sum(l.qber for l in links) / len(links)
        avg_chsh = sum(l.chsh for l in links) / len(links)
        avg_mem = sum(l.memory_lifetime_ms for l in links) / len(links)

        return {
            "total_links": len(links),
            "active_links": sum(1 for l in links if l.status == "ACTIVE"),
            "avg_fidelity": round(avg_fid, 2),
            "avg_qber": round(avg_qber, 2),
            "avg_chsh": round(avg_chsh, 2),
            "avg_memory_ms": round(avg_mem, 1),
            "timestamp": self.last_update_timestamp
        }


network_monitor = NetworkStateMonitor()
