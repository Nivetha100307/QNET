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
| **GHZ Protocol** | Greenberger-Horne-Zeilinger | Multipartite entanglement protocol $\|\text{GHZ}_N\rangle = \frac{1}{\sqrt{2}}(|00\dots0\rangle + |11\dots1\rangle)$ enabling 1-to-$N$ group quantum communication broadcast from Control Center to multiple substations. |
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

### 🔹 Module 2: Quantum Communication Engine (E91 Pairwise & GHZ Broadcast)
- **Function**: Dual-mode quantum state generator running on IBM Qiskit AerSimulator.
- **Operating Modes**:
  - ⚛️ **Pairwise E91 Mode**: Simulates 2-qubit EPR Bell pair entanglement $|\Phi^+\rangle = \frac{1}{\sqrt{2}}(|00\rangle + |11\rangle)$ for point-to-point QKD sessions between Control Center and individual substations.
  - 🌐 **GHZ Broadcast Mode**: Simulates $N$-qubit Greenberger-Horne-Zeilinger (GHZ) multipartite entanglement $|\text{GHZ}_N\rangle = \frac{1}{\sqrt{2}}(|00\dots0\rangle + |11\dots1\rangle)$ to establish group quantum keys across Control Center and multiple substations simultaneously.
- **Basis Angles (E91)**:
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
- **Adversarial Attack Presets (Active & Passive)**:
  - ⚡ **Active Attacks** (Classical Layer Detection):
    - `MITM Tamper`: Intercepts ciphertext and modifies payload bytes (Caught by Stage 11 Integrity Check & HMAC Tag Match).
    - `Replay Attack`: Intercepts valid sequence number #104 and retransmits it (Caught by Stage 7 Monotonic Counter & Stage 15 Replay Cache).
    - `Bit Flip Attack`: Flips encryption bit mask in transmission (Caught by Stage 8 Schema Validation).
    - `DoS Flood`: Floods SCADA RTU port with 1,000 invalid requests per second (Caught by Stage 18 Trust Evaluation).
  - 👁️ **Passive Attacks** (Quantum Layer Detection — *Classical Firewalls Are 100% Blind*):
    - `Passive Fiber Tapping (Beam Splitting)`: Passive optical splitter taps 20% of photon light power. Classical payload is **0% modified** (Classical IDSs report healthy traffic), but Quantum Mechanics causes photon state collapse ($\text{QBER} = 18.5\% \ge 11.0\%$, $S = 1.72 \le 2.0$), halting execution at Stage 9.
    - `Passive Photon Number Splitting (PNS Attack)`: Passive interception of multi-photon pulse states without packet alteration. Quantum state entanglement collapses, dropping Fidelity to $68.5\%$ ($S = 1.64 \le 2.0$).
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

## 🖥️ Interactive Dashboard & Web UI Tab-by-Tab Feature Guide

The QNetSecure frontend is built with **React 18**, **TypeScript**, and **TailwindCSS**, utilizing a sleek slate dark theme, glassmorphic containers, live WebSocket streaming, and interactive telemetry widgets.

Below is an exhaustive tab-by-tab guide detailing the layout, interactive features, visualization components, controls, and real-time workflows available across all **9 Dashboard Tabs**:

---

### 1️⃣ Module 1: Session Init & Network Topology Manager (`module1`)
> **Sidebar Badge**: `Core` | **Primary Purpose**: Session State Control & SCADA Node Topology Visualization

- **Session Initialization Control Form**:
  - **Source Node & Destination Node Dropdowns**: Interactive selection between `Control_Center` and substations (`Substation_A`, `Substation_B`, `Substation_C`, `Substation_D`).
  - **Protocol & Session Type**: Enforces `E91` protocol with support for `SIMULATION` or `HARDWARE` execution modes.
  - **Start & Initialize Button**: Triggers `POST /api/v1/session/start` to register a new quantum session UUID in memory and local SQLite storage.
- **Active Session Overview Card**:
  - **Session UUID & Status Badge**: Highlights active state (`CREATED` ➔ `READY` ➔ `ACTIVE` ➔ `TERMINATED`).
  - **Session Action Controls**:
    - ⚡ **Activate Session**: Promotes initialized session to `ACTIVE` status.
    - ⏹️ **Terminate Session**: Gracefully closes quantum channels, invalidating active key material.
    - 🚨 **Terminate All Sessions**: Emergency global kill-switch halting all active SCADA quantum channels across all nodes simultaneously.
  - **Session Counters**: Real-time counters displaying total SCADA messages dispatched and aggregate bytes transferred.
- **Interactive Node Communication Topology Visualizer**:
  - **SVG Grid Map**: Renders physical layout connecting Control Center to Substations A through D.
  - **Animated Optical Pulse Waves**: 60 FPS animated SVG photon pulses travelling along fiber paths.
  - **Node Hover Telemetry**: Displays distance in kilometers (15 km to 80 km), optical attenuation (dB/km), link health, and single-click node pair selection.
