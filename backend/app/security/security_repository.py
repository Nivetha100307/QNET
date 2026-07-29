from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.quantum_security_report import QuantumSecurityReport


class SecurityRepository:
    """Repository managing persistence for QuantumSecurityReport entity."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, report: QuantumSecurityReport) -> QuantumSecurityReport:
        """Persists a new QuantumSecurityReport record.

        Args:
            report (QuantumSecurityReport): Model instance to persist.

        Returns:
            QuantumSecurityReport: Created instance with generated primary key.
        """
        self.db.add(report)
        await self.db.flush()
        await self.db.refresh(report)
        return report

    async def update(self, report: QuantumSecurityReport) -> QuantumSecurityReport:
        """Updates an existing QuantumSecurityReport record.

        Args:
            report (QuantumSecurityReport): Updated model instance.

        Returns:
            QuantumSecurityReport: Refreshed updated model instance.
        """
        await self.db.flush()
        await self.db.refresh(report)
        return report

    async def find_by_session(self, session_uuid: str) -> Optional[QuantumSecurityReport]:
        """Finds quantum security report record by session UUID.

        Args:
            session_uuid (str): Session UUID string.

        Returns:
            Optional[QuantumSecurityReport]: Model instance if found, else None.
        """
        stmt = select(QuantumSecurityReport).where(QuantumSecurityReport.session_uuid == session_uuid)
        result = await self.db.execute(stmt)
        return result.scalars().first()
