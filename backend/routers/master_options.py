from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud import create_master_option, is_supported_master_field, list_master_options
from ..database import get_session
from ..dependencies import get_current_user
from ..schemas import Envelope, MasterOptionCreate, MasterOptionRead, Meta

router = APIRouter(prefix="/api/master-options", tags=["master-options"], dependencies=[Depends(get_current_user)])


def envelope(data: Any, total: int, page: int = 1) -> dict[str, Any]:
    return Envelope[Any](data=data, meta=Meta(total=total, page=page)).model_dump(mode="json")


@router.get("")
async def read_master_options(session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    grouped = await list_master_options(session)
    payload = {
        field_key: [MasterOptionRead.model_validate(item).model_dump(mode="json") for item in options]
        for field_key, options in grouped.items()
    }
    return envelope(payload, total=len(payload))


@router.get("/{field_key}")
async def read_master_options_by_field(field_key: str, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    if not is_supported_master_field(field_key):
        raise HTTPException(status_code=404, detail="Master field not found")
    grouped = await list_master_options(session, field_key=field_key)
    options = grouped.get(field_key, [])
    payload = [MasterOptionRead.model_validate(item).model_dump(mode="json") for item in options]
    return envelope(payload, total=len(payload))


@router.post("/{field_key}", status_code=201)
async def add_master_option(
    field_key: str,
    payload: MasterOptionCreate,
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    if not is_supported_master_field(field_key):
        raise HTTPException(status_code=404, detail="Master field not found")
    try:
        option = await create_master_option(session, field_key=field_key, value=payload.value)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return envelope(MasterOptionRead.model_validate(option).model_dump(mode="json"), total=1)
