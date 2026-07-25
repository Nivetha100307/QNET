# EntangleNet — AI-Enabled E91 Quantum Communication Network

A production-quality backend scaffold for simulating an **E91 entanglement-based
Quantum Key Distribution (QKD) network**, built with clean architecture so
quantum protocols, AI modules, and frontend APIs can all evolve independently.

> **Status:** Structural scaffold only. E91 and other quantum logic are
> intentionally left as `NotImplementedError` stubs — this repo defines the
> shape of the system, not the physics yet.

---

## Tech Stack

| Concern            | Choice                          |
|---------------------|----------------------------------|
| API framework        | FastAPI + Uvicorn                |
| Quantum simulation   | Qiskit + Qiskit Aer              |
| Numerics             | NumPy                            |
| Network topology     | NetworkX                         |
| Classical crypto     | PyCryptodome                     |
| Persistence (later)  | PostgreSQL (SQLAlchemy + asyncpg)|
| Cache/pubsub (later) | Redis                            |
| Real-time transport  | WebSockets                       |

---

## Architecture

EntangleNet follows **Clean Architecture**: dependencies point inward, toward
the domain. Outer layers (API, infrastructure, quantum simulators) implement
interfaces defined by the domain — the domain never depends on them.

```
                     ┌─────────────────────────┐
                     │   API layer (FastAPI)    │  <- thin, HTTP-only
                     └────────────┬─────────────┘
                                  │ calls
                     ┌────────────▼─────────────┐
                     │   Services (use cases)    │  <- orchestrates everything below
                     └───┬─────────┬─────────┬───┘
                         │         │         │
              ┌──────────▼─┐  ┌────▼────┐ ┌──▼────────────┐
              │  Quantum   │  │   AI    │ │ Infrastructure │
              │ (Qiskit)   │  │ (future)│ │ (DB/Redis/WS)  │
              └──────┬─────┘  └────┬────┘ └───────┬────────┘
                     │             │              │
                     └─────────────┼──────────────┘
                                   │ implement
                       ┌───────────▼────────────┐
                       │  Domain (entities +     │  <- zero framework deps
                       │  interfaces / "ports")  │
                       └─────────────────────────┘
```

**Rule of thumb:** `app/domain` never imports FastAPI, Qiskit, SQLAlchemy, or
anything else. Everything else depends inward on `domain`, never the reverse.

---

## Folder Structure

```
entanglenet/
├── app/
│   ├── main.py                      # FastAPI app factory & entrypoint
│   │
│   ├── core/                        # Cross-cutting concerns
│   │   ├── config.py                #   Pydantic Settings (env-driven config)
│   │   ├── logging.py               #   Centralized logging setup
│   │   └── exceptions.py            #   App-wide exception hierarchy
│   │
│   ├── domain/                      # Enterprise business rules (framework-free)
│   │   ├── entities/                #   Plain dataclasses: QKDResult, QuantumNode...
│   │   └── interfaces/              #   Ports: IQuantumBackend, IQKDProtocol,
│   │                                 #   IEavesdropDetector — abstractions that
│   │                                 #   outer layers implement (Dependency Inversion)
│   │
│   ├── quantum/                     # ALL Qiskit-specific code lives here
│   │   ├── e91/                     #   E91 protocol, split by responsibility:
│   │   │   ├── pair_generator.py    #     Bell/EPR pair circuits
│   │   │   ├── basis_selector.py    #     random basis selection
│   │   │   ├── measurement.py       #     circuit execution + result collection
│   │   │   ├── chsh_verifier.py     #     CHSH inequality / eavesdrop check
│   │   │   ├── key_sifting.py       #     raw key sifting
│   │   │   └── e91_protocol.py      #     orchestrates the full E91 run
│   │   ├── channels/                #   Simulated channel models (ideal/noisy)
│   │   ├── simulators/              #   Qiskit Aer backend adapters
│   │   │                            #   (implement domain.interfaces.IQuantumBackend)
│   │   ├── protocols/                #   Future protocols: BB84, B92, etc.
│   │   └── utils/                    #   Shared quantum math/helpers
│   │
│   ├── ai/                          # Future AI modules (isolated dependencies)
│   │   └── interfaces/              #   e.g. IAnomalyDetector, IKeyRateOptimizer
│   │
│   ├── infrastructure/              # Concrete implementations of domain ports
│   │   ├── persistence/             #   PostgreSQL/SQLAlchemy repositories
│   │   ├── websocket/               #   Connection manager, real-time events
│   │   └── crypto/                  #   PyCryptodome: AES, privacy amplification
│   │
│   ├── services/                    # Use-case orchestrators
│   │   └── qkd_session_service.py   #   e.g. runs a full QKD session end-to-end
│   │
│   ├── schemas/                     # Pydantic DTOs for the HTTP boundary
│   │   └── qkd.py                   #   Request/response models (separate from
│   │                                 #   domain entities so API contracts can
│   │                                 #   evolve independently)
│   │
│   └── api/
│       └── v1/
│           ├── router.py            #   Aggregates all v1 routers
│           └── endpoints/
│               └── health.py        #   Liveness probe
│
├── tests/
│   ├── unit/                        # Fast, isolated tests (mock the ports)
│   └── integration/                 # End-to-end tests (real FastAPI TestClient)
│
├── requirements.txt
├── pyproject.toml                   # black / ruff / mypy / pytest config
├── .env.example
├── .gitignore
└── README.md
```

