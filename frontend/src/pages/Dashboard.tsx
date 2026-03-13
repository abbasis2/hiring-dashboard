import { useQuery } from "@tanstack/react-query";
import { Activity, ClipboardList, Clock3, Percent, Target, UserCheck, UsersRound } from "lucide-react";

import client from "../api/client";
import KPICard from "../components/KPICard";
import type {
  ApiResponse,
  BreakdownRow,
  DashboardStats,
  GenderBreakdownRow,
  HeatmapPayload,
  TeamBreakdown,
} from "../types";

async function fetchStats() {
  const response = await client.get<ApiResponse<DashboardStats>>("/api/dashboard/stats");
  return response.data.data;
}

function BreakdownTable({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  return (
    <div className="card-shell overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Active Outstanding</th>
              <th className="px-4 py-3">Filled</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fill Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((row) => (
              <tr key={row.label} className="hover:bg-[var(--bg-elevated)]">
                <td className="px-4 py-3 font-medium">{row.label}</td>
                <td className="px-4 py-3">{row.active_outstanding}</td>
                <td className="px-4 py-3">{row.filled}</td>
                <td className="px-4 py-3">{row.total}</td>
                <td className="px-4 py-3">{row.fill_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamTable({ rows }: { rows: TeamBreakdown[] }) {
  return (
    <div className="card-shell overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h2 className="text-xl font-semibold">Outstanding Roles by Team</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">Active Outstanding</th>
              <th className="px-4 py-3">Filled</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Fill Rate</th>
              <th className="px-4 py-3">Attrition Fills</th>
              <th className="px-4 py-3">Termination Fills</th>
              <th className="px-4 py-3">Other Fills</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.map((row) => (
              <tr key={row.team} className="hover:bg-[var(--bg-elevated)]">
                <td className="px-4 py-3 font-medium">{row.team}</td>
                <td className="px-4 py-3">{row.active_outstanding}</td>
                <td className="px-4 py-3">{row.filled}</td>
                <td className="px-4 py-3">{row.total}</td>
                <td className="px-4 py-3">{row.fill_rate}</td>
                <td className="px-4 py-3">{row.attrition_fills}</td>
                <td className="px-4 py-3">{row.termination_fills}</td>
                <td className="px-4 py-3">{row.other_fills}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GenderBlock({ title, rows }: { title: string; rows: GenderBreakdownRow[] }) {
  return (
    <div className="card-shell space-y-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No data yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
              <span className="text-sm">{row.label}</span>
              <span className="text-sm font-semibold">
                {row.count} ({row.percentage})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HeatmapTable({ title, payload }: { title: string; payload: HeatmapPayload }) {
  if (!payload.months.length || !payload.rows.length) {
    return (
      <div className="card-shell">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">No data available yet.</p>
      </div>
    );
  }

  return (
    <div className="card-shell overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            <tr>
              <th className="px-4 py-3">Bucket</th>
              {payload.months.map((month) => (
                <th key={month} className="px-4 py-3">
                  {month}
                </th>
              ))}
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {payload.rows.map((row) => (
              <tr key={row.label} className="hover:bg-[var(--bg-elevated)]">
                <td className="px-4 py-3 font-medium">{row.label}</td>
                {row.values.map((value, index) => (
                  <td key={`${row.label}-${payload.months[index]}`} className="px-4 py-3">
                    <span className={`inline-flex min-w-9 justify-center rounded-md px-2 py-1 ${value > 0 ? "bg-[var(--accent-primary-soft)] text-[var(--accent-primary-strong)]" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"}`}>
                      {value}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-3 font-semibold">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const query = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchStats,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  if (query.isLoading || !query.data) {
    return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="card-shell h-40 animate-pulse bg-[var(--bg-surface)]" />)}</div>;
  }

  const {
    summary,
    plutus_meta,
    gender_overview,
    attrition_heatmap,
    dropout_heatmap,
    by_team,
    departure_type_breakdown,
    location_breakdown,
    generated_on,
  } = query.data;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--accent-primary)]">KPI Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold">Plutus21 Hiring Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Generated from the outstanding roles and filled roles workbook structure. As of {generated_on}.</p>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Plutus Unique Roles" value={plutus_meta.total_unique_roles} subtitle="Unique job IDs across datasets" icon={<ClipboardList className="h-5 w-5" />} />
        <KPICard title="Overall Fill Rate" value={plutus_meta.overall_fill_rate} subtitle="Filled roles vs unique roles" icon={<Percent className="h-5 w-5" />} tone="emerald" />
        <KPICard title="Attrition Fills" value={plutus_meta.attrition_fills} subtitle="Filled roles marked Attrition" icon={<UsersRound className="h-5 w-5" />} tone="amber" />
        <KPICard title="Dropout Events" value={plutus_meta.dropout_events} subtitle="Tracked candidate churn records" icon={<Target className="h-5 w-5" />} tone="red" />
        <KPICard title="Total Roles" value={summary.total_roles} subtitle="Workbook total roles" icon={<ClipboardList className="h-5 w-5" />} />
        <KPICard title="Active Open" value={summary.active_open} subtitle="Active outstanding roles" icon={<Activity className="h-5 w-5" />} tone="amber" />
        <KPICard title="Filled" value={summary.filled} subtitle="Filled roles sheet" icon={<UserCheck className="h-5 w-5" />} tone="emerald" />
        <KPICard title="Fill Rate" value={summary.fill_rate} subtitle="Filled divided by total roles" icon={<Percent className="h-5 w-5" />} />
        <KPICard title="Avg Time-to-Fill" value={summary.avg_time_to_fill} subtitle="SLA: 30 std / 45 sr" icon={<Clock3 className="h-5 w-5" />} tone="red" />
        <KPICard title="Pipeline Conversion" value={summary.pipeline_conversion} subtitle="Target >25%" icon={<Target className="h-5 w-5" />} />
        <KPICard title="Offer Acceptance Rate" value={summary.offer_acceptance_rate} subtitle="Target >85%" icon={<UsersRound className="h-5 w-5" />} tone="emerald" />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GenderBlock rows={gender_overview.meta} title="Gender Meta Picture" />
        <GenderBlock rows={gender_overview.pipeline} title="Gender in Hiring Pipeline" />
        <GenderBlock rows={gender_overview.results} title="Gender in Hiring Results" />
      </section>

      <TeamTable rows={by_team} />
      <div className="grid gap-6 xl:grid-cols-2">
        <BreakdownTable title="Departure Type Breakdown" rows={departure_type_breakdown} />
        <BreakdownTable title="Location Breakdown" rows={location_breakdown} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <HeatmapTable payload={attrition_heatmap} title="Attrition Heatmap (Team x Month)" />
        <HeatmapTable payload={dropout_heatmap} title="Recruiting Drop-out Heatmap (Stage x Month)" />
      </div>
    </div>
  );
}
