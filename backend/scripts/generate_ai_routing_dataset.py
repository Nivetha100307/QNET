import os
import sys
import math
import random
import time
import pandas as pd
import numpy as np

# Ensure backend package imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Candidate route path templates
ROUTE_NAMES = ["Route_A", "Route_B", "Route_C", "Route_D"]

# SCADA Nodes
NODES = ["Control_Center", "Substation_A", "Substation_B", "Substation_C", "Substation_D"]


def load_baseline_distributions(data_dir: str = "."):
    """Loads baseline statistical parameters from existing CSV log files if available.
    Falls back to calibrated physical baseline distributions if files do not exist.
    """
    stats = {
        "bell_score": {"mean": 2.55, "std": 0.22, "min": 1.20, "max": 2.8284},
        "qber": {"mean": 0.045, "std": 0.025, "min": 0.001, "max": 0.25},
        "fidelity": {"mean": 0.94, "std": 0.04, "min": 0.65, "max": 0.999},
        "latency_ms": {"mean": 12.5, "std": 4.2, "min": 2.0, "max": 45.0},
        "packet_loss": {"mean": 0.02, "std": 0.015, "min": 0.0, "max": 0.20},
        "memory_efficiency": {"mean": 0.85, "std": 0.08, "min": 0.40, "max": 1.0},
    }

    # Attempt reading from security_reports.csv if present
    sec_csv = os.path.join(data_dir, "security_reports.csv")
    if os.path.exists(sec_csv):
        try:
            df_sec = pd.read_csv(sec_csv)
            if "chsh_value" in df_sec.columns:
                stats["bell_score"]["mean"] = float(df_sec["chsh_value"].mean())
                stats["bell_score"]["std"] = float(df_sec["chsh_value"].std())
            if "qber" in df_sec.columns:
                stats["qber"]["mean"] = float(df_sec["qber"].mean())
                stats["qber"]["std"] = float(df_sec["qber"].std())
            if "fidelity" in df_sec.columns:
                stats["fidelity"]["mean"] = float(df_sec["fidelity"].mean())
                stats["fidelity"]["std"] = float(df_sec["fidelity"].std())
            print(f" Loaded baseline distributions from '{sec_csv}'.")
        except Exception as e:
            print(f" Notice: Using default physics baselines ({str(e)}).")
    else:
        print(" CSV logs not found. Using physics-aware baseline distributions.")

    return stats


def generate_candidate_route_metrics(route_id: str, base_distance: float, threat_level: str):
    """Generates physically consistent quantum and optical metrics for a single candidate route."""
    # Hop counts based on distance
    hops = max(2, int(round(base_distance / 25.0)))
    
    # Eavesdropping penalty factor
    threat_penalty = 0.0
    if threat_level == "MEDIUM":
        threat_penalty = 0.04
    elif threat_level == "HIGH":
        threat_penalty = 0.12

    # Physical visibility gamma: attenuation + noise + threat
    fiber_loss = 0.20  # dB/km
    dist_attenuation = 10.0 ** (-(fiber_loss * base_distance) / 160.0)
    phase_noise = random.uniform(0.01, 0.03)
    dark_count = random.uniform(0.005, 0.015)
    
    gamma = max(0.40, min(0.99, dist_attenuation * (1.0 - phase_noise) * (1.0 - dark_count) - threat_penalty + random.normalvariate(0, 0.02)))

    # Derived physics metrics (single source of truth gamma)
    chsh_score = min(2.8284, max(1.10, 2.8284 * gamma + random.normalvariate(0, 0.03)))
    qber = max(0.001, min(0.35, (1.0 - gamma) / 2.0 + random.uniform(-0.005, 0.01)))
    fidelity = max(0.50, min(0.999, (1.0 + gamma) / 2.0 + random.uniform(-0.005, 0.005)))
    
    photon_loss = max(0.5, min(40.0, 1.2 + base_distance * 0.28 + random.uniform(-1.0, 2.0)))
    latency_ms = max(2.0, 2.5 + base_distance * 0.12 + hops * 1.5 + random.uniform(-0.5, 1.5))
    packet_loss = max(0.0, min(0.25, (qber * 0.8) + random.uniform(0.0, 0.02)))
    
    repeater_memory_decay = max(0.30, min(1.0, 0.98 - (hops * 0.04) - (base_distance * 0.002) + random.uniform(-0.02, 0.02)))
    swap_probability = max(0.40, min(0.98, 0.95 - (hops * 0.05) + random.uniform(-0.03, 0.03)))
    network_congestion = max(5.0, min(95.0, random.uniform(10.0, 75.0)))
    entanglement_age = max(1.0, min(150.0, random.uniform(5.0, 60.0)))

    # Compute normalized Failure Probability (0 to 1)
    # Failure Prob = 0.25*QBER + 0.20*PacketLoss + 0.20*(1 - Fidelity) + 0.15*(Latency/50) + 0.20*(1 - MemoryDecay)
    raw_fail_prob = (
        0.25 * (qber / 0.20) +
        0.20 * (packet_loss / 0.15) +
        0.20 * (1.0 - fidelity) +
        0.15 * min(1.0, latency_ms / 40.0) +
        0.20 * (1.0 - repeater_memory_decay)
    )
    predicted_failure_probability = max(0.001, min(0.999, raw_fail_prob))

    # Compute Composite Route Score (0 to 100)
    # 35% Fidelity, 20% QBER, 15% Bell Score, 10% Latency, 10% Packet Loss, 5% Network Health, 5% Threat
    qber_score = max(0.0, (1.0 - qber / 0.15) * 100.0)
    chsh_pct = min(100.0, (chsh_score / 2.8284) * 100.0)
    lat_score = max(0.0, (1.0 - latency_ms / 50.0) * 100.0)
    pkt_score = max(0.0, (1.0 - packet_loss / 0.15) * 100.0)
    net_health = max(0.0, (100.0 - network_congestion))
    threat_score = 100.0 if threat_level == "LOW" else (60.0 if threat_level == "MEDIUM" else 20.0)

    composite_score = (
        0.35 * (fidelity * 100.0) +
        0.20 * qber_score +
        0.15 * chsh_pct +
        0.10 * lat_score +
        0.10 * pkt_score +
        0.05 * net_health +
        0.05 * threat_score
    )
    route_score = max(0.0, min(100.0, round(composite_score, 2)))

    return {
        "route_id": route_id,
        "distance_km": round(base_distance, 1),
        "hops": hops,
        "chsh_score": round(chsh_score, 3),
        "qber": round(qber, 4),
        "fidelity": round(fidelity, 4),
        "photon_loss_pct": round(photon_loss, 2),
        "latency_ms": round(latency_ms, 2),
        "packet_loss_pct": round(packet_loss * 100.0, 2),
        "repeater_memory_decay": round(repeater_memory_decay, 3),
        "swap_probability": round(swap_probability, 3),
        "network_congestion_pct": round(network_congestion, 1),
        "entanglement_age_ms": round(entanglement_age, 1),
        "predicted_failure_probability": round(predicted_failure_probability, 4),
        "route_score": route_score
    }


