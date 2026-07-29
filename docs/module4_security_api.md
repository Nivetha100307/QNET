# QNetSecure API Contract — Module 4: Quantum Security Monitor

This document specifies the complete API contract, mathematical quantum physics equations, database schema, and architecture for Module 4 of **QNetSecure (AI-Enabled E91 Quantum Communication Network)**.

## Base URL
```
http://localhost:8000/api/v1
```

---

## Overview & Workflow

Module 4 executes automated quantum security validation for active session channels by processing raw Qiskit E91 measurement outcomes (Module 2) and sifted key data (Module 3).

```
ACTIVE SESSION ➔ LOAD MEASUREMENTS ➔ LOAD KEY ➔ BELL CORRELATION MATRIX E(a,b) ➔ CHSH PARAMETER (S) ➔ QBER ➔ ESTIMATED FIDELITY ➔ DECISION ENGINE ➔ PERSIST REPORT ➔ WEBSOCKET BROADCAST
```

---

## Mathematical Physics Formulations

### 1. Expectation Correlation Matrix $E(a,b)$
For each co-measured basis pair $(a,b) \in \{Z, X\} \times \{Z, X\}$:
$$E(a,b) = \frac{N(0,0) + N(1,1) - N(0,1) - N(1,0)}{N(0,0) + N(1,1) + N(0,1) + N(1,0)}$$

### 2. CHSH Parameter ($S$)
Computed using the actual basis configuration from Module 2 measurements:
$$S = E(Z,Z) - E(Z,X) + E(X,Z) + E(X,X)$$
- $|S| > 2.0$: **Quantum Entanglement Verified (Pass)**
- $|S| \le 2.0$: **Local Hidden Variables / Eavesdropping Suspected (Fail)**

### 3. Quantum Bit Error Rate (QBER)
$$\text{QBER} = \frac{\text{Different Bits}}{\text{Compared Bits}} \quad \text{for matching basis indices } a_i == b_i$$

### 4. Estimated Quantum State Fidelity ($F$)
$$F = \frac{1 + |E(Z,Z)| + |E(X,X)|}{4} + \frac{1 - \text{QBER}}{2} \quad \text{clamped to } [0.0, 1.0]$$

---

## Centralized Security Thresholds

| Parameter | Secure Boundary | Warning Boundary | Compromised Boundary |
| :--- | :--- | :--- | :--- |
| **CHSH Parameter ($S$)** | $|S| > 2.0$ | $1.8 < |S| \le 2.0$ | $|S| \le 1.8$ |
| **QBER** | $\le 11.0\%$ | $11.0\% < \text{QBER} \le 15.0\%$ | $> 15.0\%$ |
| **State Fidelity ($F$)** | $\ge 0.85$ | $0.70 \le F < 0.85$ | $< 0.70$ |

---

## Database Schema (`quantum_security_reports`)

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | Primary Key, Auto-increment | Internal Database ID |
| `session_uuid` | VARCHAR(36) | Unique, Index, Not Null | Session UUID string |
| `bell_correlations` | JSON | Not Null, Default: `{}` | Bell correlation matrix $E(a,b)$ object |
| `chsh_value` | FLOAT | Not Null | Calculated CHSH parameter $S$ |
| `bell_test_result` | VARCHAR(10) | Not Null | Bell test decision ("PASS" / "FAIL") |
| `qber` | FLOAT | Not Null | Quantum Bit Error Rate decimal ratio |
| `fidelity` | FLOAT | Not Null | Estimated state fidelity (0.0 to 1.0) |
| `security_status` | VARCHAR(20) | Not Null | Security decision ("SECURE", "WARNING", "COMPROMISED") |
| `security_score` | INTEGER | Not Null | Normalized security score (0 to 100) |
| `measurement_count` | INTEGER | Not Null | Total measurement shots analyzed |
| `analysis_time_ms` | FLOAT | Not Null | Analysis duration in milliseconds |
| `report_timestamp` | DATETIME | Not Null, Default: UTC Now | Report creation timestamp |

---

## REST API Endpoints

### 1. Trigger Security Analysis
**`POST /security/analyze`**

#### Request Body (`SecurityAnalysisRequest`)
```json
{
  "session_uuid": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd"
}
```

#### Success Response (`200 OK` — `SecurityAnalysisResponse`)
```json
{
  "session_uuid": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd",
  "bell_test_result": "PASS",
  "chsh_value": 2.67,
  "qber": 0.021,
  "fidelity": 0.982,
  "security_score": 96,
  "security_status": "SECURE",
  "measurement_count": 1024,
  "analysis_time_ms": 118.5,
  "bell_correlations": {
    "ZZ": 0.98,
    "ZX": -0.71,
    "XZ": 0.70,
    "XX": 0.97
  },
  "report_timestamp": "2026-07-30T00:30:00.000Z"
}
```

---

### 2. Get Security Report by UUID
**`GET /security/{session_uuid}`**

#### Success Response (`200 OK`)
Returns full `SecurityAnalysisResponse` object.

---

### 3. Get Security Status Overview
**`GET /security/status/{session_uuid}`**

#### Success Response (`200 OK` — `SecurityStatusResponse`)
```json
{
  "session_uuid": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd",
  "security_status": "SECURE",
  "security_score": 96,
  "chsh_value": 2.67,
  "qber": 0.021
}
```

---

## WebSocket Events

Broadcasted frames over `ws://localhost:8000/api/v1/ws/sessions`:
- `SECURITY_ANALYSIS_STARTED`
- `BELL_TEST_COMPLETED`
- `CHSH_COMPLETED`
- `QBER_COMPLETED`
- `FIDELITY_COMPLETED`
- `SECURITY_REPORT_READY`
