from typing import List, Optional
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.session import QuantumSession
from app.core.state_machine import SessionStatusEnum

class SessionRepository:
    """Repository managing persistence for QuantumSession entity."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, session: QuantumSession) -> QuantumSession:
        """Persists a new QuantumSession record.

        Args:
            session (QuantumSession): Model instance to create.

        Returns:
            QuantumSession: Created instance with generated ID.
        """
        self.db.add(session)
        await self.db.flush()
        await self.db.refresh(session)
        return session

    async def update(self, session: QuantumSession) -> QuantumSession:
        """Updates an existing QuantumSession record.

        Args:
            session (QuantumSession): Updated session model.

        Returns:
            QuantumSession: Refreshed updated instance.
        """
        await self.db.flush()
        await self.db.refresh(session)
        return session

    async def delete(self, session: QuantumSession) -> None:
        """Deletes a QuantumSession record.

        Args:
            session (QuantumSession): Session instance to delete.
        """
        await self.db.delete(session)
        await self.db.flush()

    async def find_by_id(self, session_pk: int) -> Optional[QuantumSession]:
        """Finds session by integer primary key.

        Args:
            session_pk (int): Primary key ID.

        Returns:
            Optional[QuantumSession]: Model instance if found, else None.
        """
        stmt = select(QuantumSession).where(QuantumSession.id == session_pk)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def find_by_session_id(self, session_uuid: str) -> Optional[QuantumSession]:
        """Finds session by session_id UUID string.

        Args:
            session_uuid (str): Session UUID string.

        Returns:
            Optional[QuantumSession]: Model instance if found, else None.
        """
        stmt = select(QuantumSession).where(QuantumSession.session_id == session_uuid)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def find_all(self) -> List[QuantumSession]:
        """Retrieves all sessions ordered by creation date descending.

        Returns:
            List[QuantumSession]: List of session instances.
        """
        stmt = select(QuantumSession).order_by(QuantumSession.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def find_active_between_nodes(self, node_a: str, node_b: str) -> Optional[QuantumSession]:
        """Finds an existing non-terminated session between two nodes.

        Business Rule: Only one active session between same nodes.

        Args:
            node_a (str): Source or destination node.
            node_b (str): Destination or source node.

        Returns:
            Optional[QuantumSession]: Active session if exists, else None.
        """
        active_statuses = [
            SessionStatusEnum.INITIALIZING.value,
            SessionStatusEnum.READY.value,
            SessionStatusEnum.ACTIVE.value
        ]
        
        stmt = select(QuantumSession).where(
            and_(
                QuantumSession.status.in_(active_statuses),
                or_(
                    and_(QuantumSession.source_node == node_a, QuantumSession.destination_node == node_b),
                    and_(QuantumSession.source_node == node_b, QuantumSession.destination_node == node_a)
                )
            )
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()
