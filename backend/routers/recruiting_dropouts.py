from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud import (
    create_recruiting_dropout,
    delete_recruiting_dropout,
    get_recruiting_dropout,
    list_recruiting_dropouts,
    update_recruiting_dropout,
)
from ..database import get_session
from ..dependencies import get_current_user, require_super_admin
from ..models import User
from ..schemas import (
    Envelope,
    Meta,
    RecruitingDropoutCreate,
    RecruitingDropoutRead,
    RecruitingDropoutUpdate,
)

router = APIRouter(prefix="/api/recruiting-dropouts", tags=["recruiting-dropouts"], dependencies=[Depends(get_current_user)])


def envelope(data: Any, total: int, page: int) -> dict[str, Any]:
    return Envelope[Any](data=data, meta=Meta(total=total, page=page)).model_dump(mode="json")


@router.get("")
async def read_recruiting_dropouts(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=50, ge=1, le=200),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    items, total = await list_recruiting_dropouts(session, page=page, size=size)
    payload = [RecruitingDropoutRead.model_validate(item).model_dump(mode="json") for item in items]
    return envelope(payload, total, page)


@router.post("", status_code=201)
async def add_recruiting_dropout(
    payload: RecruitingDropoutCreate,
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    created = await create_recruiting_dropout(session, payload)
    return envelope(RecruitingDropoutRead.model_validate(created).model_dump(mode="json"), 1, 1)


@router.put("/{dropout_id}")
async def edit_recruiting_dropout(
    dropout_id: int,
    payload: RecruitingDropoutUpdate,
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    row = await get_recruiting_dropout(session, dropout_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Recruiting dropout record not found")
    updated = await update_recruiting_dropout(session, row, payload)
    return envelope(RecruitingDropoutRead.model_validate(updated).model_dump(mode="json"), 1, 1)


@router.delete("/{dropout_id}")
async def remove_recruiting_dropout(
    dropout_id: int,
    _admin: User = Depends(require_super_admin),
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    row = await get_recruiting_dropout(session, dropout_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Recruiting dropout record not found")
    await delete_recruiting_dropout(session, row)
    return envelope({"deleted": True, "dropout_id": dropout_id}, 1, 1)
