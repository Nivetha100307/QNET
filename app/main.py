"""
FastAPI application entrypoint.

Responsible ONLY for:
- creating the FastAPI app
- wiring middleware
- mounting versioned routers
- registering global exception handlers

No business logic, no Qiskit imports, no DB calls belong here.
Run with:  uvicorn app.main:app --reload
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.exceptions import EntangleNetError
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger(__name__)
settings = get_settings()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description=settings.APP_DESCRIPTION,
        version=settings.APP_VERSION,
        debug=settings.DEBUG,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.exception_handler(EntangleNetError)
    async def entanglenet_exception_handler(request: Request, exc: EntangleNetError):
        logger.error("Handled application error: %s", exc)
        return JSONResponse(
            status_code=400,
            content={"error": exc.__class__.__name__, "detail": str(exc)},
        )

    @app.get("/", tags=["root"])
    async def root() -> dict:
        return {
            "message": f"{settings.APP_NAME} backend is running.",
            "docs": "/docs",
            "api_prefix": settings.API_V1_PREFIX,
        }

    logger.info("%s v%s initialized (%s)", settings.APP_NAME, settings.APP_VERSION, settings.ENVIRONMENT)
    return app


app = create_app()
