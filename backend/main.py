from __future__ import annotations

import json
import os
import time
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .crud import replace_roles_from_workbook
from .database import get_session_factory, init_db
from .excel_parser import parse_excel_workbook
from .routers.dashboard import router as dashboard_router
from .routers.filled_roles import router as filled_roles_router
from .routers.jobs import router as jobs_router
from .routers.positions import router as positions_router

DEFAULT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]


def allowed_origins() -> list[str]:
    configured = os.getenv("ALLOWED_ORIGINS", "").strip()
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]
    frontend_url = os.getenv("FRONTEND_URL", "").strip()
    return [*DEFAULT_ORIGINS, *([frontend_url] if frontend_url else [])]


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Recruitment Dashboard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins(),
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


@app.get("/api/health")
async def health() -> dict[str, object]:
    return {"data": {"status": "ok"}, "meta": {"total": 1, "page": 1}}


@app.post("/api/upload-excel", status_code=201)
async def upload_excel(file: UploadFile = File(...)) -> dict[str, object]:
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
