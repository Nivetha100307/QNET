import time
from typing import Dict, Any

class CommandExecutor:
    """
    Component 15: Command Executor
    Executes SCADA commands against virtual grid physical state models.
    Updates breaker positions, relay state, generator status, transformer tap ratios, and sensor telemetry.
    """

    def __init__(self):
        # Initial Virtual Device State Registry
        self.device_states: Dict[str, dict] = {
            "BRK_12": {
                "status": "ONLINE",
                "breaker_state": "CLOSED",
                "voltage": 230.2,
                "current": 14.8,
                "power": 3.40,
                "frequency": 50.01,
                "temperature": 44.5
            },
            "RELAY_04": {
                "status": "ONLINE",
                "relay_state": "NORMAL",
                "voltage": 229.8,
                "current": 12.1,
                "power": 2.78,
                "frequency": 49.98,
                "temperature": 39.2
            },
            "TRANS_TAP_01": {
                "status": "ONLINE",
                "tap_position": 5,
                "transformer_load": 78.4,
                "oil_temperature": 52.1,
                "voltage": 231.0
            },
            "GEN_MAIN_01": {
                "status": "ONLINE",
                "generator_state": "RUNNING",
                "output_power_kw": 1200.0,
                "frequency": 50.00,
                "temperature": 68.3
            }
        }

    def execute_command(self, command: dict) -> Dict[str, Any]:
        """
        Executes validated SCADA command and updates physical simulation state.
        """
        cmd_type = (command.get("command_type") or command.get("type", "")).upper()
        device_id = command.get("device_id") or command.get("device")
        payload = command.get("payload", {})

        if device_id not in self.device_states:
            self.device_states[device_id] = {
                "status": "ONLINE",
                "breaker_state": "CLOSED",
                "voltage": 230.0,
                "current": 15.0,
                "power": 3.45,
                "frequency": 50.0,
                "temperature": 40.0
            }

        state = self.device_states[device_id]
        execution_result = {"status": "SUCCESS", "previous_state": state.copy()}

        if cmd_type == "OPEN_BREAKER":
            state["breaker_state"] = "OPEN"
            state["current"] = 0.0
            state["power"] = 0.0
            execution_result["message"] = f"Breaker {device_id} successfully OPENED."

        elif cmd_type == "CLOSE_BREAKER":
            state["breaker_state"] = "CLOSED"
            state["current"] = 15.2
            state["power"] = 3.50
            execution_result["message"] = f"Breaker {device_id} successfully CLOSED."

        elif cmd_type == "TRIP_RELAY":
            state["relay_state"] = "TRIPPED"
            state["status"] = "ALARM"
            execution_result["message"] = f"Relay {device_id} TRIPPED emergency isolation."

        elif cmd_type == "RESET_RELAY":
            state["relay_state"] = "NORMAL"
            state["status"] = "ONLINE"
            execution_result["message"] = f"Relay {device_id} RESET to normal operating state."

        elif cmd_type == "START_GENERATOR":
            state["generator_state"] = "RUNNING"
            state["output_power_kw"] = 1200.0
            execution_result["message"] = f"Generator {device_id} STARTED."

        elif cmd_type == "STOP_GENERATOR":
            state["generator_state"] = "STOPPED"
            state["output_power_kw"] = 0.0
            execution_result["message"] = f"Generator {device_id} STOPPED."

        elif cmd_type == "SET_TRANSFORMER_TAP":
            new_tap = payload.get("tap_position", 5)
            state["tap_position"] = new_tap
            state["voltage"] = 220.0 + (new_tap * 2.0)
            execution_result["message"] = f"Transformer {device_id} Tap position set to {new_tap}."

        elif cmd_type == "EMERGENCY_SHUTDOWN":
            state["status"] = "OFFLINE"
            state["breaker_state"] = "OPEN"
            state["current"] = 0.0
            execution_result["message"] = f"EMERGENCY SHUTDOWN executed for device {device_id}."

        else:
            execution_result["message"] = f"Telemetry/Read command '{cmd_type}' processed for device {device_id}."

        state["last_updated"] = time.time()
        execution_result["current_state"] = state
        return execution_result

command_executor = CommandExecutor()