- **Substation Optical Node Ping Grid**:
  - **Real-Time Latency Monitors**: Dynamic ping telemetry with natural jitter simulation (1.2 ms to 4.0 ms) across all 5 active nodes.
  - **Infrastructure Status Indicator**: Pulse lights indicating node operational state (`HEALTHY`, `DEGRADED`, `DISCONNECTED`).

---

### 2️⃣ Module 2: Quantum Engine (E91 Simulation) (`module2`)
> **Sidebar Badge**: `E91` | **Primary Purpose**: IBM Qiskit Aer Entangled Photon Pair Generation & Measurement

- **Quantum Shot Configuration Bar**:
  - **Shot Count Selector**: Interactive controls to set measurement sample count ($N = 512, 1024, 2048, 4096$ shots).
  - **Run Simulation Engine Button**: Executes `POST /api/v1/quantum/start` to run IBM Qiskit AerSimulator Bell pair measurement circuits.
- **Multi-View Inspection Workspace**:
  - 📊 **Outcomes Sub-Tab**: Paginated measurement table listing per-photon pair ID, Alice measurement basis angle ($a_1, a_2, a_3$), Bob basis angle ($b_1, b_2, b_3$), measured bit values ($0/1$), basis alignment status (`MATCH` / `DISCARD`), and bit coincidence agreement.
  - 💻 **OpenQASM Code Sub-Tab**: Displays real-time auto-generated OpenQASM 2.0 / 3.0 quantum assembly code used to program the Qiskit quantum circuit, complete with syntax highlighting and one-click copy button.
  - ⚛️ **Quantum Circuit Visualizer Sub-Tab**: Graphical circuit diagram visualizing Hadamard ($H$) gates, Controlled-NOT ($CNOT$) entanglement gates, and $R_y(\theta)$ basis rotation gates.
- **Basis Alignment & Match Analytics**:
  - **Coincidence Statistics Cards**: Real-time calculation of total photon pairs, matching basis percentage (~$50\%$), and bit coincidence agreement counts.

---

### 3️⃣ Module 3: Key Management & Sifting (`module3`)
> **Sidebar Badge**: `QKD` | **Primary Purpose**: Public Basis Reconciliation, Key Sifting & Secret Key Extraction

- **Quantum Key Generation Action Panel**:
  - **Generate Key Button**: Triggers `POST /api/v1/key/generate` executing public basis reconciliation (sifting) over measurement data.
- **256-Bit Raw Shared Key Inspector**:
  - **Formatted Hexadecimal & Binary Display**: Displays the derived 256-bit raw quantum encryption key with single-click copy-to-clipboard functionality.
  - **Fingerprint Hash**: Visual SHA-256 key fingerprint verifying identical key extraction at both Alice and Bob ends.
- **Key Sifting Efficiency Metrics**:
  - **Raw Bits vs Sifted Bits Counter**: Displays input raw quantum bits ($1,024$) vs retained sifted key length ($256$ bits).
  - **Sifting Yield Percentage**: Visual progress bar showing sifting efficiency (~$50.0\%$).
  - **Shannon Entropy Gauge**: Validates key randomness ($1.000$ bits/symbol).
- **Interactive Key Inspection Views**:
  - 🔑 **Shared Key View**: Clean, formatted secret key output.
  - 🔍 **Basis Comparison Matrix**: Detailed side-by-side table comparing Alice's basis vs Bob's basis for every photon shot, color-coding matched basis indices in emerald green and discarded indices in dark slate.
  - 📍 **Sifted Index List**: Array map of exact photon indices retained for key assembly.
- **Key Export Options**: Download secret key metadata in JSON or raw binary key format.

---

### 4️⃣ Module 4: Security Monitor & CHSH/QBER Dashboard (`module4`)
> **Sidebar Badge**: `CHSH` | **Primary Purpose**: Physical Quantum Channel Integrity Assessment & Entanglement Testing

- **Channel Physical Verification Banner**:
  - **Overall Security Status**: Large dynamic badge displaying `QUANTUM CHANNEL VERIFIED` (Green), `CHANNEL DEGRADED` (Yellow), or `EAVESDROPPER DETECTED` (Red).
- **CHSH Bell Inequality Test Card**:
  - **Bell Parameter Score Meter**: Displays calculated Bell value $S$ (Ideal $S = 2.8284$). If $|S| \le 2.0$, triggers immediate red alert indicating classical local realism (loss of entanglement or eavesdropping).
  - **Bell Coincidence Correlators Grid**: Shows individual expectation values $E(a_1,b_1)$, $E(a_1,b_2)$, $E(a_2,b_1)$, $E(a_2,b_2)$ derived from Monte Carlo coincidence counting.
