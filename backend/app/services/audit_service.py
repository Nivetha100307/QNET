from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from app.database.connection import AsyncSessionLocal
from app.models.audit_log import SystemAuditLog
from app.core.logging_config import logger


class AuditService:
    """Service layer for centralized system audit logging across Modules 1 through 8."""

    @staticmethod
    async def log_event(
        module_id: str,
        action: str,
        severity: str = "INFO",
        session_uuid: Optional[str] = None,
        operator_role: str = "GRID_ADMIN",
        source_node: Optional[str] = None,
        destination_node: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        db: Optional[AsyncSession] = None
    ) -> SystemAuditLog:
        """Persists a new system audit log entry to Supabase PostgreSQL."""
        log_entry = SystemAuditLog(
            session_uuid=session_uuid,
            module_id=module_id,
            action=action,
            severity=severity.upper(),
            operator_role=operator_role,
            source_node=source_node,
            destination_node=destination_node,
            details=details or {}
        )

        async def _save(session: AsyncSession):
            session.add(log_entry)
            await session.commit()
            await session.refresh(log_entry)
            return log_entry

        try:
            if db:
                return await _save(db)
            else:
                async with AsyncSessionLocal() as session:
                    return await _save(session)
        except Exception as e:
            logger.error(f"Failed to record audit log entry: {str(e)}")
            return log_entry

    @staticmethod
    async def get_logs(
        module_id: Optional[str] = None,
        severity: Optional[str] = None,
        session_uuid: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
        db: Optional[AsyncSession] = None
    ) -> List[SystemAuditLog]:
        """Retrieves paginated audit logs filtered by module, severity, session, or search query."""
        async def _query(session: AsyncSession) -> List[SystemAuditLog]:
            stmt = select(SystemAuditLog)

            if module_id and module_id.upper() != "ALL":
                stmt = stmt.where(SystemAuditLog.module_id == module_id)

            if severity and severity.upper() != "ALL":
                stmt = stmt.where(SystemAuditLog.severity == severity.upper())

            if session_uuid:
                stmt = stmt.where(SystemAuditLog.session_uuid == session_uuid)

            if search:
                term = f"%{search}%"
                stmt = stmt.where(
                    or_(
                        SystemAuditLog.action.ilike(term),
                        SystemAuditLog.module_id.ilike(term),
                        SystemAuditLog.operator_role.ilike(term),
                        SystemAuditLog.source_node.ilike(term),
                        SystemAuditLog.destination_node.ilike(term)
                    )
                )

            stmt = stmt.order_by(desc(SystemAuditLog.timestamp)).offset(offset).limit(limit)
            result = await session.execute(stmt)
            return list(result.scalars().all())

        if db:
            return await _query(db)
        else:
            async with AsyncSessionLocal() as session:
                return await _query(session)

    @staticmethod
    async def get_stats(db: Optional[AsyncSession] = None) -> Dict[str, Any]:
        """Computes summary statistics across all system audit log events."""
        async def _stats(session: AsyncSession) -> Dict[str, Any]:
            total_stmt = select(func.count(SystemAuditLog.id))
            total_count = (await session.execute(total_stmt)).scalar() or 0

            critical_stmt = select(func.count(SystemAuditLog.id)).where(SystemAuditLog.severity == "CRITICAL")
            critical_count = (await session.execute(critical_stmt)).scalar() or 0

            warning_stmt = select(func.count(SystemAuditLog.id)).where(SystemAuditLog.severity == "WARNING")
            warning_count = (await session.execute(warning_stmt)).scalar() or 0

            success_stmt = select(func.count(SystemAuditLog.id)).where(SystemAuditLog.severity == "SUCCESS")
            success_count = (await session.execute(success_stmt)).scalar() or 0

            info_stmt = select(func.count(SystemAuditLog.id)).where(SystemAuditLog.severity == "INFO")
            info_count = (await session.execute(info_stmt)).scalar() or 0

            # Module breakdown
            module_stmt = select(SystemAuditLog.module_id, func.count(SystemAuditLog.id)).group_by(SystemAuditLog.module_id)
            module_res = await session.execute(module_stmt)
            module_breakdown = {row[0]: row[1] for row in module_res.all()}

            return {
                "total_events": total_count,
                "critical_events": critical_count,
                "warning_events": warning_count,
                "success_events": success_count,
                "info_events": info_count,
                "module_breakdown": module_breakdown,
                "success_rate_pct": round((success_count / max(1, total_count - critical_count)) * 100, 1)
            }

        if db:
            return await _stats(db)
        else:
            async with AsyncSessionLocal() as session:
                return await _stats(session)


audit_service = AuditService()
