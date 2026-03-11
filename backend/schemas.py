from __future__ import annotations

from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class Meta(BaseModel):
    total: int
    page: int


class Envelope(BaseModel, Generic[T]):
    data: T
    meta: Meta


class OutstandingRoleBase(BaseModel):
    job_id: str = Field(min_length=1, max_length=32)
    role_title: str = Field(min_length=1, max_length=255)
    link_to_jd: str = Field(default="")
    team: str = Field(default="")
    location: str = Field(default="")
    backfill_reason: str = Field(default="")
    departure_type: str = Field(default="")
    start_date: str = Field(default="")
    status: str = Field(default="Sourcing")
    internal_shortlisted: int | None = None
    interviews_completed: int | None = None
    interviews_pending: int | None = None
    date_filled: str = Field(default="")
    active_inactive: str = Field(default="Active")


class OutstandingRoleCreate(OutstandingRoleBase):
    job_id: str = Field(default="", max_length=32)


class OutstandingRoleUpdate(BaseModel):
    role_title: str | None = None
    link_to_jd: str | None = None
    team: str | None = None
    location: str | None = None
    backfill_reason: str | None = None
    departure_type: str | None = None
    start_date: str | None = None
    status: str | None = None
    internal_shortlisted: int | None = None
    interviews_completed: int | None = None
    interviews_pending: int | None = None
    date_filled: str | None = None
    active_inactive: str | None = None


class OutstandingRoleRead(OutstandingRoleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class FilledRoleBase(BaseModel):
    job_id: str = Field(min_length=1, max_length=32)
    role_title: str = Field(min_length=1, max_length=255)
    team: str = Field(default="")
    location: str = Field(default="")
    backfill_reason: str = Field(default="")
    departure_type: str = Field(default="")
    hired_name: str = Field(default="")
    start_date: str = Field(default="")
    status: str = Field(default="")
    notes: str = Field(default="")


class FilledRoleCreate(FilledRoleBase):
    pass


class FilledRoleUpdate(BaseModel):
    role_title: str | None = None
    team: str | None = None
    location: str | None = None
    backfill_reason: str | None = None
    departure_type: str | None = None
    hired_name: str | None = None
    start_date: str | None = None
    status: str | None = None
    notes: str | None = None


class FilledRoleRead(FilledRoleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class JobBase(BaseModel):
    role_title: str = Field(min_length=1, max_length=255)
    department: str = Field(min_length=1, max_length=120)
    location: str = Field(default="", max_length=120)
    employment_type: str = Field(default="Full-time", max_length=64)
    status: str = Field(default="open", max_length=32)
    description: str = Field(default="", max_length=5000)
    requirements: str = Field(default="", max_length=5000)


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    role_title: str | None = Field(default=None, min_length=1, max_length=255)
    department: str | None = Field(default=None, min_length=1, max_length=120)
    location: str | None = Field(default=None, max_length=120)
    employment_type: str | None = Field(default=None, max_length=64)
    status: str | None = Field(default=None, max_length=32)
    description: str | None = Field(default=None, max_length=5000)
    requirements: str | None = Field(default=None, max_length=5000)


class JobRead(JobBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class DashboardSummary(BaseModel):
    total_roles: int
    active_open: int
    filled: int
    fill_rate: str
    avg_time_to_fill: str
    pipeline_conversion: str
    offer_acceptance_rate: str


class TeamBreakdown(BaseModel):
    team: str
    active_outstanding: int
    filled: int
    total: int
    fill_rate: str
    attrition_fills: int
    termination_fills: int
    other_fills: int


class BreakdownRow(BaseModel):
    label: str
    active_outstanding: int
    filled: int
    total: int
    fill_rate: str


class DashboardPayload(BaseModel):
    generated_on: str
    summary: DashboardSummary
    by_team: list[TeamBreakdown]
    departure_type_breakdown: list[BreakdownRow]
    location_breakdown: list[BreakdownRow]


class ApiError(BaseModel):
    error: str
    detail: str
    code: int


class ExcelUploadResult(BaseModel):
    imported_outstanding: int
    imported_filled: int
    skipped: int
    outstanding_roles: list[dict[str, Any]]
    filled_roles: list[dict[str, Any]]
