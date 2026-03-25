import { useQuery } from "@tanstack/react-query";
import { Activity, ClipboardList, Clock3, Percent, Target, UserCheck, UsersRound } from "lucide-react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

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

const PIE_COLORS = ["#0f6cbd", "#2d8cff", "#63a7ff", "#91beff", "#c5dcff"];

async function fetchStats() {
  const response = await client.get<ApiResponse<DashboardStats>>("/api/dashboard/stats");
  return response.data.data;
}

function formatMonthLabel(monthKey: string) {
  const parsed = new Date(`${monthKey}-01T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return monthKey;
  }
  return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
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

function GenderPieCard({ title, rows }: { title: string; rows: GenderBreakdownRow[] }) {
  const data = rows.map((row) => ({
    name: row.label,
    value: row.count,
    percentage: row.percentage,
  }));

  return (
    <div className="card-shell">
      <h3 className="text-lg font-semibold">{title}</h3>
      {data.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--text-secondary)]">No data yet.</p>
      ) : (
        <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_200px]">
          <div className="h-60">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={55}
                  nameKey="name"
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell fill={PIE_COLORS[index % PIE_COLORS.length]} key={entry.name} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, _name, entry) => [`${value} (${entry.payload.percentage})`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2" key={row.label}>
                <span className="inline-flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  {row.label}
                </span>
                <span className="text-sm font-semibold">
                  {row.count} ({row.percentage})
                </span>
              </div>
            ))}
          </div>
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
                  {formatMonthLabel(month)}
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
        <KPICard title="Total Positions" value={plutus_meta.total_unique_roles} subtitle="Open + filled positions" icon={<ClipboardList className="h-5 w-5" />} />
        <KPICard title="Overall Fill Rate" value={plutus_meta.overall_fill_rate} subtitle="Filled divided by (open + filled)" icon={<Percent className="h-5 w-5" />} tone="emerald" />
        <KPICard title="Attrition Fills" value={plutus_meta.attrition_fills} subtitle="Filled roles marked Attrition" icon={<UsersRound className="h-5 w-5" />} tone="amber" />
        <KPICard title="Dropout Events" value={plutus_meta.dropout_events} subtitle="Tracked candidate churn records" icon={<Target className="h-5 w-5" />} tone="red" />
        <KPICard title="Active Open" value={summary.active_open} subtitle="Outstanding open positions" icon={<Activity className="h-5 w-5" />} tone="amber" />
        <KPICard title="Filled" value={summary.filled} subtitle="Filled positions" icon={<UserCheck className="h-5 w-5" />} tone="emerald" />
        <KPICard title="Avg Time-to-Fill" value={summary.avg_time_to_fill} subtitle="Auto-calculated" icon={<Clock3 className="h-5 w-5" />} tone="red" />
        <KPICard title="Offer Acceptance Rate" value={summary.offer_acceptance_rate} subtitle="Auto-calculated" icon={<UsersRound className="h-5 w-5" />} tone="emerald" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <GenderPieCard rows={gender_overview.meta} title="Gender Meta Picture" />
        <GenderPieCard rows={gender_overview.results} title="Gender in Hiring Results" />
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