def generate_routing_dataset(num_samples: int = 100000, output_file: str = "ai_routing_dataset.csv"):
    """Generates a physics-aware synthetic AI routing dataset with ~100,000 samples."""
    print(f" Starting generation of {num_samples:,} physics-aware QNetSecure routing samples...")
    start_time = time.time()

    data_dir = os.path.dirname(output_file) if os.path.dirname(output_file) else "."
    stats = load_baseline_distributions(data_dir)

    rows = []
    
    # Pre-generate rolling baseline arrays for smoothing
    rolling_qber_hist = [0.03] * 5
    rolling_fid_hist = [0.96] * 5
    rolling_lat_hist = [12.0] * 5
    rolling_pkt_hist = [0.015] * 5

    threat_options = ["LOW", "LOW", "LOW", "MEDIUM", "HIGH"]

    for i in range(1, num_samples + 1):
        if i % 25000 == 0 or i == num_samples:
            elapsed = time.time() - start_time
            print(f" Progress: {i:,} / {num_samples:,} samples generated ({elapsed:.1f}s)")

        source = random.choice(NODES[:-1])
        dest = random.choice([n for n in NODES if n != source])
        threat_level = random.choice(threat_options)

        # Generate candidate metrics for 4 competing routes
        route_a = generate_candidate_route_metrics("Route_A", random.uniform(15.0, 40.0), threat_level)
        route_b = generate_candidate_route_metrics("Route_B", random.uniform(30.0, 70.0), threat_level)
        route_c = generate_candidate_route_metrics("Route_C", random.uniform(50.0, 100.0), threat_level)
        route_d = generate_candidate_route_metrics("Route_D", random.uniform(70.0, 140.0), threat_level)

        routes = [route_a, route_b, route_c, route_d]
        
        # Determine Best Route (highest route score)
        best_candidate = max(routes, key=lambda r: r["route_score"])
        best_route_name = best_candidate["route_id"]

        # Current primary route (Route A) metrics for decision logic
        primary = route_a
        
        # Update rolling feature histories
        rolling_qber_hist.pop(0); rolling_qber_hist.append(primary["qber"])
        rolling_fid_hist.pop(0); rolling_fid_hist.append(primary["fidelity"])
        rolling_lat_hist.pop(0); rolling_lat_hist.append(primary["latency_ms"])
        rolling_pkt_hist.pop(0); rolling_pkt_hist.append(primary["packet_loss_pct"] / 100.0)

        rolling_qber = round(sum(rolling_qber_hist) / 5.0, 4)
        rolling_fidelity = round(sum(rolling_fid_hist) / 5.0, 4)
        rolling_latency = round(sum(rolling_lat_hist) / 5.0, 2)
        rolling_packet_loss = round(sum(rolling_pkt_hist) / 5.0, 4)

        # Quantum & Link Health Scores
        link_health_score = round(max(0.0, min(100.0, 100.0 - (primary["packet_loss_pct"] * 2.0) - (primary["network_congestion_pct"] * 0.4))), 1)
        quantum_health_score = round(max(0.0, min(100.0, (primary["fidelity"] * 50.0) + (primary["chsh_score"] / 2.8284 * 50.0))), 1)
        historical_route_success = round(max(0.60, min(0.999, 1.0 - primary["predicted_failure_probability"] + random.uniform(-0.02, 0.02))), 3)
        route_cost = round(primary["distance_km"] * 0.15 + primary["hops"] * 2.0 + primary["network_congestion_pct"] * 0.05, 2)

        # DETERMINISTIC QUANTUM ROUTING DECISION RULES
        score = primary["route_score"]
        chsh = primary["chsh_score"]
        qber = primary["qber"]
        fid = primary["fidelity"]
        pkt_loss_pct = primary["packet_loss_pct"]
        mem_decay = primary["repeater_memory_decay"]

        # Hard Quantum Security Violation check
        hard_quantum_violation = (
            chsh < 2.0 or
            qber > 0.08 or
            fid < 0.90 or
            pkt_loss_pct > 12.0 or
            threat_level == "HIGH" or
            mem_decay < 0.70
        )

        if hard_quantum_violation or score < 60.0:
            route_decision = "EMERGENCY_ROUTE"
        elif score >= 90.0:
            route_decision = "KEEP_ROUTE"
        elif 80.0 <= score < 90.0:
            route_decision = "ALTERNATIVE_ROUTE"
        else:
            route_decision = "REROUTE"

        # Record dataset sample
        row = {
            "scenario_id": f"SCN_{i:06d}",
            "source_node": source,
            "destination_node": dest,
            "threat_level": threat_level,
            
            # Primary Candidate (Route A) Features
            "distance_km": primary["distance_km"],
            "hops": primary["hops"],
            "bell_score": primary["chsh_score"],
            "qber": primary["qber"],
            "fidelity": primary["fidelity"],
            "photon_loss_pct": primary["photon_loss_pct"],
            "latency_ms": primary["latency_ms"],
            "packet_loss_pct": primary["packet_loss_pct"],
            "repeater_memory_decay": primary["repeater_memory_decay"],
            "swap_probability": primary["swap_probability"],
            "network_congestion_pct": primary["network_congestion_pct"],
            "entanglement_age_ms": primary["entanglement_age_ms"],
            
            # Engineered AI Features
            "rolling_qber": rolling_qber,
            "rolling_fidelity": rolling_fidelity,
            "rolling_latency": rolling_latency,
            "rolling_packet_loss": rolling_packet_loss,
            "historical_route_success": historical_route_success,
            "predicted_failure_probability": primary["predicted_failure_probability"],
            "link_health_score": link_health_score,
            "quantum_health_score": quantum_health_score,
            "route_cost": route_cost,
            "primary_route_score": score,
            
            # Candidate Route B Features
            "route_b_distance": route_b["distance_km"],
            "route_b_hops": route_b["hops"],
            "route_b_fidelity": route_b["fidelity"],
            "route_b_qber": route_b["qber"],
            "route_b_score": route_b["route_score"],

            # Candidate Route C Features
            "route_c_distance": route_c["distance_km"],
            "route_c_hops": route_c["hops"],
            "route_c_fidelity": route_c["fidelity"],
            "route_c_qber": route_c["qber"],
            "route_c_score": route_c["route_score"],

            # Candidate Route D Features
            "route_d_distance": route_d["distance_km"],
            "route_d_hops": route_d["hops"],
            "route_d_fidelity": route_d["fidelity"],
            "route_d_qber": route_d["qber"],
            "route_d_score": route_d["route_score"],

            # TARGET LABELS
            "best_route": best_route_name,
            "route_decision": route_decision
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    
    # Save dataset to CSV
    os.makedirs(os.path.dirname(output_file) if os.path.dirname(output_file) else ".", exist_ok=True)
    df.to_csv(output_file, index=False)
    
    total_time = time.time() - start_time
    print(f"\n Successfully generated '{output_file}'!")
    print(f" Total Rows: {len(df):,}")
    print(f" Total Columns: {len(df.columns)}")
    print(f" Execution Time: {total_time:.2f} seconds")
    print("\nTarget Class Distribution ('route_decision'):")
    print(df["route_decision"].value_counts(normalize=True).map(lambda v: f"{v*100:.1f}%"))
    print("\nBest Route Distribution ('best_route'):")
    print(df["best_route"].value_counts(normalize=True).map(lambda v: f"{v*100:.1f}%"))

    return df


if __name__ == "__main__":
    output_path = os.path.join(os.path.dirname(__file__), "..", "data", "ai_routing_dataset.csv")
    generate_routing_dataset(num_samples=100000, output_file=output_path)
