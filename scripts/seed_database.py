"""Database seed script for populating historical QKD sessions and metrics."""

import asyncio
from datetime import datetime, timezone
import os
import random
import sys

sys.path.insert(0, os.path.abspath("."))

from sqlalchemy import select
from app.infrastructure.persistence.database.database import AsyncSessionLocal, init_db
from app.infrastructure.persistence.database.models import EventModel, MetricModel, SessionModel


async def seed_database() -> None:
    """Populate database with sample historical QKD sessions."""
    init_db()

    async with AsyncSessionLocal() as session:
        # Check if already seeded
        res = await session.execute(select(SessionModel))
        existing = res.scalars().all()
        if len(existing) >= 3:
            print("Database already contains historical sessions. Skipping seed.")
            return

        print("Seeding database with sample historical QKD sessions...")

        sample_sessions = [
            {
                "session_id": "qkd-db-001-seed",
                "backend": "AerSimulator",
                "status": "COMPLETED",
                "bell_score": 2.828,
                "qber": 0.012,
                "execution_time": 0.142,
                "key_length": 128,
                "shared_key": "A4F89E217C3D05B9E812F4C701A9D3E2F5B8C1A4F902D5E812C4A7F0E3B9D1A5",
                "eavesdropping_detected": False,
            },
            {
                "session_id": "qkd-db-002-seed",
                "backend": "AerSimulator",
                "status": "ABORTED_EAVESDROPPING",
                "bell_score": 1.414,
                "qber": 0.250,
                "execution_time": 0.188,
                "key_length": 128,
                "shared_key": None,
                "eavesdropping_detected": True,
            },
            {
                "session_id": "qkd-db-003-seed",
                "backend": "ibm_brisbane",
                "status": "COMPLETED",
                "bell_score": 2.812,
                "qber": 0.018,
                "execution_time": 1.420,
                "key_length": 256,
                "shared_key": "9B2F5C8A1D4E7F0A3B6C9D2E5F8A1B4C7D0E3F6A9B2C5D8E1F4A7B0C3D6E9F2",
                "eavesdropping_detected": False,
            },
        ]

        for s_data in sample_sessions:
            sess_model = SessionModel(
                session_id=s_data["session_id"],
                backend=s_data["backend"],
                status=s_data["status"],
                bell_score=s_data["bell_score"],
                qber=s_data["qber"],
                execution_time=s_data["execution_time"],
                key_length=s_data["key_length"],
                shared_key=s_data["shared_key"],
                eavesdropping_detected=s_data["eavesdropping_detected"],
                created_at=datetime.now(timezone.utc),
            )
            session.add(sess_model)

            # Add metric
            metric_model = MetricModel(
                session_id=s_data["session_id"],
                bell_parameter=s_data["bell_score"],
                qber=s_data["qber"],
                execution_time=s_data["execution_time"],
                key_length=s_data["key_length"],
                success_rate=1.0 if s_data["status"] == "COMPLETED" else 0.0,
            )
            session.add(metric_model)

            # Add sample events
            evt = EventModel(
                session_id=s_data["session_id"],
                event_type="SESSION_COMPLETED",
                payload={"status": s_data["status"], "bell_score": s_data["bell_score"]},
            )
            session.add(evt)

        await session.commit()
        print("Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())
