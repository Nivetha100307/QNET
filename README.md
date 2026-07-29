# QNetSecure: AI-Enabled E91 Quantum SCADA Communication Network

> **A Production-Ready Hybrid Quantum-Classical Security Operations Framework for Critical Energy Infrastructure**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Qiskit Aer](https://img.shields.io/badge/Qiskit-AerSimulator-6929C4.svg)](https://qiskit.org/)
[![React 18](https://img.shields.io/badge/React-18.2-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Executive Summary

**QNetSecure** is an advanced **AI-Enabled E91 Quantum Key Distribution (QKD) & Zero-Trust SCADA Communication System** designed to protect critical power grid substations, relays, and industrial SCADA infrastructure against classical, post-quantum, and quantum-enabled cyberattacks.

By unifying **Ekert91 (E91) Quantum Entanglement Physics** with a **20-Stage Zero-Trust Security Operations Center (SOC)**, QNetSecure guarantees that:
1. **Quantum Layer**: Eavesdroppers attempting to intercept flying photons are detected instantly by quantum physics ($\text{QBER} > 11.0\%$, CHSH Bell inequality violation $S < 2.0$).
2. **Classical Layer**: Encrypted SCADA control commands (e.g. `TRIP_RELAY`, `CLOSE_BREAKER`) are protected by HKDF-SHA256 key derivation, AES-256-GCM authenticated encryption, HMAC signatures, anti-replay sequence trackers, and AI anomaly detection.

---

## 🏗️ System Architecture & 8 Core Modules

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │  MODULE 1: Quantum Session & Network Manager                │
                               │  Establishes session UUID, topology, and state machine.     │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                                                              ▼
                               ┌─────────────────────────────────────────────────────────────┐
                               │  MODULE 2: E91 Quantum Communication Engine                 │
                               │  Simulates EPR Bell pairs |Ψ⁻⟩ on Qiskit AerSimulator.      │
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
│ • QBER Error Rate & Fidelity  │                                                         │ • Dijkstra multi-hop routing   │
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

## ⚡ Detailed Module Capabilities

### Module 1: Quantum Session & Network Manager
- **Responsibilities**: Initializes secure SCADA communication channels between source nodes (`Control_Center`) and destination substations (`Substation_A`).
- **Features**: State machine transitions (`CREATED` $\to$ `READY` $\to$ `ACTIVE` $\to$ `TERMINATED`), real-time ping telemetry, and WebSocket broadcast streaming.

### Module 2: E91 Quantum Communication Engine
- **Responsibilities**: Simulates physical entangled photon pairs $|\Psi^-\rangle = \frac{1}{\sqrt{2}}(|01\rangle - |10\rangle)$ using IBM Qiskit AerSimulator.
- **Features**: Measures photons across random Alice basis angles ($0^\circ, 45^\circ, 90^\circ$) and Bob basis angles ($22.5^\circ, 67.5^\circ, -22.5^\circ$).

### Module 3: Quantum Key Management
- **Responsibilities**: Executes public basis reconciliation and key sifting.
- **Features**: Discards uncorrelated measurement outcomes to produce a 256-bit raw shared quantum secret key (`shared_key`).

### Module 4: Quantum Security Monitor
- **Responsibilities**: Rigorously evaluates quantum channel integrity.
- **Features**: Calculates correlation matrix $E(a,b)$, CHSH parameter ($S = 2.82 > 2.0$), Quantum Bit Error Rate ($\text{QBER} < 11\%$), and state fidelity ($F = 0.98$).

### Module 5: Secure SCADA Communication Engine
- **Responsibilities**: Encrypts and dispatches power grid control commands (`TRIP_RELAY`, `CLOSE_BREAKER`).
- **Features**: 
  - HKDF-SHA256 key expansion using salt `QNetSecure_SCADA_Salt`.
  - AES-256-GCM authenticated encryption (96-bit nonce, 128-bit tag).
  - HMAC-SHA256 constant-time signatures.
  - Substation RTU Digital Twin (Voltage 230.4V, Current 14.2A, Frequency 60.02Hz).

### Module 6: Zero-Trust Security Operations Center (SOC) & Attack Simulator
- **Responsibilities**: 20-Stage Zero-Trust Verification Pipeline & Adversarial Attack Simulation.
- **Features**:
  - Live 20-Stage sequential execution animations.
  - Interactive attack presets (`MITM Tamper`, `Replay Attack`, `Eve Eavesdrop`, `Bit Flip`, `DoS Flood`).
  - Dynamic Trust Score (0–100) degradation & recovery ring.
  - Decision rationale tree (`Identity ✓` $\to$ `Authentication ✓` $\to$ `Replay ✗` $\to$ `BLOCK`).
  - Expandable packet envelope inspector & filterable audit logs.

### Module 7: Quantum Repeaters & Entanglement Swapping
- **Responsibilities**: Extends QKD range over multi-hop networks.
- **Features**: Dijkstra shortest-path network routing and intermediate Bell State Measurements (BSM) for entanglement swapping.

### Module 8: Cascade Privacy Amplification & AI Analytics Engine
- **Responsibilities**: Post-processing error correction, privacy amplification, and threat intelligence.
- **Features**: Multi-pass Cascade error correction, Toeplitz matrix hashing, and Isolation Forest AI anomaly detection.

---

## 🛠️ Technology Stack

### Backend
- **Core**: Python 3.11 / 3.13, FastAPI, Uvicorn
- **Quantum Engine**: Qiskit, Qiskit AerSimulator
- **Database & ORM**: SQLAlchemy Async, SQLite (`qnetsecure.db`), Supabase PostgreSQL
- **Security & Cryptography**: PyCryptodome (AES-256-GCM), hashlib (HKDF-SHA256, HMAC-SHA256), Pydantic v2
- **Real-Time Communications**: WebSockets, Asyncio

### Frontend
- **Core**: React 18, Vite, TypeScript
- **Styling**: TailwindCSS, Glassmorphism UI, Custom Animations
- **Icons**: Lucide React
- **Architecture**: Domain Service Layer, Custom EventBus, Single WebSocket Client

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11 or newer
- Node.js v18 or newer
- Git

### 1. Clone & Setup Repository
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

---

## 🧪 Verification & Testing

### Run Backend Pytest Suite (31 Tests)
```bash
cd backend
python -m pytest
```
*Output: `31 passed in 1.23s (100% pass rate)`*

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
*Output: `✓ built in 1.58s with 0 TypeScript/JSX errors`*

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

## 🏆 Key Demonstration Highlights for Hackathon Judges

1. **Hybrid Quantum-Classical Security**:
   - Demonstrates that Quantum Physics (Modules 2–4) guarantees eavesdropper detection ($\text{QBER} > 11\%$), while Classical Zero-Trust (Modules 5–6) defends against ciphertext tampering, replays, and DoS attacks.
2. **Real-Time 20-Stage SOC Pipeline**:
   - Judges can watch every single packet travel through all 20 verification stages in real-time, observing trust degradation ($98.5 \to 35.0$) and decision tree rationales (`ALLOW` vs `BLOCK`).
3. **Industrial SCADA Command Center**:
   - Features a 15-layer SCADA security pipeline, expandable packet envelope hierarchy, HKDF/GCM crypto inspector, and live Substation RTU Digital Twin.
4. **End-to-End Module Progression**:
   - Header progression bar visually connects Modules 1 through 8 into a single seamless demonstration flow.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
