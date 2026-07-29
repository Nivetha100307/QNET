# QNetSecure API Contract — Module 1: Session & Network Initialization

This document specifies the complete API contract for Module 1 of **QNetSecure (AI-Enabled E91 Quantum Communication Network)**.

## Base URL
```
http://localhost:8000/api/v1
```

## Interactive OpenAPI Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## Shared Enums

### SCADA Node Names (`NodeName`)
- `Control_Center`
- `Substation_A`
- `Substation_B`
- `Substation_C`
- `Substation_D`

### Protocol Types (`ProtocolType`)
- `E91` (Ekert 91 Entanglement-based QKD)
- `BB84` (Future expansion)

### Session Status FSM (`SessionStatus`)
`IDLE` ➔ `INITIALIZING` ➔ `READY` ➔ `ACTIVE` ➔ `TERMINATED`

---

## API Endpoints

### 1. Create & Initialize Secure Session
**`POST /session/start`**

Initializes quantum and classical channels between two SCADA nodes and transitions session status to `READY`.

#### Request Header
`Content-Type: application/json`

#### Request Body (`SessionCreateRequest`)
```json
{
  "source_node": "Substation_A",
  "destination_node": "Control_Center",
  "protocol": "E91",
  "session_type": "SIMULATION"
}
```

#### Success Response (`201 Created`)
```json
{
  "id": 1,
  "session_id": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd",
  "source_node": "Substation_A",
  "destination_node": "Control_Center",
  "protocol": "E91",
  "session_type": "SIMULATION",
  "status": "READY",
  "route": [
    "Substation_A",
    "Control_Center"
  ],
  "quantum_channel": {
    "status": "CONNECTED",
    "latency_ms": 10.0,
    "photon_loss": 0.0,
    "noise_level": 0.0,
    "bell_score": null,
    "qber": null,
    "fidelity": null
  },
  "classical_channel": {
    "status": "CONNECTED",
    "latency_ms": 5.0,
    "authentication_ready": true,
    "encryption_ready": false
  },
  "node_status": {
    "Substation_A": "HEALTHY",
    "Control_Center": "HEALTHY"
  },
  "message_count": 0,
  "bytes_transferred": 0,
  "timeline": [
    {
      "timestamp": "2026-07-29T21:45:00.000Z",
      "event": "SESSION_CREATED",
      "status": "INITIALIZING",
      "details": "Session initialized"
    },
    {
      "timestamp": "2026-07-29T21:45:00.015Z",
      "event": "SESSION_READY",
      "status": "READY",
      "details": "Session ready for key distribution"
    }
  ],
  "created_at": "2026-07-29T21:45:00.000Z",
  "updated_at": "2026-07-29T21:45:00.015Z",
  "ended_at": null
}
```

#### Error Codes
| Status Code | Reason | Example Response |
| :--- | :--- | :--- |
| **`400 Bad Request`** | Source equals Destination node | `{"detail": "Destination node cannot be equal to source node."}` |
| **`409 Conflict`** | Active session already exists between nodes | `{"detail": "An active session already exists between Substation_A and Control_Center."}` |

---

### 2. Activate Session
**`POST /session/activate`**

Transitions session state from `READY` to `ACTIVE`.

#### Request Body (`SessionActivateRequest`)
```json
{
  "session_id": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd"
}
```

#### Success Response (`200 OK`)
Returns complete updated `SessionResponse` object with `"status": "ACTIVE"`.

#### Error Codes
| Status Code | Reason | Example Response |
| :--- | :--- | :--- |
| **`400 Bad Request`** | Illegal FSM transition (e.g. TERMINATED to ACTIVE) | `{"detail": "Cannot transition session from state 'TERMINATED' to 'ACTIVE'."}` |
| **`404 Not Found`** | Session UUID does not exist | `{"detail": "Session '...' not found."}` |

---

### 3. Terminate Session
**`POST /session/end`**

Terminates an active or ready quantum communication session.

#### Request Body (`EndSessionRequest`)
```json
{
  "session_id": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd"
}
```

#### Success Response (`200 OK`)
Returns updated `SessionResponse` object with `"status": "TERMINATED"` and non-null `"ended_at"` timestamp.

#### Error Codes
| Status Code | Reason | Example Response |
| :--- | :--- | :--- |
| **`400 Bad Request`** | Session is already terminated | `{"detail": "Cannot transition session from state 'TERMINATED' to 'TERMINATED'."}` |
| **`404 Not Found`** | Session UUID does not exist | `{"detail": "Session '...' not found."}` |

---

### 4. List All Sessions
**`GET /session/list`**

Returns array of all stored sessions ordered by creation date descending.

#### Success Response (`200 OK`)
```json
[
  {
    "id": 1,
    "session_id": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd",
    "status": "READY",
    ...
  }
]
```

---

### 5. Get Session Details by UUID
**`GET /session/{session_id}`**

#### Success Response (`200 OK`)
Returns full `SessionResponse` object.

#### Error Codes
| Status Code | Reason | Example Response |
| :--- | :--- | :--- |
| **`404 Not Found`** | Session UUID not found | `{"detail": "Session '...' not found."}` |

---

### 6. Get Lightweight Session Status
**`GET /session/status/{session_id}`**

#### Success Response (`200 OK`)
```json
{
  "session_id": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd",
  "status": "READY",
  "source_node": "Substation_A",
  "destination_node": "Control_Center",
  "protocol": "E91",
  "quantum_channel_status": "CONNECTED",
  "classical_channel_status": "CONNECTED"
}
```

---

## Real-Time WebSocket Events

**Endpoint:** `ws://localhost:8000/api/v1/ws/sessions`

Client connections receive real-time JSON frames upon session lifecycle events:

```json
{
  "event": "SESSION_CREATED",
  "data": {
    "session_id": "4f9d2c18-9104-4b5c-a81d-e59fa20b12cd",
    "source_node": "Substation_A",
    "destination_node": "Control_Center",
    "protocol": "E91",
    "status": "READY"
  }
}
```

Emitted Events:
- `SESSION_CREATED`
- `CHANNEL_CONNECTED`
- `SESSION_READY`
- `SESSION_ACTIVATED`
- `SESSION_TERMINATED`
