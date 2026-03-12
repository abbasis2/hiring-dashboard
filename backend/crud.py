from __future__ import annotations

from collections import defaultdict
from datetime import date
import re
from typing import Any, Iterable

from sqlalchemy import delete, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .models import FilledRole, Job, OutstandingRole
from .schemas import (
    FilledRoleCreate,
    FilledRoleUpdate,
    JobCreate,
    JobUpdate,
    OutstandingRoleCreate,
    OutstandingRoleUpdate,
)
from .seed_data import FILLED_ROLES, OUTSTANDING_ROLES

JOB_SEED = [
    {"role_title": "Associate AI Engineer", "department": "Team 27", "location": "Lahore", "employment_type": "Full-time", "status": "open", "description": "Drive applied AI delivery across hiring workflows.", "requirements": "Python, FastAPI, SQL, cloud fundamentals."},
    {"role_title": "Recruitment Operations Analyst", "department": "Talent", "location": "Islamabad", "employment_type": "Full-time", "status": "draft", "description": "Own hiring reporting and stakeholder coordination.", "requirements": "Excel, analytics, communication."},
]

JOB_ID_PATTERN = re.compile(r"^JOB-(\d+)$", re.IGNORECASE)


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()


def clean_int(value: Any) -> int | None:
    if value in (None, ""):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def as_percent(numerator: int, denominator: int) -> str:
    if denominator <= 0:
        return "-"
    return f"{round((numerator / denominator) * 100):.0f}%"


def normalize_outstanding_seed(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "job_id": clean_text(record.get("Job ID")),
        "role_title": clean_text(record.get("Role Title")),
        "link_to_jd": clean_text(record.get("Link to JD")),
        "team": clean_text(record.get("Team")),
        "location": clean_text(record.get("Location")),
        "backfill_reason": clean_text(record.get("Backfill Reason")),
        "departure_type": clean_text(record.get("Departure Type")),
        "start_date": clean_text(record.get("Start Date")),
        "status": clean_text(record.get("Status")) or "Sourcing",
        "internal_shortlisted": clean_int(record.get("Internal Shortlisted")),
        "interviews_completed": clean_int(record.get("3E interviews")),
        "interviews_pending": clean_int(record.get("Interviews Pending")),
        "date_filled": clean_text(record.get("Date filled")),
        "active_inactive": clean_text(record.get("Active/Inactive")) or "Active",
    }


def normalize_filled_seed(record: dict[str, Any]) -> dict[str, Any]:
    return {
        "job_id": clean_text(record.get("Job ID")),
        "role_title": clean_text(record.get("Role Title")),
        "team": clean_text(record.get("Team")),
        "location": clean_text(record.get("Location")),
        "backfill_reason": clean_text(record.get("Backfill Reason")),
        "departure_type": clean_text(record.get("Departure Type")),
        "hired_name": clean_text(record.get("Hired Name")),
        "start_date": clean_text(record.get("Start Date")),
        "status": clean_text(record.get("Status")),
        "notes": clean_text(record.get("Notes")),
    }


def _job_id_state(values: Iterable[str]) -> tuple[int, int]:
    max_suffix = 0
    width = 3
    for value in values:
        match = JOB_ID_PATTERN.match(clean_text(value))
        if match:
            suffix_digits = match.group(1)
            max_suffix = max(max_suffix, int(suffix_digits))
            width = max(width, len(suffix_digits))
    return max_suffix, width


def _format_job_id(suffix: int, width: int) -> str:
    return f"JOB-{suffix:0{width}d}"


async def _ensure_outstanding_job_ids(session: AsyncSession) -> int:
    missing_ids = list(
        await session.scalars(
            select(OutstandingRole).where(
                or_(
                    OutstandingRole.job_id == "",
                    func.trim(OutstandingRole.job_id) == "",
                )
            )
        )
    )
    if not missing_ids:
        return 0

    existing_job_ids = list(await session.scalars(select(OutstandingRole.job_id)))
    max_suffix, width = _job_id_state(existing_job_ids)
    next_suffix = max_suffix + 1
    for role in missing_ids:
        role.job_id = _format_job_id(next_suffix, width)
        next_suffix += 1
    await session.commit()
    return len(missing_ids)