### Why each folder exists

- **`core/`** — things every layer needs (settings, logging, error types) but
  that aren't business logic themselves.
- **`domain/`** — the stable center of the app. Defines *what* the system does
  (entities, ports) without knowing *how*. This is what makes the rest
  swappable and unit-testable without spinning up FastAPI or Qiskit.
- **`quantum/`** — deliberately the only place that imports Qiskit. If you ever
  swap Aer for real IBM Quantum hardware, this is the only package that
  changes. Split by responsibility (pair generation vs. basis selection vs.
  CHSH check vs. sifting) so each piece has a single reason to change and can
  be unit-tested independently — critical for a protocol like E91 where
  correctness of each step matters.
- **`ai/`** — reserved for future anomaly detection / adaptive tuning models.
  Isolated so ML dependencies never leak into the quantum or domain layers.
- **`infrastructure/`** — "detail" implementations (DB, cache, websockets,
  classical crypto) that satisfy domain interfaces. Swappable without
  touching services or quantum code.
- **`services/`** — the only layer allowed to coordinate across quantum,
  domain, and infrastructure. API routers stay thin and just call services.
- **`schemas/`** — API-facing Pydantic models, kept separate from domain
  entities so the HTTP contract can change without touching core logic.
- **`api/`** — versioned FastAPI routers. `v1/` today, `v2/` later, without
  breaking existing consumers.

---

## Getting Started

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env

uvicorn app.main:app --reload
```

Then visit:
- `http://localhost:8000/` — root info
- `http://localhost:8000/docs` — Swagger UI
- `http://localhost:8000/api/v1/health` — health check

Run tests:

```bash
pytest
```

---

## Design Principles Followed

1. **Dependency Inversion** — `services/` and `domain/` depend on interfaces
   (`domain/interfaces`), not concrete Qiskit/DB implementations.
2. **Single Responsibility** — every E91 step (pair generation, basis
   selection, measurement, CHSH check, sifting) is its own module.
3. **Open/Closed** — new protocols (BB84, B92) or new AI detectors can be
   added as new modules implementing existing interfaces, without modifying
   working E91 code.
4. **Testability** — domain and services layers can be tested with mocked
   ports, with zero Qiskit/FastAPI/DB dependency in unit tests.
5. **Separation of API contracts from domain models** — `schemas/` vs.
   `domain/entities` can evolve independently.

---

## Roadmap (not yet implemented)

- [ ] Implement E91 protocol steps in `app/quantum/e91/`
- [ ] Implement `AerBackend` in `app/quantum/simulators/`
- [ ] Wire `QKDSessionService` to a real protocol + persistence
- [ ] Add PostgreSQL models/repositories in `app/infrastructure/persistence/`
- [ ] Add WebSocket live-session broadcasting
- [ ] Add AI-based eavesdropping anomaly detector implementing
      `IEavesdropDetector`
- [ ] Add network topology endpoints backed by NetworkX
