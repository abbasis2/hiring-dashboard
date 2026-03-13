from __future__ import annotations

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from .crud import get_user_by_id
from .database import get_session
from .models import User
from .security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authentication scheme")

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload.get("sub"))
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = await get_user_by_id(session, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid user session")
    return user


async def require_super_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user
