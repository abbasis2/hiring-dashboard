from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud import dashboard_stats
from ..database import get_session
from ..dependencies import get_current_user
from ..schemas import DashboardPayload, Envelope, Meta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])


def envelope(data: Any) -> dict[str, Any]:
    return Envelope[Any](data=data, meta=Meta(total=1, page=1)).model_dump(mode="json")


@router.get("/stats")
async def read_stats(session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    stats = DashboardPayload.model_validate(await dashboard_stats(session))
    return envelope(stats.model_dump())
