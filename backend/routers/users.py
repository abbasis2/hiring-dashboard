from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud import delete_user, get_user_by_id, list_users, set_user_access
from ..database import get_session
from ..dependencies import get_current_user, require_super_admin
from ..models import User
from ..schemas import Envelope, Meta, UserAccessUpdate, UserRead

router = APIRouter(prefix="/api/users", tags=["users"])


def envelope(data: Any, total: int = 1, page: int = 1) -> dict[str, Any]:
    return Envelope[Any](data=data, meta=Meta(total=total, page=page)).model_dump(mode="json")


async def _active_super_admin_count(session: AsyncSession) -> int:
    count = await session.scalar(
        select(func.count()).select_from(User).where(User.role == "super_admin", User.is_active.is_(True))
    )
    return int(count or 0)


@router.get("")
async def read_users(
    _admin: User = Depends(require_super_admin),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    users = await list_users(session)
    payload = [UserRead.model_validate(user).model_dump(mode="json") for user in users]
    return envelope(payload, total=len(payload), page=1)


@router.patch("/{user_id}/access")
async def update_user_access(
    user_id: int,
    payload: UserAccessUpdate,
    current_admin: User = Depends(require_super_admin),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    user = await get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id and not payload.is_active:
        raise HTTPException(status_code=400, detail="You cannot revoke your own access")
    if user.role == "super_admin" and not payload.is_active and await _active_super_admin_count(session) <= 1:
        raise HTTPException(status_code=400, detail="At least one active super admin is required")

    updated = await set_user_access(session, user=user, is_active=payload.is_active)
    return envelope(UserRead.model_validate(updated).model_dump(mode="json"))


@router.delete("/{user_id}")
async def remove_user(
    user_id: int,
    current_admin: User = Depends(require_super_admin),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    user = await get_user_by_id(session, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    if user.role == "super_admin" and await _active_super_admin_count(session) <= 1:
        raise HTTPException(status_code=400, detail="At least one active super admin is required")

    await delete_user(session, user=user)
    return envelope({"deleted": True, "user_id": user_id})
