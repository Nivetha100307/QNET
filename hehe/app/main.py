import asyncio
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.config import settings
from app.db.database import init_db
from app.api.routes import router as api_router
from app.api.websockets import ws_manager
from app.scada.telemetry_generator import telemetry_generator
from app.session.session_manager import session_manager
from app.monitoring.metrics_engine import metrics_engine

# Background Task Handles
telemetry_task = None

async def background_telemetry_loop():
    """Background task streaming real-time telemetry over WebSockets every 1 second."""
    while True:
        try:
            telemetry_data = telemetry_generator.generate_live_telemetry()
            metrics_snapshot = metrics_engine.get_snapshot()
            
            # Broadcast live telemetry snapshot
            await ws_manager.broadcast("TELEMETRY_STREAM", {
                "telemetry": telemetry_data,
                "metrics": metrics_snapshot,
                "timestamp": time.time()
            })
        except Exception as e:
            print(f"[Telemetry Task Error] {e}")
        await asyncio.sleep(settings.TELEMETRY_INTERVAL_SECONDS)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global telemetry_task
    # Startup tasks
    await init_db()
    
    # Initialize default QKD SCADA session
    default_session = session_manager.create_session(sender="SUB_NORTH", receiver="SUB_SOUTH")
    print(f"[QKD Session Initialized] Session ID: {default_session['session_id']} | Key Version: {default_session['key_version']}")
    
    # Start background telemetry loop
    telemetry_task = asyncio.create_task(background_telemetry_loop())
    
    yield
    
    # Shutdown tasks
    if telemetry_task:
        telemetry_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API Routers
app.include_router(api_router, prefix="/api")

from app.api.routes_m6 import router_m6
app.include_router(router_m6, prefix="/api/zero-trust")

from app.api.routes_m8 import router_m8
app.include_router(router_m8, prefix="/api/dashboard")


# WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Maintain active connection
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

# Mount Static & Compiled Vite Assets for Dashboard UI
import os
static_dist_dir = os.path.join(os.path.dirname(__file__), "static", "dist")
static_dir = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(os.path.join(static_dist_dir, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(static_dist_dir, "assets")), name="dist_assets")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def serve_index():
    dist_index_path = os.path.join(static_dist_dir, "index.html")
    if os.path.exists(dist_index_path):
        return FileResponse(dist_index_path)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "ONLINE", "message": "Secure SCADA Engine API is running. Access /api/metrics or /api/devices"}

