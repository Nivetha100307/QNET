import pytest
from app.quantum.ghz_engine import GHZEngine


def test_ghz_engine_4_participants():
    """Verify 4-qubit GHZ state generation and fidelity calculation."""
    engine = GHZEngine(use_aer=True)
    res = engine.execute_ghz_broadcast(participants=4, shots=1000)

    assert res["type"] == "GHZ_BROADCAST"
    assert res["participants"] == 4
    assert res["shots"] == 1000
    assert res["fidelity"] > 0.90
    assert "counts" in res
    assert "circuit_qasm" in res
    assert "0000" in res["counts"] or "1111" in res["counts"]
