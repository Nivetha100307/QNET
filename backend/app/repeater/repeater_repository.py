from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.repeater import RepeaterNode


class RepeaterRepository:
    """Repository managing persistence for RepeaterNode entity."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_all_nodes(self) -> List[RepeaterNode]:
        stmt = select(RepeaterNode)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
