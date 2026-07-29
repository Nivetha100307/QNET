from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.quantum_key import QuantumKey


class KeyRepository:
    """Repository managing persistence for QuantumKey entity."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, key: QuantumKey) -> QuantumKey:
        """Persists a new QuantumKey record.

        Args:
            key (QuantumKey): Model instance to create.

        Returns:
            QuantumKey: Created instance.
        """
        self.db.add(key)
        await self.db.flush()
        await self.db.refresh(key)
        return key

    async def update(self, key: QuantumKey) -> QuantumKey:
        """Updates an existing QuantumKey record.

        Args:
            key (QuantumKey): Updated key model.

        Returns:
            QuantumKey: Refreshed updated instance.
        """
        await self.db.flush()
        await self.db.refresh(key)
        return key

    async def find_by_session(self, session_uuid: str) -> Optional[QuantumKey]:
        """Finds quantum key record by session UUID string.

        Args:
            session_uuid (str): Session UUID string.

        Returns:
            Optional[QuantumKey]: Model instance if found, else None.
        """
        stmt = select(QuantumKey).where(QuantumKey.session_uuid == session_uuid)
        result = await self.db.execute(stmt)
        return result.scalars().first()
