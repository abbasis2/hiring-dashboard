from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class OutstandingRole(Base, TimestampMixin):
    __tablename__ = "outstanding_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    link_to_jd: Mapped[str] = mapped_column(Text, default="", nullable=False)
    team: Mapped[str] = mapped_column(String(255), default="", nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    backfill_reason: Mapped[str] = mapped_column(Text, default="", nullable=False)
    departure_type: Mapped[str] = mapped_column(String(64), default="", nullable=False, index=True)
    start_date: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    status: Mapped[str] = mapped_column(String(64), default="Sourcing", nullable=False, index=True)
    internal_shortlisted: Mapped[int | None] = mapped_column(Integer, nullable=True)
    interviews_completed: Mapped[int | None] = mapped_column(Integer, nullable=True)
    interviews_pending: Mapped[int | None] = mapped_column(Integer, nullable=True)
    date_filled: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    active_inactive: Mapped[str] = mapped_column(String(32), default="Active", nullable=False, index=True)


class FilledRole(Base, TimestampMixin):
    __tablename__ = "filled_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    team: Mapped[str] = mapped_column(String(255), default="", nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    backfill_reason: Mapped[str] = mapped_column(Text, default="", nullable=False)
    departure_type: Mapped[str] = mapped_column(String(64), default="", nullable=False, index=True)
    hired_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    start_date: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    status: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    employment_type: Mapped[str] = mapped_column(String(64), default="Full-time", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="open", nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    requirements: Mapped[str] = mapped_column(Text, default="", nullable=False)
