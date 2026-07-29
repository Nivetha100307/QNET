from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging_config import logger
from app.database.connection import init_db

# Routers for Modules 1 through 8
from app.api.session import router as session_router
from app.api.quantum import router as quantum_router
from app.key_management.key_api import router as key_router
from app.security.security_api import router as security_router
from app.scada.scada_api import router as scada_router
from app.zero_trust.zero_trust_api import router as zero_trust_router
from app.repeater.repeater_api import router as repeater_router
from app.cascade.cascade_api import router as cascade_router
from app.api.websocket import router as ws_router

from app.services.telemetry_simulator import telemetry_simulator


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """App lifespan manager initializing database tables on startup."""
    logger.info("Initializing QNetSecure Quantum SCADA Framework backend...")
    try:
        await init_db()
        logger.info("Database schema setup complete.")
    except Exception as e:
        logger.warning(f"Database initialization deferred or failed: {str(e)}")
    
    # Launch telemetry simulation loop
    telemetry_simulator.start_loop()
    
    yield
    
    logger.info("Stopping telemetry background loop...")
    telemetry_simulator.stop_loop()
    logger.info("QNetSecure Backend shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Ready Quantum-Secured SCADA Communication Framework (Modules 1–8 Unified Architecture)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register All Module Routers
app.include_router(session_router, prefix=settings.API_V1_STR)
app.include_router(quantum_router, prefix=settings.API_V1_STR)
app.include_router(key_router, prefix=settings.API_V1_STR)
app.include_router(security_router, prefix=settings.API_V1_STR)
app.include_router(scada_router, prefix=settings.API_V1_STR)
app.include_router(zero_trust_router, prefix=settings.API_V1_STR)
app.include_router(repeater_router, prefix=settings.API_V1_STR)
app.include_router(cascade_router, prefix=settings.API_V1_STR)
app.include_router(ws_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root() -> dict:
    """Root status check endpoint."""
    return {
        "status": "ONLINE",
        "system": settings.APP_NAME,
        "modules": "Modules 1 through 8 Unified Engine",
        "protocol": "E91 Quantum Cryptography & Zero-Trust SCADA Framework"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
