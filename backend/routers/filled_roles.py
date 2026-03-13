from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud import delete_filled_role, get_filled_role, list_filled_roles, update_filled_role
from ..database import get_session
from ..dependencies import get_current_user, require_super_admin
from ..models import User
from ..schemas import Envelope, FilledRoleRead, FilledRoleUpdate, Meta

router = APIRouter(prefix="/api/filled-roles", tags=["filled-roles"], dependencies=[Depends(get_current_user)])


def envelope(data: Any, total: int, page: int) -> dict[str, Any]:
    return Envelope[Any](data=data, meta=Meta(total=total, page=page)).model_dump(mode="json")


@router.get("")
async def read_filled_roles(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=50, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    items, total = await list_filled_roles(session, page=page, size=size)
    payload = [FilledRoleRead.model_validate(item).model_dump(mode="json") for item in items]
    return envelope(payload, total, page)


@router.put("/{role_id}")
async def edit_filled_role(role_id: int, payload: FilledRoleUpdate, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    role = await get_filled_role(session, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Filled role not found")
    updated = await update_filled_role(session, role, payload)
    return envelope(FilledRoleRead.model_validate(updated).model_dump(mode="json"), 1, 1)


@router.delete("/{role_id}")
async def remove_filled_role(
    role_id: int,
    _admin: User = Depends(require_super_admin),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    role = await get_filled_role(session, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Filled role not found")
    await delete_filled_role(session, role)
    return envelope({"deleted": True, "role_id": role_id}, 1, 1)
