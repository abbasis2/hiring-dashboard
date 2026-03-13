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
    os.environ["SUPER_ADMIN_EMAIL"] = "admin@local.test"
    os.environ["SUPER_ADMIN_PASSWORD"] = "Admin@12345"
    os.environ["AUTH_RETURN_VERIFICATION_CODE"] = "true"
    db_module.DB_PATH = tmp_path / 'test.db'
    await db_module.init_db()
    yield


@pytest_asyncio.fixture
async def raw_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as api_client:
        yield api_client


@pytest_asyncio.fixture
async def client(raw_client: AsyncClient):
    login_response = await raw_client.post(
        "/api/auth/login",
        json={"email": "admin@local.test", "password": "Admin@12345"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["data"]["access_token"]
    raw_client.headers.update({"Authorization": f"Bearer {token}"})
    return raw_client


@pytest_asyncio.fixture
async def workbook_bytes():
    return _build_workbook_bytes()
