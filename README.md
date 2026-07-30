# ⚛️ QNetSecure: AI-Enabled E91 Quantum SCADA Communication Network

> **A Production-Ready Hybrid Quantum-Classical Security Operations Framework for Critical Energy Infrastructure**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Qiskit Aer](https://img.shields.io/badge/Qiskit-AerSimulator-6929C4.svg)](https://qiskit.org/)
[![React 18](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Executive Summary

**QNetSecure** is a state-of-the-art **AI-Enabled E91 Quantum Key Distribution (QKD) & Zero-Trust SCADA Communication System** designed to protect power grid substations, relays, and industrial energy infrastructure against classical, post-quantum, and adversary cyberattacks.

By unifying **Ekert91 (E91) Quantum Entanglement Physics** with a **20-Stage Zero-Trust Security Operations Center (SOC)**, QNetSecure provides two-tier defense:

1. **Quantum Layer**: Eavesdroppers attempting to intercept flying photons in optical fiber are detected instantly by fundamental quantum mechanics laws ($\text{QBER} \ge 11.0\%$, CHSH Bell inequality violation failure $|S| \le 2.0$).
2. **Classical Layer**: Encrypted SCADA control commands (e.g., `TRIP_RELAY`, `CLOSE_BREAKER`) are protected by HKDF-SHA256 key derivation, AES-256-GCM authenticated encryption, HMAC-SHA256 signatures, anti-replay sequence tracking, and AI anomaly detection.

---

## 📖 Key Terms & Glossary (Presentation Cheat Sheet)

| Key Term | Symbol / Concept | Simple Explanation for Judges |
| :--- | :--- | :--- |
| **QKD (Quantum Key Distribution)** | Quantum Cryptography | Uses quantum physics (not hard math) to distribute secret encryption keys. Eavesdropping alters the physical state of photons, revealing the attacker. |
| **E91 Protocol** | Ekert 1991 Protocol | Entanglement-based QKD protocol relying on EPR Bell photon pairs $\|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$. |
| **CHSH Bell Parameter** | $S$ ($0 \le \|S\| \le 2\sqrt{2}$) | Physical test for quantum entanglement. Classical physics caps $\|S\| \le 2.0$. Quantum entanglement violates local realism up to Tsirelson's bound ($S = 2.8284$). If $\|S\| \le 2.0$, entanglement is lost or intercepted! |
| **QBER** | Quantum Bit Error Rate | Percentage of corrupted bits between Alice and Bob. E91 security boundary is **$11.0\%$**. If $\text{QBER} \ge 11.0\%$, the session is aborted immediately. |
| **State Fidelity** | $F$ ($0.5 \le F \le 1.0$) | Measure of quantum state purity relative to ideal Bell pair $\|\Phi^+\rangle$. Modeled as $F = (1+\gamma)/2$. |
| **Channel Visibility** | $\gamma$ ($0 \le \gamma \le 1.0$) | Single physical source of truth visibility determined by fiber distance, attenuation (dB/km), detector efficiency, phase noise, and dark counts. |
| **HKDF-SHA256** | Key Expansion | HMAC-based Extract-and-Expand Key Derivation Function expanding a 256-bit raw quantum key into subkeys (AES key, IV, HMAC key). |
| **AES-256-GCM** | Authenticated Cipher | Galois/Counter Mode cipher providing confidentiality + integrity using 96-bit nonces and 128-bit authentication tags. |
| **BSM** | Bell State Measurement | Quantum measurement performed at repeater nodes to execute **Entanglement Swapping** over multi-hop optical fiber networks. |
| **Cascade & Toeplitz** | Post-Processing | Multi-pass parity block error correction (Cascade) + universal matrix hashing (Toeplitz) for privacy amplification. |

---

## 🏗️ System Architecture & 8 Core Modules

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │  MODULE 1: Quantum Session & Network Topology Manager       │
                               │  Establishes session UUID, SCADA topology, and status.      │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                                                              ▼
                               ┌─────────────────────────────────────────────────────────────┐
                               │  MODULE 2: E91 Quantum Communication Engine                 │
                               │  Simulates EPR Bell pairs |Φ+⟩ on Qiskit AerSimulator.      │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                                                              ▼
                               ┌─────────────────────────────────────────────────────────────┐
                               │  MODULE 3: Quantum Key Management                           │
                               │  Performs basis reconciliation & key sifting (256-bit key). │
                               └──────────────┬──────────────────────────────┬───────────────┘
                                              │                              │
        ┌─────────────────────────────────────┘                              └─────────────────────────────────────┐
        │                                                                                                          │
        ▼                                                                                                          ▼
┌───────────────────────────────┐                                                         ┌────────────────────────────────┐
│ MODULE 4: Security Monitor    │                                                         │ MODULE 7: Repeater & Swapping  │
│ • CHSH Bell Test (S = 2.82)   │                                                         │ • BSM Bell state measurements  │
│ • QBER Error Rate & Fidelity  │                                                         │ • Multi-hop fiber routing      │
└───────────────┬───────────────┘                                                         └───────────────┬────────────────┘
                │                                                                                         │
                ▼                                                                                         │
┌───────────────────────────────┐                                                                         │
│ MODULE 5: Secure SCADA Engine │                                                                         │
│ • HKDF-SHA256 Key Expansion   │                                                                         │
│ • AES-256-GCM Encryption      │                                                                         │
│ • Substation RTU Digital Twin │                                                                         │
└───────────────┬───────────────┘                                                                         │
                │                                                                                         │
                ▼                                                                                         │
┌───────────────────────────────┐                                                                         │
│ MODULE 6: Zero-Trust SOC      │                                                                         │
│ • 20-Stage Verification       │                                                                         │
│ • Live Packet Motion & Attack │                                                                         │
│ • Trust Score Rating (0-100)  │                                                                         │
└───────────────┬───────────────┘                                                                         │
                │                                                                                         │
                └────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                     │
                                                     ▼
                               ┌─────────────────────────────────────────────────────────────┐
                               │  MODULE 8: Cascade Privacy Amplification & AI Analytics     │
                               │  • Multi-pass Cascade Error Correction                       │
                               │  • Toeplitz Universal Matrix Hashing                         │
                               │  • Isolation Forest AI Anomaly Detector                      │
                               └─────────────────────────────────────────────────────────────┘
```

---

## ⚡ Comprehensive Module Breakdown

### 🔹 Module 1: Quantum Session & Network Topology Manager
- **Function**: Manages session state machine (`CREATED` $\to$ `READY` $\to$ `ACTIVE` $\to$ `TERMINATED`) and physical topology between Control Center and SCADA substations.
- **Node Distance Mapping**:
  - `Control_Center` $\to$ `Substation_A`: **15 km** (Excellent Channel)
  - `Control_Center` $\to$ `Substation_B`: **30 km** (Healthy Channel)
  - `Control_Center` $\to$ `Substation_C`: **50 km** (Degraded Channel)
  - `Control_Center` $\to$ `Substation_D`: **80 km** (Long-Distance Repeater Required)
- **Features**: Live node-to-node topology visualization, 60 FPS animated photon pulse waves, ping telemetry, and WebSocket broadcast streaming.

### 🔹 Module 2: E91 Quantum Communication Engine
- **Function**: Simulates physical entangled photon pair generation $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ using IBM Qiskit AerSimulator.
- **Basis Angles**:
  - Alice Basis: $a_1 = 0^\circ$, $a_2 = 45^\circ$, $a_3 = 90^\circ$
  - Bob Basis: $b_1 = 22.5^\circ$, $b_2 = -22.5^\circ$, $b_3 = 67.5^\circ$

### 🔹 Module 3: Quantum Key Management
- **Function**: Executes public basis reconciliation (key sifting).
- **Features**: Discards uncorrelated measurement outcomes to extract a 256-bit raw shared secret key (`shared_key`).

### 🔹 Module 4: Quantum Security Monitor & Decision Engine
- **Function**: Evaluates channel physical integrity using a single source of truth visibility $\gamma$.
- **Two Hard Gatekeepers**:
  1. **Gate 1 (CHSH Bell Test)**: Checks $|S| > 2.0$. If $|S| \le 2.0 \implies \text{FAIL} \to$ Raw key discarded, SCADA blocked.
  2. **Gate 2 (QBER Error Check)**: Checks $\text{QBER} < 11.0\%$. If $\text{QBER} \ge 11.0\% \implies \text{FAIL} \to$ Raw key discarded, SCADA blocked.
- **Quality Assessment**: Fidelity $F \ge 95\% \implies$ `Quantum Channel Verified`, else `Quantum Channel Degraded`.
- **Weighted Security Score**:
  $$\text{Security Score} = 40\% \cdot \text{CHSH} + 35\% \cdot \text{QBER} + 25\% \cdot \text{Fidelity}$$

### 🔹 Module 5: Secure SCADA Communication Engine
- **Function**: Encrypts and dispatches power grid control commands (`TRIP_RELAY`, `CLOSE_BREAKER`, `ADJUST_TRANSFORMER`).
- **Features**:
  - HKDF-SHA256 key derivation with salt `QNetSecure_SCADA_Salt`.
  - AES-256-GCM authenticated encryption (96-bit nonce, 128-bit tag).
  - HMAC-SHA256 constant-time signatures.
  - Substation RTU Digital Twin telemetry (Voltage 230.4V, Current 14.2A, Frequency 60.02Hz).

### 🔹 Module 6: Zero-Trust SOC & Adversarial Attack Simulator
- **Function**: Real-time 20-Stage Zero-Trust Verification Pipeline & Adversarial Threat Simulation.
- **Adversarial Attack Presets**:
  - `MITM Tamper`: Intercepts ciphertext and modifies payload bytes.
  - `Replay Attack`: Intercepts valid sequence number #104 and retransmits it.
  - `Eve Eavesdrop`: Taps optical fiber, raising QBER to 27.6% and dropping CHSH to 1.65.
  - `Bit Flip Attack`: Flips encryption bit mask in transmission.
  - `DoS Flood`: Floods SCADA RTU port with 1,000 invalid requests per second.
- **Features**: Live 20-stage sequential packet motion animation, dynamic Trust Score (0–100) degradation ring, decision tree rationales (`ALLOW` vs `BLOCK`), expandable packet inspector, and filterable audit logs.

### 🔹 Module 7: Quantum Repeaters & Entanglement Swapping
- **Function**: Solves long-distance optical fiber attenuation over 50 km – 80 km links.
- **Features**:
  - Progressive channel degradation modeling across SCADA substations.
  - Bell State Measurements (BSM) performing entanglement swapping across intermediate repeater nodes.
  - Interactive **"Restore via Module 7"** action button raising CHSH from $1.84 \to 2.63$ and dropping QBER to $3.5\%$.

### 🔹 Module 8: Cascade Privacy Amplification & AI Analytics Engine
- **Function**: Post-processing error correction, privacy amplification, and AI threat detection.
- **Features**:
  - Multi-pass Cascade error correction algorithm.
  - Universal Toeplitz matrix hashing for privacy amplification.
  - Isolation Forest ML model detecting anomalous SCADA telemetry and security score drops.

---

### 🛡️ Complete 20-Stage Zero-Trust Verification Pipeline

Every SCADA control command packet passes through 20 sequential verification gates:

```
[1. Packet Parsing] ➔ [2. Source Node Auth] ➔ [3. Session UUID Lookup] ➔ [4. State Validation]
➔ [5. Format Integrity] ➔ [6. Nonce Extraction] ➔ [7. Nonce Uniqueness] ➔ [8. Anti-Replay Check]
➔ [9. Key Expansion] ➔ [10. Cryptographic Salt] ➔ [11. AES-256-GCM Decrypt] ➔ [12. Auth Tag Match]
➔ [13. HMAC-SHA256 Match] ➔ [14. Telemetry Range] ➔ [15. Command Whitelist] ➔ [16. RTU State Sync]
➔ [17. Trust Score Weighting] ➔ [18. Anomaly Detector] ➔ [19. Audit Vault Commit] ➔ [20. SCADA Execution]
```

---

## 🤖 AI Routing Dataset Generator (`ai_routing_dataset.csv`)

QNetSecure includes a **physics-aware and network-aware dataset generator** located at `backend/scripts/generate_ai_routing_dataset.py`.

- **Output File**: `backend/data/ai_routing_dataset.csv`
- **Total Samples**: **100,000 synthetic routing scenarios**
- **Total Features**: **43 columns**
- **Physics Rule**: Derives metrics from single channel visibility $\gamma = 10^{-\alpha d / 160} \cdot \eta \cdot (1-\theta) \cdot (1-P_{\text{dark}})$.
- **Composite Route Score**:
  $$\text{Route Score} = 35\% \text{ Fidelity} + 20\% \text{ QBER} + 15\% \text{ CHSH} + 10\% \text{ Latency} + 10\% \text{ Packet Loss} + 5\% \text{ Health} + 5\% \text{ Threat}$$
- **Target Labels**:
  - `best_route`: Multiclass selection (`Route_A`, `Route_B`, `Route_C`, `Route_D`)
  - `route_decision`: Decision classification (`KEEP_ROUTE`, `ALTERNATIVE_ROUTE`, `REROUTE`, `EMERGENCY_ROUTE`)

---

## 🛠️ Technology Stack

### Backend
- **Core Framework**: Python 3.11 / 3.13, FastAPI, Uvicorn
- **Quantum Simulation**: IBM Qiskit, Qiskit AerSimulator
- **Database & Persistence**: SQLAlchemy Async, SQLite (`qnetsecure.db`), Supabase PostgreSQL
- **Security & Cryptography**: PyCryptodome (AES-256-GCM), hashlib (HKDF-SHA256, HMAC-SHA256), Pydantic v2
- **Real-Time Streaming**: WebSockets, Asyncio

### Frontend
- **Core Framework**: React 18, Vite, TypeScript
- **Styling & UI**: Vanilla CSS, TailwindCSS, Glassmorphism, Custom Animations
- **Icons**: Lucide React
- **Architecture**: Domain Service Layer, Custom EventBus, Single WebSocket Client

---

## 🚀 Quick Start & Installation Guide

### Prerequisites
- Python 3.11 or newer
- Node.js v18 or newer
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Nivetha100307/QNetSecure.git
cd QNetSecure
```

### 2. Backend Setup & Launch
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
*Backend server will start on [http://localhost:8000](http://localhost:8000)*

### 3. Frontend Setup & Launch
In a new terminal window:
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
*Frontend dashboard will open on [http://localhost:5173](http://localhost:5173)*

### 4. Generate 100,000 AI Routing Dataset
```bash
python backend/scripts/generate_ai_routing_dataset.py
```
*Generates `backend/data/ai_routing_dataset.csv` in ~11.5 seconds.*

---

## 🧪 Verification & Testing

### Run Backend Pytest Suite (31 Tests)
```bash
cd backend
python -m pytest
```
*Expected Output: `31 passed in 1.55s (100% pass rate)`*

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
*Expected Output: `✓ built in 4.25s with 0 TypeScript/JSX errors`*

---

## 🛰️ REST API & WebSocket Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/session/start` | Initialize a new quantum session |
| `POST` | `/api/v1/session/activate` | Activate initialized session |
| `GET` | `/api/v1/session/list` | List all sessions |
| `POST` | `/api/v1/quantum/start` | Execute E91 Qiskit Aer measurement shots |
| `POST` | `/api/v1/key/generate` | Perform basis sifting & extract 256-bit key |
| `POST` | `/api/v1/security/analyze` | Execute CHSH Bell test & QBER analysis |
| `POST` | `/api/v1/scada/send` | Encrypt & send AES-256-GCM SCADA command |
| `POST` | `/api/v1/attacks/simulate` | Inject adversarial attack & run Zero-Trust pipeline |
| `POST` | `/api/v1/swapping/execute` | Execute Bell State Measurement at repeater node |
| `POST` | `/api/v1/cascade/reconcile` | Run Cascade error correction & Toeplitz hashing |
| `WS` | `/api/v1/ws/sessions` | Central WebSocket connection for live telemetry & events |

---

## 🎤 Presentation Pitch & Talking Points for Judges

### 30-Second Elevator Pitch
> *"Critical energy infrastructure like power grids cannot rely on classical encryption alone, as post-quantum algorithms and optical fiber eavesdroppers threaten SCADA control systems. **QNetSecure** is a production-ready hybrid platform combining E91 quantum entanglement physics with a 20-stage Zero-Trust Security Operations Center. It detects fiber eavesdropping at the quantum layer using CHSH Bell inequality tests ($S = 2.82$), and blocks tampered or replayed commands at the classical layer using HKDF/AES-256-GCM and real-time trust scoring."*

### 3 Key Technical Highlights to Show Judges

1. **Physical Entanglement Consistency**:
   - Demonstrate that CHSH Bell score ($S = 2.82$), QBER ($1.0\%$), and Fidelity ($99.0\%$) are not random numbers, but are derived strictly from Monte Carlo coincidence sampling ($N_{++}, N_{+-}, N_{-+}, N_{--}$) of an underlying physical visibility model ($\gamma$).
2. **Interactive 20-Stage Zero-Trust Pipeline**:
   - Trigger an adversarial attack (e.g., `Replay Attack` or `MITM Tamper`) in Module 6. Point out how the live packet motion moves through stages 1 to 20, drops the Trust Score from $98.5 \to 35.0$, and halts execution at Stage 8 or 12 with a detailed rationale log.
3. **Progressive Network Degradation & Module 7 Repeaters**:
   - Show how Substation A (15 km) and Substation B (30 km) pass, Substation C (50 km) shows a degraded warning, and Substation D (80 km) fails due to optical loss. Click **"Restore via Module 7"** to demonstrate Bell State Measurement (BSM) entanglement swapping restoring $S \to 2.63$!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
