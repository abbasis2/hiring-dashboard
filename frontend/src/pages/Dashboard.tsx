import { useQuery } from "@tanstack/react-query";
import { Activity, ClipboardList, Clock3, Percent, Target, UserCheck, UsersRound } from "lucide-react";

import client from "../api/client";
import KPICard from "../components/KPICard";
import type { ApiResponse, BreakdownRow, DashboardStats, TeamBreakdown } from "../types";

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

export default function Dashboard() {
  const query = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchStats });

  if (query.isLoading || !query.data) {
    return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="card-shell h-40 animate-pulse bg-[var(--bg-surface)]" />)}</div>;
  }

  const { summary, by_team, departure_type_breakdown, location_breakdown, generated_on } = query.data;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">KPI Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold">Plutus21 Hiring Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Generated from the outstanding roles and filled roles workbook structure. As of {generated_on}.</p>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title="Total Roles" value={summary.total_roles} subtitle="Workbook total roles" icon={<ClipboardList className="h-5 w-5" />} />
        <KPICard title="Active Open" value={summary.active_open} subtitle="Active outstanding roles" icon={<Activity className="h-5 w-5" />} tone="amber" />
        <KPICard title="Filled" value={summary.filled} subtitle="Filled roles sheet" icon={<UserCheck className="h-5 w-5" />} tone="emerald" />
        <KPICard title="Fill Rate" value={summary.fill_rate} subtitle="Filled divided by total roles" icon={<Percent className="h-5 w-5" />} />
        <KPICard title="Avg Time-to-Fill" value={summary.avg_time_to_fill} subtitle="SLA: 30 std / 45 sr" icon={<Clock3 className="h-5 w-5" />} tone="red" />
        <KPICard title="Pipeline Conversion" value={summary.pipeline_conversion} subtitle="Target >25%" icon={<Target className="h-5 w-5" />} />
        <KPICard title="Offer Acceptance Rate" value={summary.offer_acceptance_rate} subtitle="Target >85%" icon={<UsersRound className="h-5 w-5" />} tone="emerald" />
      </section>
      <TeamTable rows={by_team} />
      <div className="grid gap-6 xl:grid-cols-2">
        <BreakdownTable title="Departure Type Breakdown" rows={departure_type_breakdown} />
        <BreakdownTable title="Location Breakdown" rows={location_breakdown} />
      </div>
    </div>
  );
}
