from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging_config import logger
from app.database.connection import init_db
from app.api.session import router as session_router
from app.api.websocket import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """App lifespan manager initializing database tables on startup."""
    logger.info("Initializing QNetSecure Quantum SCADA Framework backend...")
    try:
        await init_db()
        logger.info("Database schema setup complete.")
    except Exception as e:
        logger.warning(f"Database initialization deferred or failed: {str(e)}")
    
    yield
    logger.info("QNetSecure Backend shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-Ready Quantum-Secured SCADA Communication Framework (Module 1)",
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

# Register Routers
app.include_router(session_router, prefix=settings.API_V1_STR)
app.include_router(ws_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root() -> dict:
    """Root status check endpoint."""
    return {
        "status": "ONLINE",
        "system": settings.APP_NAME,
        "module": "Module 1 - Session & Network Initialization",
        "protocol": "E91 Quantum Cryptography Framework"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
