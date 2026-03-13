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
    link_to_jd: str = Field(default="", max_length=5000)
    team: str = Field(default="", max_length=255)
    location: str = Field(default="", max_length=255)
    backfill_reason: str = Field(default="", max_length=5000)
    departure_type: str = Field(default="", max_length=64)
    candidate_gender: str = Field(default="", max_length=32)
    start_date: str = Field(default="", max_length=64)
    status: str = Field(default="Sourcing", max_length=64)
    internal_shortlisted: int | None = Field(default=None, ge=0)
    interviews_completed: int | None = Field(default=None, ge=0)
    interviews_pending: int | None = Field(default=None, ge=0)
    date_filled: str = Field(default="", max_length=64)
    active_inactive: str = Field(default="Active", max_length=32)
    reason_why_next_steps: str = Field(default="", max_length=5000)


class OutstandingRoleCreate(OutstandingRoleBase):
    job_id: str = Field(default="", max_length=32)


class OutstandingRoleUpdate(BaseModel):
    role_title: str | None = Field(default=None, min_length=1, max_length=255)
    link_to_jd: str | None = Field(default=None, max_length=5000)
    team: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    backfill_reason: str | None = Field(default=None, max_length=5000)
    departure_type: str | None = Field(default=None, max_length=64)
    candidate_gender: str | None = Field(default=None, max_length=32)
    start_date: str | None = Field(default=None, max_length=64)
    status: str | None = Field(default=None, max_length=64)
    internal_shortlisted: int | None = Field(default=None, ge=0)
    interviews_completed: int | None = Field(default=None, ge=0)
    interviews_pending: int | None = Field(default=None, ge=0)
    date_filled: str | None = Field(default=None, max_length=64)
    active_inactive: str | None = Field(default=None, max_length=32)
    reason_why_next_steps: str | None = Field(default=None, max_length=5000)


class OutstandingRoleRead(OutstandingRoleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class FilledRoleBase(BaseModel):
    job_id: str = Field(min_length=1, max_length=32)
    role_title: str = Field(min_length=1, max_length=255)
    team: str = Field(default="", max_length=255)
    location: str = Field(default="", max_length=255)
    backfill_reason: str = Field(default="", max_length=5000)
    departure_type: str = Field(default="", max_length=64)
    hired_name: str = Field(default="", max_length=255)
    hired_gender: str = Field(default="", max_length=32)
    departure_event_date: str = Field(default="", max_length=64)
    start_date: str = Field(default="", max_length=64)
    status: str = Field(default="", max_length=64)
    notes: str = Field(default="", max_length=5000)
    reason_why_next_steps: str = Field(default="", max_length=5000)


class FilledRoleCreate(FilledRoleBase):
    pass


class FilledRoleUpdate(BaseModel):
    role_title: str | None = Field(default=None, min_length=1, max_length=255)
    team: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    backfill_reason: str | None = Field(default=None, max_length=5000)
    departure_type: str | None = Field(default=None, max_length=64)
    hired_name: str | None = Field(default=None, max_length=255)
    hired_gender: str | None = Field(default=None, max_length=32)
    departure_event_date: str | None = Field(default=None, max_length=64)
    start_date: str | None = Field(default=None, max_length=64)
    status: str | None = Field(default=None, max_length=64)
    notes: str | None = Field(default=None, max_length=5000)
    reason_why_next_steps: str | None = Field(default=None, max_length=5000)


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


class PlutusMetaPicture(BaseModel):
    total_unique_roles: int
    active_outstanding: int
    filled_roles: int
    attrition_fills: int
    termination_fills: int
    dropout_events: int
    overall_fill_rate: str


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


class GenderBreakdownRow(BaseModel):
    label: str
    count: int
    percentage: str


class GenderOverview(BaseModel):
    meta: list[GenderBreakdownRow]
    pipeline: list[GenderBreakdownRow]
    results: list[GenderBreakdownRow]


class HeatmapRow(BaseModel):
    label: str
    values: list[int]
    total: int


class HeatmapPayload(BaseModel):
    months: list[str]
    rows: list[HeatmapRow]


class DashboardPayload(BaseModel):
    generated_on: str
    summary: DashboardSummary
    plutus_meta: PlutusMetaPicture
    gender_overview: GenderOverview
    attrition_heatmap: HeatmapPayload
    dropout_heatmap: HeatmapPayload
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


class MasterOptionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    field_key: str
    value: str
    sort_order: int
    is_active: bool


class MasterOptionCreate(BaseModel):
    value: str = Field(min_length=1, max_length=255)


class RecruitingDropoutBase(BaseModel):
    job_id: str = Field(default="", max_length=32)
    role_title: str = Field(default="", max_length=255)
    team: str = Field(default="", max_length=255)
    location: str = Field(default="", max_length=255)
    stage: str = Field(default="", max_length=64)
    dropout_reason: str = Field(default="", max_length=5000)
    candidate_gender: str = Field(default="", max_length=32)
    dropout_date: str = Field(default="", max_length=64)
    reason_why_next_steps: str = Field(default="", max_length=5000)
    status: str = Field(default="Open", max_length=64)


class RecruitingDropoutCreate(RecruitingDropoutBase):
    pass


class RecruitingDropoutUpdate(BaseModel):
    job_id: str | None = Field(default=None, max_length=32)
    role_title: str | None = Field(default=None, max_length=255)
    team: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    stage: str | None = Field(default=None, max_length=64)
    dropout_reason: str | None = Field(default=None, max_length=5000)
    candidate_gender: str | None = Field(default=None, max_length=32)
    dropout_date: str | None = Field(default=None, max_length=64)
    reason_why_next_steps: str | None = Field(default=None, max_length=5000)
    status: str | None = Field(default=None, max_length=64)


class RecruitingDropoutRead(RecruitingDropoutBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    role: str
    email_verified: bool
    is_active: bool
    created_at: datetime
    last_login_at: datetime | None


class AuthSignupRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=256)
    confirm_email: str = Field(min_length=5, max_length=255)


class AuthSignupPayload(BaseModel):
    message: str
    email: str


class AuthLoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=256)


class AuthLoginPayload(BaseModel):
    access_token: str
    token_type: str
    user: UserRead


class UserAccessUpdate(BaseModel):
    is_active: bool
