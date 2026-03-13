from __future__ import annotations

import os
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..crud import authenticate_user, issue_access_token_for_user, signup_user, verify_user_email
from ..database import get_session
from ..dependencies import get_current_user
from ..models import User
from ..schemas import (
    AuthLoginPayload,
    AuthLoginRequest,
    AuthSignupPayload,
    AuthSignupRequest,
    AuthVerifyEmailRequest,
    Envelope,
    Meta,
    UserRead,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def envelope(data: Any, total: int = 1, page: int = 1) -> dict[str, Any]:
    return Envelope[Any](data=data, meta=Meta(total=total, page=page)).model_dump(mode="json")


def should_return_verification_code() -> bool:
    raw = os.getenv("AUTH_RETURN_VERIFICATION_CODE", "true").strip().lower()
    return raw not in {"0", "false", "no"}


@router.post("/signup", status_code=201)
async def signup(payload: AuthSignupRequest, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    if payload.email.strip().lower() != payload.confirm_email.strip().lower():
        raise HTTPException(status_code=422, detail="Email and confirmation email must match")
    try:
        user, code = await signup_user(session, email=payload.email, password=payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    response = AuthSignupPayload(
        message="Signup successful. Verify your email to continue.",
        email=user.email,
        verification_code=code if should_return_verification_code() else None,
    )
    return envelope(response.model_dump(mode="json"))


@router.post("/verify-email")
async def verify_email(payload: AuthVerifyEmailRequest, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    try:
        user = await verify_user_email(session, email=payload.email, code=payload.code)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return envelope(UserRead.model_validate(user).model_dump(mode="json"))


@router.post("/login")
async def login(payload: AuthLoginRequest, session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
    try:
        user = await authenticate_user(session, email=payload.email, password=payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))
    except PermissionError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

    token = issue_access_token_for_user(user)
    response = AuthLoginPayload(
        access_token=token,
        token_type="bearer",
        user=UserRead.model_validate(user),
    )
    return envelope(response.model_dump(mode="json"))


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    return envelope(UserRead.model_validate(current_user).model_dump(mode="json"))
