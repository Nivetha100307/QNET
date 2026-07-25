"""Unit tests for InMemoryQKDSessionRepository."""

from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4
import pytest

from app.domain.entities.qkd_session import QKDResult, SessionStatus
from app.infrastructure.persistence.in_memory_repository import (
    InMemoryQKDSessionRepository,
)


def test_save_and_get_session():
    repo = InMemoryQKDSessionRepository()
    sid = uuid4()
    session = QKDResult(
        session_id=sid,
        raw_key_length=128,
        sifted_key=[1] * 128,
        qber=0.01,
        chsh_value=2.82,
        status=SessionStatus.COMPLETED,
    )

    repo.save_session(session)

    retrieved = repo.get_session(sid)
    assert retrieved is not None
    assert retrieved.session_id == sid
    assert retrieved.raw_key_length == 128
    assert retrieved.chsh_value == 2.82


def test_missing_session_returns_none():
    repo = InMemoryQKDSessionRepository()
    non_existent = uuid4()

    assert repo.get_session(non_existent) is None
    assert repo.get_session(None) is None


def test_list_sessions_and_pagination():
    repo = InMemoryQKDSessionRepository()

    sessions = []
    for _ in range(10):
        s = QKDResult(session_id=uuid4(), raw_key_length=64, status=SessionStatus.COMPLETED)
        sessions.append(s)
        repo.save_session(s)

    assert repo.count() == 10

    # List all
    all_recs = repo.list_sessions(limit=100, offset=0)
    assert len(all_recs) == 10

    # Paginate
    page1 = repo.list_sessions(limit=5, offset=0)
    page2 = repo.list_sessions(limit=5, offset=5)

    assert len(page1) == 5
    assert len(page2) == 5
    assert page1 != page2


def test_delete_session():
    repo = InMemoryQKDSessionRepository()
    sid = uuid4()
    session = QKDResult(session_id=sid, raw_key_length=128, status=SessionStatus.COMPLETED)

    repo.save_session(session)
    assert repo.count() == 1

    deleted = repo.delete_session(sid)
    assert deleted is True
    assert repo.count() == 0
    assert repo.get_session(sid) is None

    # Delete again returns False
    assert repo.delete_session(sid) is False


def test_clear():
    repo = InMemoryQKDSessionRepository()
    for _ in range(5):
        repo.save_session(
            QKDResult(session_id=uuid4(), raw_key_length=128, status=SessionStatus.COMPLETED)
        )

    assert repo.count() == 5
    repo.clear()
    assert repo.count() == 0


def test_save_none_raises_type_error():
    repo = InMemoryQKDSessionRepository()
    with pytest.raises(TypeError, match="Cannot save None session"):
        repo.save_session(None)


def test_thread_safety_concurrent_writes():
    repo = InMemoryQKDSessionRepository()
    num_threads = 20
    items_per_thread = 50

    def worker(thread_idx: int):
        for i in range(items_per_thread):
            sid = uuid4()
            s = QKDResult(session_id=sid, raw_key_length=i + 1, status=SessionStatus.COMPLETED)
            repo.save_session(s)
            assert repo.get_session(sid) is not None

    with ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(worker, idx) for idx in range(num_threads)]
        for f in futures:
            f.result()

    assert repo.count() == num_threads * items_per_thread
