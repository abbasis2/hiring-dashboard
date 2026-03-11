from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud import create_outstanding_role, get_outstanding_role, list_outstanding_roles, update_outstanding_role
from ..database import get_session
from ..schemas import Envelope, Meta, OutstandingRoleCreate, OutstandingRoleRead, OutstandingRoleUpdate

router = APIRouter(prefix="/api/positions", tags=["outstanding-roles"])


def envelope(data: Any, total: int, page: int) -> dict[str, Any]:
    return Envelope[Any](data=data, meta=Meta(total=total, page=page)).model_dump(mode="json")


@router.get("")
async def read_positions(
    dept: str | None = Query(default=None),
    active_only: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=50, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    items, total = await list_outstanding_roles(session, dept=dept, active_only=active_only, page=page, size=size)
    payload = [OutstandingRoleRead.model_validate(item).model_dump(mode="json") for item in items]
    return envelope(payload, total, page)


@router.post("", status_code=201)
async def add_position(payload: OutstandingRoleCreate, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    role = await create_outstanding_role(session, payload)
    return envelope(OutstandingRoleRead.model_validate(role).model_dump(mode="json"), 1, 1)


@router.put("/{role_id}")
async def edit_position(
    role_id: int,
    payload: OutstandingRoleUpdate,
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    role = await get_outstanding_role(session, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Outstanding role not found")
    updated = await update_outstanding_role(session, role, payload)
    return envelope(OutstandingRoleRead.model_validate(updated).model_dump(mode="json"), 1, 1)
