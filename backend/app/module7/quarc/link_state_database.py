import time
import random
from typing import Dict, List, Optional
from app.module7.quarc.models import LinkState


class QuantumLinkStateDatabase:
    """Quantum Link State Database (QLSDB).
    Single source of truth storing physical & quantum telemetry metrics for all network links.
    """

    def __init__(self):
        self._database: Dict[str, LinkState] = {}
        self._seed_default_links()

    def _seed_default_links(self) -> None:
        """Seeds initial default network topology links."""
        default_links = [
            ("Control_Center", "Repeater_R1", 25.0, 0.20, 98.4, 2.1, 2.74, 28.5, 0.95, 2, 1.2, 1000.0, 99.8),
            ("Repeater_R1", "Repeater_R2", 30.0, 0.22, 96.8, 2.8, 2.68, 24.0, 0.92, 4, 1.5, 1000.0, 99.5),
            ("Repeater_R2", "Repeater_R3", 35.0, 0.25, 95.2, 3.2, 2.61, 20.5, 0.89, 5, 1.8, 1000.0, 99.0),
            ("Repeater_R3", "Substation_A", 20.0, 0.18, 97.9, 2.3, 2.71, 30.0, 0.96, 1, 1.0, 1000.0, 99.9),
            ("Repeater_R2", "Substation_B", 22.0, 0.19, 97.1, 2.5, 2.69, 27.0, 0.94, 3, 1.1, 1000.0, 99.6),
            ("Repeater_R3", "Substation_C", 28.0, 0.21, 96.0, 2.9, 2.64, 22.0, 0.91, 4, 1.4, 1000.0, 99.2),
            ("Repeater_R1", "Substation_D", 32.0, 0.24, 94.8, 3.4, 2.58, 19.0, 0.88, 6, 1.6, 1000.0, 98.7),
            ("Control_Center", "Substation_A", 100.0, 0.28, 91.2, 4.8, 2.42, 14.0, 0.80, 12, 5.0, 1000.0, 96.5),
        ]

        for (na, nb, dist, att, fid, qb, chsh, mem, sp, qd, lat, bw, avail) in default_links:
            ls = LinkState(
                node_a=na,
                node_b=nb,
                distance_km=dist,
                attenuation_db=att,
                fidelity=fid,
                qber=qb,
                chsh=chsh,
                memory_lifetime_ms=mem,
                swap_probability=sp,
                queue_depth=qd,
                latency_ms=lat,
                bandwidth_kbps=bw,
                availability=avail,
                status="ACTIVE",
                timestamp=time.time()
            )
            self._database[ls.link_id] = ls

    def get_all_links(self) -> List[LinkState]:
        return list(self._database.values())

    def get_link(self, node_a: str, node_b: str) -> Optional[LinkState]:
        nodes = sorted([node_a, node_b])
        key = f"{nodes[0]}<->{nodes[1]}"
        return self._database.get(key)

    def update_link(self, link_state: LinkState) -> None:
        self._database[link_state.link_id] = link_state

    def sample_telemetry_tick(self) -> None:
        """Simulates periodic live telemetry variation across all links."""
        for link in self._database.values():
            if link.status != "DOWN":
                # Add micro noise drift
                link.fidelity = round(max(80.0, min(99.9, link.fidelity + random.uniform(-0.3, 0.3))), 2)
                link.qber = round(max(0.5, min(8.0, link.qber + random.uniform(-0.1, 0.1))), 2)
                link.chsh = round(max(2.1, min(2.82, link.chsh + random.uniform(-0.02, 0.02))), 2)
                link.memory_lifetime_ms = round(max(10.0, min(35.0, link.memory_lifetime_ms + random.uniform(-0.5, 0.5))), 1)
                link.queue_depth = max(0, min(50, link.queue_depth + random.randint(-1, 1)))
                link.timestamp = time.time()


qlsdb = QuantumLinkStateDatabase()