- **QBER Error Rate Monitor**:
  - **Quantum Bit Error Rate Meter**: Gauge displaying current QBER $\%$. Highlights the strict E91 security threshold at $\mathbf{11.0\%}$.
- **Entanglement State Fidelity Meter**:
  - **Fidelity Score ($F$)**: Displays quantum state purity percentage ($0.5 \le F \le 1.0$) calculated directly from physical channel visibility $\gamma$.
- **Composite Security Score Ring**:
  - **Weighted Security Rating**: Dynamic circular progress ring evaluating overall channel security using formula:
    $$\text{Score} = 40\% \cdot \text{CHSH} + 35\% \cdot \text{QBER} + 25\% \cdot \text{Fidelity}$$
- **Real-Time Interactive Channel Telemetry Graph**:
  - **Dual-Axis Line Chart**: Live chart plotting QBER $\%$ and Bell parameter $S$ over time via WebSocket updates, rendering threshold marker lines for immediate visual alert on channel degradation.

---

### 5️⃣ Module 5: SCADA Encryption & Digital Twin Engine (`module5`)
> **Sidebar Badge**: `AES-GCM` | **Primary Purpose**: Authenticated SCADA Control Command Encryption & RTU Telemetry

- **SCADA Command Console**:
  - **Quick Command Presets**: One-click action buttons to send grid control commands:
    - ⚡ `TRIP_RELAY`: Emergency circuit breaker trip signal.
    - 🔒 `CLOSE_BREAKER`: Grid re-closure command.
    - ⚡ `ADJUST_TRANSFORMER`: Tap changer voltage adjustment.
    - 🔄 `SYNC_GRID`: Phase synchronization pulse.
  - **Custom JSON Command Payload Editor**: Custom input for specialized SCADA RTU control vectors.
- **Cryptographic Engine Visualizer**:
  - **HKDF-SHA256 Key Expansion Block**: Shows salt `QNetSecure_SCADA_Salt` expanding 256-bit quantum key into separate AES cipher key, IV, and HMAC key.
  - **AES-256-GCM Authenticated Encryption Pipeline**: Step-by-step display of 96-bit Nonce generation, Ciphertext byte assembly, and 128-bit Authentication Tag generation.
  - **HMAC-SHA256 Signature Card**: Generates constant-time HMAC-SHA256 signature for payload verification.
- **Substation RTU Digital Twin Grid**:
  - **Live Telemetry Gauges**: Real-time grid parameters:
    - **Voltage**: $230.4\text{ V} \pm 0.8\text{ V}$
    - **Current**: $14.2\text{ A} \pm 0.3\text{ A}$
    - **Frequency**: $60.02\text{ Hz} \pm 0.01\text{ Hz}$
    - **Breaker Status**: `CLOSED` (Green) / `OPEN` (Red)
- **Command Dispatch Log & Zero-Trust Redirect**:
  - **Payload Hex Viewer**: Displays encrypted payload bytes, nonce, and auth tag.
  - 🛡️ **Inspect in Zero-Trust SOC Button**: Direct shortcut passing dispatched payload directly into Module 6 for 20-stage security verification.

---

### 6️⃣ Module 6: Zero-Trust SOC & Adversarial Attack Simulator (`module6`)
> **Sidebar Badge**: `20-Stage` | **Primary Purpose**: Real-Time 20-Stage Packet Verification & Adversarial Threat Simulation

- **Adversarial Threat Simulation Control Center**:
  - ⚡ **Active Classical Attack Presets**:
    - `MITM Tamper`: Modifies encrypted payload bytes in transit (Caught by Stage 11 & 12 Auth Tag Match).
    - `Replay Attack`: Resends previously executed sequence packet (Caught by Stage 7 & 8 Anti-Replay Check).
    - `Bit Flip`: Alters ciphertext bit mask (Caught by Stage 5 & 11 Cryptographic Check).
    - `DoS Flood`: Floods port with high-frequency invalid traffic (Caught by Stage 17 & 18 Trust Rating).
  - 👁️ **Passive Quantum Attack Presets**:
    - `Beam Splitting (Optical Fiber Tapping)`: Taps 20% photon power. Classical firewalls are 100% blind (Classical packet bytes modified = 0%), but Quantum Mechanics causes state collapse ($\text{QBER} = 18.5\% \ge 11.0\%$, $S = 1.72 \le 2.0$), halting execution at Stage 9.
    - `Photon Number Splitting (PNS)`: Intercepts multi-photon pulses, collapsing entanglement fidelity to $68.5\%$.
- **Live 20-Stage Sequential Packet Verification Stepper**:
  - **Animated Node-to-Stage Motion**: Visual packet icon traveling sequentially through all 20 Zero-Trust gates with color-coded node statuses (Emerald Green = Pass, Rose Red = Halt & Reject).
