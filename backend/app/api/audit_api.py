from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.services.audit_service import audit_service
from pydantic import BaseModel, ConfigDict
from datetime import datetime

router = APIRouter(prefix="/audit", tags=["Module 9: System Audit Vault"])


class AuditLogSchema(BaseModel):
    id: int
    session_uuid: Optional[str] = None
    module_id: str
    action: str
    severity: str
    operator_role: str
    source_node: Optional[str] = None
    destination_node: Optional[str] = None
    details: Dict[str, Any]
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class CreateAuditLogRequest(BaseModel):
    module_id: str
    action: str
    severity: str = "INFO"
    session_uuid: Optional[str] = None
    operator_role: str = "GRID_ADMIN"
    source_node: Optional[str] = None
    destination_node: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


@router.get("/logs", response_model=List[AuditLogSchema])
async def get_audit_logs(
    module_id: Optional[str] = Query(None, description="Filter by module ID or ALL"),
    severity: Optional[str] = Query(None, description="Filter by severity level (INFO, SUCCESS, WARNING, CRITICAL)"),
    session_uuid: Optional[str] = Query(None, description="Filter by QKD session UUID"),
    search: Optional[str] = Query(None, description="Free text search on action, nodes, role"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves paginated audit log entries from Supabase PostgreSQL."""
    logs = await audit_service.get_logs(
        module_id=module_id,
        severity=severity,
        session_uuid=session_uuid,
        search=search,
        limit=limit,
        offset=offset,
        db=db
    )
    return logs


@router.get("/stats")
async def get_audit_stats(db: AsyncSession = Depends(get_db)):
    """Computes module breakdown and severity summary statistics across all system audit logs."""
    return await audit_service.get_stats(db=db)


@router.post("/log", response_model=AuditLogSchema)
async def create_audit_log(
    req: CreateAuditLogRequest,
    db: AsyncSession = Depends(get_db)
):
    """Records a new system audit log entry into Supabase PostgreSQL."""
    log = await audit_service.log_event(
        module_id=req.module_id,
        action=req.action,
        severity=req.severity,
        session_uuid=req.session_uuid,
        operator_role=req.operator_role,
        source_node=req.source_node,
        destination_node=req.destination_node,
        details=req.details,
        db=db
    )
    return log
