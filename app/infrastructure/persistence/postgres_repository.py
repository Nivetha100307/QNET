"""PostgreSQL / Supabase implementation of IQKDSessionRepository using SQLAlchemy ORM.

This repository persists QKD session records into PostgreSQL / Supabase, fulfilling the domain port.
"""

from datetime import datetime, timezone
import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select

from app.domain.entities.qkd_session import QKDResult, SessionStatus
from app.domain.interfaces.qkd_repository import IQKDSessionRepository
from app.infrastructure.persistence.database.database import SyncSessionLocal
from app.infrastructure.persistence.database.models import SessionModel

logger = logging.getLogger(__name__)


class PostgresQKDSessionRepository(IQKDSessionRepository):
    """PostgreSQL / Supabase repository implementing IQKDSessionRepository."""

    def __init__(self) -> None:
        """Initialize PostgresQKDSessionRepository."""
        pass

    def save_session(self, session: QKDResult) -> None:
        """Persist a QKD session domain entity to PostgreSQL.

        Args:
            session: QKDResult domain entity.

        Raises:
            TypeError: If session is None.
        """
        if session is None:
            raise TypeError("Cannot save None session.")

        status_val = (
            session.status.value
            if hasattr(session.status, "value")
            else str(session.status)
        )

        sid_str = str(session.session_id)

        with SyncSessionLocal() as db_session:
            try:
                stmt = select(SessionModel).where(SessionModel.session_id == sid_str)
                existing = db_session.execute(stmt).scalar_one_or_none()

                if existing:
                    existing.status = status_val
                    existing.raw_key_length = session.raw_key_length
                    existing.bell_score = session.chsh_value
                    existing.qber = session.qber
                    existing.eavesdropping_detected = session.eavesdropping_detected
                    if session.sifted_key:
                        existing.shared_key = "".join(map(str, session.sifted_key))
                else:
                    model = SessionModel(
                        session_id=sid_str,
                        backend="AerSimulator",
                        status=status_val,
                        bell_score=session.chsh_value,
                        qber=session.qber,
                        execution_time=0.142,
                        key_length=session.raw_key_length,
                        shared_key="".join(map(str, session.sifted_key)) if session.sifted_key else None,
                        eavesdropping_detected=session.eavesdropping_detected,
                        created_at=session.created_at,
                    )
                    db_session.add(model)

                db_session.commit()
                logger.info(f"Persisted session {sid_str} to PostgreSQL database.")
            except Exception as exc:
                db_session.rollback()
                logger.error(f"Failed to persist session {sid_str} to database: {exc}")
                raise

    def get_session(self, session_id: UUID | str) -> Optional[QKDResult]:
        """Fetch a stored QKD session result by ID.

        Args:
            session_id: Session identifier (UUID or str).

        Returns:
            Optional[QKDResult]: Domain entity or None if not found.
        """
        if session_id is None:
            return None

        sid_str = str(session_id)

        with SyncSessionLocal() as db_session:
            stmt = select(SessionModel).where(SessionModel.session_id == sid_str)
            model = db_session.execute(stmt).scalar_one_or_none()
            if not model:
                return None
            return self._map_model_to_entity(model)

    def list_sessions(self, limit: int = 100, offset: int = 0) -> List[QKDResult]:
        """List stored QKD sessions with pagination.

        Args:
            limit: Pagination limit.
            offset: Pagination offset.

        Returns:
            List[QKDResult]: List of domain entities.
        """
        with SyncSessionLocal() as db_session:
            stmt = (
                select(SessionModel)
                .order_by(SessionModel.created_at.desc())
                .limit(limit)
                .offset(offset)
            )
            models = db_session.execute(stmt).scalars().all()
            return [self._map_model_to_entity(m) for m in models]

    def _map_model_to_entity(self, model: SessionModel) -> QKDResult:
        status_enum = SessionStatus.COMPLETED
        try:
            status_enum = SessionStatus(model.status)
        except Exception:
            pass

        try:
            sid_val = UUID(model.session_id)
        except Exception:
            sid_val = model.session_id

        sifted_bits = []
        if model.shared_key:
            try:
                sifted_bits = [int(char) for char in model.shared_key if char in "01"]
            except Exception:
                pass

        return QKDResult(
            session_id=sid_val,  # type: ignore
            raw_key_length=model.key_length,
            sifted_key=sifted_bits,
            status=status_enum,
            chsh_value=model.bell_score,
            qber=model.qber,
            eavesdropping_detected=model.eavesdropping_detected,
            created_at=model.created_at,
        )
