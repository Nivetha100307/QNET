import secrets
import time
from typing import Dict, Any, List
from app.scada.command_executor import command_executor

class TelemetryGenerator:
    """
    Component 16: Telemetry Generator
    Continuously generates realistic live grid telemetry metrics for all registered substation devices.
    """

    @staticmethod
    def generate_live_telemetry() -> List[Dict[str, Any]]:
        """Generates real-time telemetry snapshot for all substation devices."""
        telemetry_batch = []
        now = time.time()

        for dev_id, state in command_executor.device_states.items():
            breaker_state = state.get("breaker_state", "CLOSED")
            
            # Realistic physics variations
            voltage_var = round(230.0 + (secrets.randbelow(40) - 20) / 10.0, 2) if breaker_state == "CLOSED" else 0.0
            current_var = round(15.0 + (secrets.randbelow(30) - 15) / 10.0, 2) if breaker_state == "CLOSED" else 0.0
            power_var = round((voltage_var * current_var * 0.98) / 1000.0, 3)
            freq_var = round(50.00 + (secrets.randbelow(10) - 5) / 100.0, 2)
            temp_var = round(state.get("temperature", 42.0) + (secrets.randbelow(10) - 5) / 10.0, 1)

            t_data = {
                "device_id": dev_id,
                "substation_id": state.get("substation_id", "SUB_NORTH"),
                "voltage": voltage_var,
                "current": current_var,
                "power_kw": power_var,
                "frequency_hz": freq_var,
                "power_factor": 0.98,
                "temperature_c": temp_var,
                "breaker_state": breaker_state,
                "relay_state": state.get("relay_state", "NORMAL"),
                "transformer_load_pct": round(75.0 + (secrets.randbelow(20) - 10) / 2.0, 1),
                "oil_temperature_c": round(50.0 + (secrets.randbelow(10) - 5) / 2.0, 1),
                "battery_voltage": 24.1,
                "harmonics_thd_pct": 1.4,
                "timestamp": now
            }
            telemetry_batch.append(t_data)

        return telemetry_batch

telemetry_generator = TelemetryGenerator()