- **Dynamic Trust Score Degradation Gauge**:
  - **Animated Trust Ring (0-100)**: Displays packet credibility score. Drops dynamically from $98.5$ to $<40.0$ when an attack is detected.
- **Decision Engine Rationale Inspector**:
  - **Rule-by-Rule Decision Box**: Provides exact human-readable text explaining why a packet was marked `ALLOW` or `BLOCK` (e.g., *"REJECTED: Stage 12 Authentication Tag mismatch indicates payload tampering in transit"*).
- **Expandable Packet Inspection Drawer**:
  - Deep-dive inspector displaying full packet metadata, headers, ciphertext hex, HMAC tags, and stage-by-stage latency timings.

---

### 7️⃣ Module 7: Quantum Repeaters & Entanglement Swapping (`module7`)
> **Sidebar Badge**: `BSM` | **Primary Purpose**: Multi-Hop Optical Fiber Routing & Entanglement Swapping via Bell State Measurements

- **Multi-Hop Substation Network Distance Map**:
  - Visual topology representing optical fiber distance degradation across substations (15 km, 30 km, 50 km, 80 km).
  - **Degradation Indicator**: Highlights severe signal loss and entanglement decay over distances $>40\text{ km}$.
- **Bell State Measurement (BSM) Control Panel**:
  - **Execute BSM Button**: Triggers `POST /api/v1/swapping/execute` performing joint Bell State Measurement at intermediate repeater nodes to swap quantum entanglement across hops.
- **Interactive "Restore via Module 7" Action Trigger**:
  - One-click recovery control allowing operators to bypass degraded or tapped optical links, restoring Bell parameter score from $S = 1.84 \to 2.63$ and dropping QBER from $18.2\% \to 3.5\%$.
- **Before / After Quantum Telemetry Comparison Table**:
  - Side-by-side comparative table showing metric recovery across raw distance, single-hop QBER, swapped QBER, CHSH parameter $S$, and state fidelity $F$.

---

### 8️⃣ Module 8: Cascade Privacy Amplification & AI Analytics (`module8`)
> **Sidebar Badge**: `Cascade` | **Primary Purpose**: Post-Processing Error Correction, Privacy Amplification & AI Anomaly Detection

- **Cascade Multi-Pass Parity Error Correction Panel**:
  - **Multi-Pass Visualizer**: Visual step-by-step progress tracking Cascade error correction passes ($Pass_1, Pass_2, Pass_3, Pass_4$), correcting residual bit errors in sifted quantum keys without leaking secret key entropy.
- **Toeplitz Universal Hashing Privacy Amplification Module**:
  - **Matrix Multiplication Visualizer**: Graphical view of Toeplitz matrix hashing compressing sifted key to remove any partial information an eavesdropper might have gained during measurement or error correction.
- **Isolation Forest AI Threat Detection Engine**:
  - **AI Anomaly Radar**: Machine learning anomaly detector trained on SCADA telemetry feature vectors and quantum channel metrics.
  - **Anomaly Indicator Cards**: Plots feature vectors in real time, calculating anomaly probability scores and identifying anomalous SCADA control signals.
- **AI Analytics Summary Metrics**:
  - Displays Model Precision, Recall, Contamination Ratio ($0.05$), and Threat Classification Confidence.

---

### 9️⃣ Module 9: System Audit Vault & Telemetry Stream (`module9`)
> **Sidebar Badge**: `Supabase` | **Primary Purpose**: Central Immutable Security Audit Logging & Multi-Database Synchronization

- **Comprehensive Security Audit Event Table**:
  - **Live Audit Feed**: Displays all security events, Zero-Trust pipeline decisions, QKD session events, and attack alerts.
  - **Multi-Column Data Fields**: Event ID, Timestamp, Session UUID, Module Origin, Severity Level, Target Node, and Event Description.
- **Interactive Event Filtering Controls**:
  - **Severity Filter**: Filter logs by `INFO`, `WARNING`, `CRITICAL`, or `SUCCESS`.
  - **Search Bar**: Instant text search across session UUIDs, node names, and error rationale strings.
- **Event Severity Breakdown Bar**:
  - **Visual Distribution**: Color-coded progress bar illustrating total count and percentage distribution of system log severities.
- **Export & Log Management Controls**:
  - 📥 **Export to CSV / JSON**: Download complete system audit logs for offline compliance reporting.
  - 🔄 **Refresh Telemetry Vault**: Manual sync button re-fetching latest audit logs from backend storage.
- **Multi-Database Vault Sync Status**:
  - **Dual Connection Badges**: Visual indicators confirming real-time synchronization with both local SQLite database (`qnetsecure.db`) and cloud Supabase PostgreSQL instance.

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
