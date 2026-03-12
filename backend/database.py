from __future__ import annotations

import os
from pathlib import Path
from typing import AsyncGenerator
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from .crud import seed_database
from .models import Base

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "recruitment_dashboard.db"
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None
_current_url: str | None = None
DATABASE_URL_KEYS = ("DATABASE_URL", "POSTGRES_URL_NON_POOLING", "POSTGRES_URL")
ASYNC_PG_DROP_QUERY_KEYS = {
    "pgbouncer",
    "connection_limit",
    "options",
    "schema",
    "channel_binding",
}

REQUIRED_COLUMNS = {
    "outstanding_roles": {"job_id", "role_title", "team", "status", "active_inactive"},
    "filled_roles": {"job_id", "role_title", "team", "hired_name", "status"},
    "jobs": {"role_title", "department", "status"},
}


def _database_url() -> str:
    configured = ""
    for key in DATABASE_URL_KEYS:
        value = os.getenv(key, "").strip()
        if value:
            configured = value
            break
    if not configured:
        return f"sqlite+aiosqlite:///{DB_PATH.as_posix()}"
    if configured.startswith("postgres://"):
        configured = configured.replace("postgres://", "postgresql://", 1)
    if configured.startswith("postgresql+asyncpg://") or configured.startswith("sqlite+aiosqlite://"):
        return configured
    if configured.startswith("postgresql://"):
        parts = urlsplit(configured)
        query = dict(parse_qsl(parts.query, keep_blank_values=True))
        if "sslmode" in query and "ssl" not in query:
            query["ssl"] = query.pop("sslmode")
        if "connect_timeout" in query and "timeout" not in query:
            query["timeout"] = query.pop("connect_timeout")
        for key in ASYNC_PG_DROP_QUERY_KEYS:
            query.pop(key, None)
        return urlunsplit(("postgresql+asyncpg", parts.netloc, parts.path, urlencode(query), parts.fragment))
    if configured.startswith("sqlite:///"):
        return configured.replace("sqlite:///", "sqlite+aiosqlite:///", 1)
    return configured


def _is_sqlite(url: str) -> bool:
    return url.startswith("sqlite")


def get_engine() -> AsyncEngine:
    global _engine, _session_factory, _current_url
    url = _database_url()
    if _engine is None or _current_url != url:
        engine_kwargs = {"future": True, "pool_pre_ping": True}
        if not _is_sqlite(url):
            engine_kwargs["poolclass"] = NullPool
        _engine = create_async_engine(url, **engine_kwargs)
        _session_factory = async_sessionmaker(_engine, expire_on_commit=False, class_=AsyncSession)
        _current_url = url
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    get_engine()
    assert _session_factory is not None
    return _session_factory


def _schema_needs_reset(sync_connection) -> bool:
    inspector = inspect(sync_connection)
    existing_tables = set(inspector.get_table_names())
    for table_name, required in REQUIRED_COLUMNS.items():
        if table_name not in existing_tables:
            return True
        columns = {column["name"] for column in inspector.get_columns(table_name)}
        if not required.issubset(columns):
            return True
    return False


async def init_db() -> None:
    engine = get_engine()
    url = _database_url()
    async with engine.begin() as connection:
        needs_reset = _is_sqlite(url) and await connection.run_sync(_schema_needs_reset)
        if needs_reset:
            await connection.run_sync(Base.metadata.drop_all)
        await connection.run_sync(Base.metadata.create_all)
    async with get_session_factory()() as session:
        await seed_database(session)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with get_session_factory()() as session:
        yield session
