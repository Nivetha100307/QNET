"""
Adaptive Quantum Channel Probe Engine.
Periodically probes quantum channel physical metrics (CHSH parameter, QBER %, Entanglement Fidelity %)
when operating in PQC_ONLY mode to evaluate channel restoration and seamlessly return to E91/GHZ Quantum mode.
"""

import time
import random
from typing import Dict, Any


class QuantumProbeEngine:
    """Adaptive Quantum Channel Probe & Recovery Engine."""

    def __init__(self, default_probe_interval_s: float = 5.0):
        self.probe_interval_s = default_probe_interval_s
        self.last_probe_time: float = 0.0
        self.consecutive_probe_failures: int = 0
        self.probe_history = []

    def execute_channel_probe(self, session_id: str, is_simulated_attack_active: bool = False) -> Dict[str, Any]:
        """
        Execute physical channel probing pulse.
        Simulates quantum state tomography and Bell CHSH measurement.
        """
        self.last_probe_time = time.time()

        if is_simulated_attack_active:
            # Channel remains degraded due to active attack
            qber = round(random.uniform(12.5, 18.0), 2)
            chsh = round(random.uniform(1.45, 1.85), 2)
            fidelity = round(random.uniform(72.0, 78.5), 1)
            self.consecutive_probe_failures += 1
            status = "FAILED"
            msg = f"Probe #{len(self.probe_history)+1}: High QBER ({qber}%) & Bell violation ({chsh} < 2.0). Quantum channel remains degraded."
        else:
            # Channel recovered
            qber = round(random.uniform(1.8, 3.8), 2)
            chsh = round(random.uniform(2.55, 2.78), 2)
            fidelity = round(random.uniform(94.5, 98.2), 1)
            self.consecutive_probe_failures = 0
            status = "RESTORED"
            msg = f"Probe #{len(self.probe_history)+1}: CHSH {chsh} > 2.0 & QBER {qber}% < 5%. Quantum channel health fully restored!"

        probe_result = {
            "probe_id": f"prb-{len(self.probe_history)+1:04d}",
            "session_id": session_id,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "status": status,
            "qber": qber,
            "chsh": chsh,
            "fidelity": fidelity,
            "consecutive_failures": self.consecutive_probe_failures,
            "message": msg
        }

        self.probe_history.append(probe_result)
        return probe_result


# Singleton Probe Engine
quantum_probe_engine = QuantumProbeEngine()
