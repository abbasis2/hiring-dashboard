from __future__ import annotations

import io
import os
from pathlib import Path

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from openpyxl import Workbook

import backend.database as db_module
from backend.main import app


def _build_workbook_bytes() -> bytes:
    workbook = Workbook()
    outstanding = workbook.active
    outstanding.title = 'Outstanding Roles'
    outstanding.append([None, 'Outstanding Roles'])
    outstanding.append(['Job ID', 'Role Title', 'Link to JD', 'Team', 'Location', 'Backfill Reason', 'Departure Type', 'Start Date', 'Status', 'Internal Shortlisted', '3E interviews', 'Interviews Pending', 'Date filled', 'Active/Inactive'])
    outstanding.append(['JOB-100', 'Platform Engineer', 'https://example.com/jd', 'Core', 'Lahore', 'Backfill', 'Backfill', None, 'Sourcing', 2, 1, 1, None, 'Active'])
    filled = workbook.create_sheet('Filled Roles')
    filled.append([None, 'Filled Roles'])
    filled.append(['Job ID', 'Role Title', 'Team', 'Location', 'Backfill Reason', 'Departure Type', 'Hired Name', 'Start Date', 'Status', 'Notes'])
    buffer = io.BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()


@pytest_asyncio.fixture(autouse=True)
async def configure_test_db(tmp_path: Path):
    os.environ.pop("DATABASE_URL", None)
    db_module.DB_PATH = tmp_path / 'test.db'
    await db_module.init_db()
    yield


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as api_client:
        yield api_client


@pytest_asyncio.fixture
async def workbook_bytes():
    return _build_workbook_bytes()
