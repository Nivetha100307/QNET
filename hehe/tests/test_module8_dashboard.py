import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_module8_dashboard_summary():
    res = client.get("/api/dashboard/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["system_status"] == "ONLINE"
    assert "connected_substations" in data
    assert "current_qber_pct" in data

def test_module8_dashboard_scada():
    res = client.get("/api/dashboard/scada")
    assert res.status_code == 200
    data = res.json()
    assert "telemetry" in data
    assert "device_states" in data
    assert data["grid_status"] == "STABLE"

def test_module8_dashboard_quantum():
    res = client.get("/api/dashboard/quantum")
    assert res.status_code == 200
    data = res.json()
    assert data["chsh_bell_score"] == 2.82
    assert data["channel_status"] == "ENTANGLED_SECURE"

def test_module8_dashboard_security():
    res = client.get("/api/dashboard/security")
    assert res.status_code == 200
    data = res.json()
    assert data["risk_level"] == "LOW"
    assert "device_trust_inventory" in data

def test_module8_dashboard_network():
    res = client.get("/api/dashboard/network")
    assert res.status_code == 200
    data = res.json()
    assert len(data["nodes"]) >= 8
    assert len(data["edges"]) >= 8

def test_module8_dashboard_analytics():
    res = client.get("/api/dashboard/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "latency_series_ms" in data
    assert "qber_series_pct" in data

def test_module8_dashboard_comparison():
    res = client.get("/api/dashboard/comparison")
    assert res.status_code == 200
    data = res.json()
    assert len(data["metrics"]) >= 5
    assert "radar_data" in data

def test_module8_dashboard_logs():
    res = client.get("/api/dashboard/logs?category=SCADA")
    assert res.status_code == 200
    data = res.json()
    assert "logs" in data

def test_module8_dashboard_reports():
    res = client.get("/api/dashboard/reports")
    assert res.status_code == 200
    data = res.json()
    assert len(data["reports"]) >= 3