async def _next_outstanding_job_id(session: AsyncSession) -> str:
    existing_job_ids = list(await session.scalars(select(OutstandingRole.job_id)))
    max_suffix, width = _job_id_state(existing_job_ids)
    return _format_job_id(max_suffix + 1, width)


async def seed_database(session: AsyncSession) -> None:
    outstanding_count = await session.scalar(select(func.count()).select_from(OutstandingRole))
    filled_count = await session.scalar(select(func.count()).select_from(FilledRole))
    job_count = await session.scalar(select(func.count()).select_from(Job))

    if not outstanding_count:
        session.add_all([OutstandingRole(**normalize_outstanding_seed(record)) for record in OUTSTANDING_ROLES])
    if not filled_count:
        session.add_all([FilledRole(**normalize_filled_seed(record)) for record in FILLED_ROLES])
    if not job_count:
        session.add_all([Job(**payload) for payload in JOB_SEED])
    await session.commit()


async def list_outstanding_roles(
    session: AsyncSession,
    *,
    dept: str | None = None,
    active_only: bool = False,
    page: int = 1,
    size: int = 50,
) -> tuple[list[OutstandingRole], int]:
    await _ensure_outstanding_job_ids(session)
    query = select(OutstandingRole).order_by(OutstandingRole.job_id)
    total_query = select(func.count()).select_from(OutstandingRole)
    filters: list[Any] = []
    if dept:
        filters.append(OutstandingRole.team == dept)
    if active_only:
        filters.append(OutstandingRole.active_inactive == "Active")
    if filters:
        query = query.where(*filters)
        total_query = total_query.where(*filters)
    total = int(await session.scalar(total_query) or 0)
    items = await session.scalars(query.offset((page - 1) * size).limit(size))
    return list(items), total


async def get_outstanding_role(session: AsyncSession, role_id: int) -> OutstandingRole | None:
    return await session.get(OutstandingRole, role_id)


async def update_outstanding_role(session: AsyncSession, role: OutstandingRole, payload: OutstandingRoleUpdate) -> OutstandingRole:
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(role, field, value)
    await session.commit()
    await session.refresh(role)
    return role


async def create_outstanding_role(session: AsyncSession, payload: OutstandingRoleCreate) -> OutstandingRole:
    payload_data = payload.model_dump()
    requested_job_id = clean_text(payload_data.get("job_id"))

    if not requested_job_id:
        await _ensure_outstanding_job_ids(session)
        for _ in range(5):
            payload_data["job_id"] = await _next_outstanding_job_id(session)
            role = OutstandingRole(**payload_data)
            session.add(role)
            try:
                await session.commit()
                await session.refresh(role)
                return role
            except IntegrityError:
                await session.rollback()
        raise RuntimeError("Unable to generate a unique job ID")

    payload_data["job_id"] = requested_job_id
    role = OutstandingRole(**payload_data)
    session.add(role)
    await session.commit()
    await session.refresh(role)
    return role


async def list_filled_roles(session: AsyncSession, page: int = 1, size: int = 50) -> tuple[list[FilledRole], int]:
    query = select(FilledRole).order_by(FilledRole.job_id)
    total = int(await session.scalar(select(func.count()).select_from(FilledRole)) or 0)
    items = await session.scalars(query.offset((page - 1) * size).limit(size))
    return list(items), total


async def get_filled_role(session: AsyncSession, role_id: int) -> FilledRole | None:
    return await session.get(FilledRole, role_id)


async def update_filled_role(session: AsyncSession, role: FilledRole, payload: FilledRoleUpdate) -> FilledRole:
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(role, field, value)
    await session.commit()
    await session.refresh(role)
    return role


async def replace_roles_from_workbook(
    session: AsyncSession,
    outstanding_rows: Iterable[dict[str, Any]],
    filled_rows: Iterable[dict[str, Any]],
) -> tuple[int, int]:
    await session.execute(delete(OutstandingRole))
    await session.execute(delete(FilledRole))
    await session.commit()

    outstanding_models = [OutstandingRole(**normalize_outstanding_seed(record)) for record in outstanding_rows]
    filled_models = [FilledRole(**normalize_filled_seed(record)) for record in filled_rows]
    session.add_all(outstanding_models)
    session.add_all(filled_models)
    await session.commit()
    return len(outstanding_models), len(filled_models)


