from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud import create_job, get_job, list_jobs, update_job
from ..database import get_session
from ..schemas import Envelope, JobCreate, JobRead, JobUpdate, Meta

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def envelope(data: Any, total: int, page: int) -> dict[str, Any]:
    return Envelope[Any](data=data, meta=Meta(total=total, page=page)).model_dump(mode="json")


@router.get("")
async def read_jobs(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    search: str | None = Query(default=None),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    items, total = await list_jobs(session, page=page, size=size, search=search)
    payload = [JobRead.model_validate(item).model_dump(mode="json") for item in items]
    return envelope(payload, total, page)


@router.post("", status_code=201)
async def add_job(payload: JobCreate, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    job = await create_job(session, payload)
    return envelope(JobRead.model_validate(job).model_dump(mode="json"), 1, 1)


@router.put("/{job_id}")
async def edit_job(job_id: int, payload: JobUpdate, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    job = await get_job(session, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    updated = await update_job(session, job, payload)
    return envelope(JobRead.model_validate(updated).model_dump(mode="json"), 1, 1)
