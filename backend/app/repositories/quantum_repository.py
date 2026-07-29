from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.quantum_measurement import QuantumMeasurement


class QuantumMeasurementRepository:
    """Repository managing persistence for QuantumMeasurement entity."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, measurement: QuantumMeasurement) -> QuantumMeasurement:
        """Persists a new QuantumMeasurement record.

        Args:
            measurement (QuantumMeasurement): Model instance to create.

        Returns:
            QuantumMeasurement: Created instance.
        """
        self.db.add(measurement)
        await self.db.flush()
        await self.db.refresh(measurement)
        return measurement

    async def find_by_session_id(self, session_uuid: str) -> Optional[QuantumMeasurement]:
        """Finds quantum measurement record by session UUID string.

        Args:
            session_uuid (str): Session UUID string.

        Returns:
            Optional[QuantumMeasurement]: Model instance if found, else None.
        """
        stmt = select(QuantumMeasurement).where(QuantumMeasurement.session_uuid == session_uuid)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def update(self, measurement: QuantumMeasurement) -> QuantumMeasurement:
        """Updates an existing QuantumMeasurement record.

        Args:
            measurement (QuantumMeasurement): Updated measurement model.

        Returns:
            QuantumMeasurement: Refreshed updated instance.
        """
        await self.db.flush()
        await self.db.refresh(measurement)
        return measurement

    async def delete_by_session_id(self, session_uuid: str) -> None:
        """Deletes a QuantumMeasurement record by session UUID.

        Args:
            session_uuid (str): Session UUID string.
        """
        measurement = await self.find_by_session_id(session_uuid)
        if measurement:
            await self.db.delete(measurement)
            await self.db.flush()