async def list_jobs(
    session: AsyncSession,
    *,
    page: int = 1,
    size: int = 20,
    search: str | None = None,
) -> tuple[list[Job], int]:
    query = select(Job).order_by(Job.created_at.desc())
    total_query = select(func.count()).select_from(Job)
    if search:
        pattern = f"%{search}%"
        search_filter = (Job.role_title.ilike(pattern)) | (Job.department.ilike(pattern))
        query = query.where(search_filter)
        total_query = total_query.where(search_filter)
    total = int(await session.scalar(total_query) or 0)
    result = await session.scalars(query.offset((page - 1) * size).limit(size))
    return list(result), total


async def create_job(session: AsyncSession, payload: JobCreate) -> Job:
    job = Job(**payload.model_dump())
    session.add(job)
    await session.commit()
    await session.refresh(job)
    return job


async def get_job(session: AsyncSession, job_id: int) -> Job | None:
    return await session.get(Job, job_id)


async def update_job(session: AsyncSession, job: Job, payload: JobUpdate) -> Job:
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(job, field, value)
    await session.commit()
    await session.refresh(job)
    return job


async def dashboard_stats(session: AsyncSession) -> dict[str, Any]:
    outstanding_roles = list(await session.scalars(select(OutstandingRole).order_by(OutstandingRole.job_id)))
    filled_roles = list(await session.scalars(select(FilledRole).order_by(FilledRole.job_id)))

    active_roles = [role for role in outstanding_roles if role.active_inactive == "Active"]
    summary = {
        "total_roles": len(outstanding_roles),
        "active_open": len(active_roles),
        "filled": len(filled_roles),
        "fill_rate": as_percent(len(filled_roles), len(outstanding_roles)),
        "avg_time_to_fill": "—",
        "pipeline_conversion": "—",
        "offer_acceptance_rate": "—",
    }

    team_names = sorted({role.team for role in outstanding_roles if role.team} | {role.team for role in filled_roles if role.team})
    by_team = []
    for team in team_names:
        team_active = [role for role in active_roles if role.team == team]
        team_filled = [role for role in filled_roles if role.team == team]
        attrition = sum(1 for role in team_filled if role.departure_type == "Attrition")
        termination = sum(1 for role in team_filled if role.departure_type == "Termination")
        other = len(team_filled) - attrition - termination
        total = len(team_active) + len(team_filled)
        by_team.append(
            {
                "team": team,
                "active_outstanding": len(team_active),
                "filled": len(team_filled),
                "total": total,
                "fill_rate": as_percent(len(team_filled), total),
                "attrition_fills": attrition,
                "termination_fills": termination,
                "other_fills": other,
            }
        )

    departure_labels = ["Attrition", "Termination", "Backfill", "New / Reallocation"]
    departure_breakdown = []
    for label in departure_labels:
        active_count = sum(1 for role in active_roles if role.departure_type == label)
        filled_count = sum(1 for role in filled_roles if role.departure_type == label)
        total = active_count + filled_count
        departure_breakdown.append(
            {
                "label": label,
                "active_outstanding": active_count,
                "filled": filled_count,
                "total": total,
                "fill_rate": as_percent(filled_count, total),
            }
        )

    location_groups: dict[str, dict[str, int]] = defaultdict(lambda: {"active": 0, "filled": 0})
    for role in active_roles:
        if role.location:
            location_groups[role.location]["active"] += 1
    for role in filled_roles:
        if role.location:
            location_groups[role.location]["filled"] += 1
    location_breakdown = []
    for label in sorted(location_groups):
        active_count = location_groups[label]["active"]
        filled_count = location_groups[label]["filled"]
        total = active_count + filled_count
        location_breakdown.append(
            {
                "label": label,
                "active_outstanding": active_count,
                "filled": filled_count,
                "total": total,
                "fill_rate": as_percent(filled_count, total),
            }
        )

    return {
        "generated_on": date.today().isoformat(),
        "summary": summary,
        "by_team": by_team,
        "departure_type_breakdown": departure_breakdown,
        "location_breakdown": location_breakdown,
    }
