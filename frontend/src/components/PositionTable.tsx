import { AxiosError } from "axios";
import { Save } from "lucide-react";
import { useMemo, useState } from "react";

import type { DropdownOptions, OutstandingRole } from "../types";

type Props = {
  roles: OutstandingRole[];
  options: DropdownOptions;
  onSave: (roleId: number, values: Partial<OutstandingRole>) => Promise<void>;
};

export default function PositionTable({ roles, options, onSave }: Props) {
  const [drafts, setDrafts] = useState<Record<number, OutstandingRole>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const rows = useMemo(() => roles.map((role) => drafts[role.id] ?? role), [drafts, roles]);

  const updateDraft = (role: OutstandingRole, field: keyof OutstandingRole, value: string) => {
    setDrafts((current) => ({
      ...current,
      [role.id]: {
        ...(current[role.id] ?? role),
        [field]: ["internal_shortlisted", "interviews_completed", "interviews_pending"].includes(field)
          ? (value === "" ? null : Number(value))
          : value,
      },
    }));
  };

  if (!roles.length) {
    return <div className="card-shell flex min-h-52 items-center justify-center text-sm text-[var(--text-secondary)]">No outstanding roles found.</div>;
  }

  const textInput = (role: OutstandingRole, field: keyof OutstandingRole, width: string) => (
    <input
      className={`${width} rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2`}
      onChange={(event) => updateDraft(role, field, event.target.value)}
      value={(role[field] as string) ?? ""}
    />
  );

  const selectInput = (role: OutstandingRole, field: keyof OutstandingRole, options: readonly string[], width: string) => (
    <select
      className={`${width} rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2`}
      onChange={(event) => updateDraft(role, field, event.target.value)}
      value={(role[field] as string) ?? ""}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-3">
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      <div className="card-shell overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1600px] divide-y divide-[var(--border)] text-sm">
            <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              <tr>
                <th className="px-3 py-3">Job ID</th>
                <th className="px-3 py-3">Role Title</th>
                <th className="px-3 py-3">JD Link</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Backfill Reason</th>
                <th className="px-3 py-3">Departure Type</th>
                <th className="px-3 py-3">Start Date</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Internal Shortlisted</th>
                <th className="px-3 py-3">3E Interviews</th>
                <th className="px-3 py-3">Pending</th>
                <th className="px-3 py-3">Date Filled</th>
                <th className="px-3 py-3">Active/Inactive</th>
                <th className="px-3 py-3">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((role) => (
                <tr key={role.id} className="align-top transition-all duration-200 hover:bg-[var(--bg-elevated)]">
                  <td className="px-3 py-3 font-medium">{role.job_id}</td>
                  <td className="px-3 py-3">{textInput(role, "role_title", "w-56")}</td>
                  <td className="px-3 py-3">{textInput(role, "link_to_jd", "w-64")}</td>
                  <td className="px-3 py-3">{selectInput(role, "team", options.team, "w-48")}</td>
                  <td className="px-3 py-3">{selectInput(role, "location", options.location, "w-44")}</td>
                  <td className="px-3 py-3"><textarea className="min-h-20 w-72 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, "backfill_reason", event.target.value)} value={role.backfill_reason} /></td>
                  <td className="px-3 py-3">{selectInput(role, "departure_type", options.departure_type, "w-36")}</td>
                  <td className="px-3 py-3"><input className="w-32 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, "start_date", event.target.value)} type="date" value={role.start_date ?? ""} /></td>
                  <td className="px-3 py-3">{selectInput(role, "status", options.outstanding_status, "w-32")}</td>
                  <td className="px-3 py-3"><input className="w-20 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, "internal_shortlisted", event.target.value)} type="number" value={role.internal_shortlisted ?? ""} /></td>
                  <td className="px-3 py-3"><input className="w-20 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, "interviews_completed", event.target.value)} type="number" value={role.interviews_completed ?? ""} /></td>
                  <td className="px-3 py-3"><input className="w-20 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, "interviews_pending", event.target.value)} type="number" value={role.interviews_pending ?? ""} /></td>
                  <td className="px-3 py-3"><input className="w-32 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, "date_filled", event.target.value)} type="date" value={/^\d{4}-\d{2}-\d{2}$/.test(role.date_filled ?? "") ? role.date_filled : ""} /></td>
                  <td className="px-3 py-3">{selectInput(role, "active_inactive", options.active_inactive, "w-28")}</td>
                  <td className="px-3 py-3">
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-400 disabled:opacity-70"
                      disabled={savingId === role.id}
                      onClick={async () => {
                        setError("");
                        setSavingId(role.id);
                        try {
                          await onSave(role.id, drafts[role.id] ?? role);
                          setDrafts((current) => {
                            const next = { ...current };
                            delete next[role.id];
                            return next;
                          });
                        } catch (err) {
                          const detail = err instanceof AxiosError ? err.response?.data?.detail ?? err.message : "Save failed";
                          setError(detail);
                        } finally {
                          setSavingId(null);
                        }
                      }}
                      type="button"
                    >
                      <Save className="h-4 w-4" />
                      {savingId === role.id ? "Saving" : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
