import pytest
from app.services.telemetry_simulator import (
    get_node_distance,
    generate_dynamic_quantum_channel,
    generate_dynamic_classical_channel,
    generate_dynamic_node_health
)


def test_node_distance_calculations():
    """Verify physical distance calculations between SCADA nodes."""
    d1 = get_node_distance("Control_Center", "Substation_A")
    assert d1 == 15.0

    d2 = get_node_distance("Substation_A", "Control_Center")
    assert d2 == 15.0

    d3 = get_node_distance("Substation_A", "Substation_D")
    assert d3 == 55.0

    d_same = get_node_distance("Substation_A", "Substation_A")
    assert d_same == 0.0


def test_dynamic_quantum_channel_properties():
    """Verify dynamic quantum channel telemetry properties vary by distance."""
    short_link = generate_dynamic_quantum_channel("Control_Center", "Substation_A")
    long_link = generate_dynamic_quantum_channel("Control_Center", "Substation_D")

    assert short_link["status"] == "CONNECTED"
    assert short_link["latency_ms"] > 0.0
    assert short_link["photon_loss"] >= 0.0
    assert short_link["noise_level"] > 0.0

    # Long link (65km) should have higher latency and higher photon loss than short link (15km)
    assert long_link["latency_ms"] > short_link["latency_ms"]
    assert long_link["photon_loss"] > short_link["photon_loss"]


def test_dynamic_classical_channel_properties():
    """Verify dynamic classical channel properties."""
    channel = generate_dynamic_classical_channel("Control_Center", "Substation_B")
    assert channel["status"] == "CONNECTED"
    assert channel["latency_ms"] > 0.0
    assert channel["authentication_ready"] is True


def test_dynamic_node_health():
    """Verify dynamic SCADA node health dictionary contains live ping latencies."""
    health = generate_dynamic_node_health()
    assert "Control_Center" in health
    assert "Substation_A" in health
    assert health["Control_Center"]["status"] == "HEALTHY"
    assert health["Control_Center"]["ping_ms"] > 0.0
