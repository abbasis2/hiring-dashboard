from __future__ import annotations

import json
import os
import time
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import Depends, FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .crud import replace_roles_from_workbook
from .database import get_session_factory, init_db
from .dependencies import require_super_admin
from .excel_parser import parse_excel_workbook
from .models import User
from .routers.auth import router as auth_router
from .routers.dashboard import router as dashboard_router
from .routers.filled_roles import router as filled_roles_router
from .routers.jobs import router as jobs_router
from .routers.master_options import router as master_options_router
from .routers.positions import router as positions_router
from .routers.recruiting_dropouts import router as recruiting_dropouts_router
from .routers.users import router as users_router
from .security import validate_security_config

DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
DEFAULT_ALLOWED_ORIGIN_REGEX = r"https://.*\.vercel\.app"


def allowed_origins() -> list[str]:
    configured = os.getenv("ALLOWED_ORIGINS", "").strip()
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    frontend_url = os.getenv("FRONTEND_URL", "").strip()
    return [*DEFAULT_ORIGINS, *([frontend_url] if frontend_url else [])]


def allowed_origin_regex() -> str | None:
    configured = os.getenv("ALLOWED_ORIGIN_REGEX", "").strip()
    if configured:
        return configured
    allow_vercel_preview = os.getenv("ALLOW_VERCEL_PREVIEW_ORIGINS", "true").strip().lower()
    if allow_vercel_preview in {"0", "false", "no"}:
        return None
    return DEFAULT_ALLOWED_ORIGIN_REGEX


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_security_config()
    await init_db()
    yield


app = FastAPI(title="Recruitment Dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
    allow_origin_regex=allowed_origin_regex(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_context(request: Request, call_next):
    started_at = time.perf_counter()
    request.state.request_id = str(uuid4())
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
    print(json.dumps({"method": request.method, "path": request.url.path, "status": response.status_code, "ms": duration_ms, "rid": request.state.request_id}))
    response.headers["X-Request-ID"] = request.state.request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": exc.__class__.__name__, "detail": str(exc.detail), "code": exc.status_code})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"error": "ValidationError", "detail": str(exc), "code": 422})


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=404, content={"error": "NotFound", "detail": "Resource not found", "code": 404})


app.include_router(positions_router)
app.include_router(filled_roles_router)
app.include_router(jobs_router)
app.include_router(dashboard_router)
app.include_router(master_options_router)
app.include_router(recruiting_dropouts_router)
app.include_router(auth_router)
app.include_router(users_router)


@app.get("/api/health")
async def health() -> dict[str, object]:
    return {"data": {"status": "ok"}, "meta": {"total": 1, "page": 1}}


@app.post("/api/upload-excel", status_code=201)
async def upload_excel(file: UploadFile = File(...), _: User = Depends(require_super_admin)) -> dict[str, object]:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing file name")
    try:
        content = await file.read()
        workbook_payload = parse_excel_workbook(content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    async with get_session_factory()() as session:
        imported_outstanding, imported_filled = await replace_roles_from_workbook(
            session,
            workbook_payload["outstanding_roles"],
            workbook_payload["filled_roles"],
        )
    return {
        "data": {
            "imported_outstanding": imported_outstanding,
            "imported_filled": imported_filled,
            "skipped": 0,
            "outstanding_roles": workbook_payload["outstanding_roles"],
            "filled_roles": workbook_payload["filled_roles"],
        },
        "meta": {"total": imported_outstanding + imported_filled, "page": 1},
    }
