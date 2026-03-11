import { AxiosError } from "axios";
import { Save } from "lucide-react";
import { useMemo, useState } from "react";

import { DEPARTURE_TYPE_OPTIONS, FILLED_STATUS_OPTIONS, LOCATION_OPTIONS, TEAM_OPTIONS } from "../constants";
import type { FilledRole } from "../types";

type Props = {
  roles: FilledRole[];
  onSave: (roleId: number, values: Partial<FilledRole>) => Promise<void>;
};

export default function FilledRolesTable({ roles, onSave }: Props) {
  const [drafts, setDrafts] = useState<Record<number, FilledRole>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const rows = useMemo(() => roles.map((role) => drafts[role.id] ?? role), [drafts, roles]);

  const updateDraft = (role: FilledRole, values: Partial<FilledRole>) => {
    setDrafts((current) => ({
      ...current,
      [role.id]: {
        ...(current[role.id] ?? role),
        ...values,
      },
    }));
  };

  if (!roles.length) {
    return <div className="card-shell flex min-h-52 items-center justify-center text-sm text-[var(--text-secondary)]">No filled roles found.</div>;
  }

  return (
    <div className="space-y-3">
      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}
      <div className="card-shell overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] divide-y divide-[var(--border)] text-sm">
            <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              <tr>
                <th className="px-3 py-3">Job ID</th>
                <th className="px-3 py-3">Role Title</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Backfill Reason</th>
                <th className="px-3 py-3">Departure Type</th>
                <th className="px-3 py-3">Hired Name</th>
                <th className="px-3 py-3">Start Date</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Notes</th>
                <th className="px-3 py-3">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((role) => (
                <tr key={role.id} className="align-top transition-all duration-200 hover:bg-[var(--bg-elevated)]">
                  <td className="px-3 py-3 font-medium">{role.job_id}</td>
                  <td className="px-3 py-3"><input className="w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, { role_title: event.target.value })} value={role.role_title} /></td>
                  <td className="px-3 py-3"><select className="w-40 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, { team: event.target.value })} value={role.team}>{TEAM_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td>
                  <td className="px-3 py-3"><select className="w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, { location: event.target.value })} value={role.location}>{LOCATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td>
                  <td className="px-3 py-3"><textarea className="min-h-20 w-64 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, { backfill_reason: event.target.value })} value={role.backfill_reason} /></td>
                  <td className="px-3 py-3"><select className="w-32 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, { departure_type: event.target.value })} value={role.departure_type}>{DEPARTURE_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></td>
                  <td className="px-3 py-3"><input className="w-40 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, { hired_name: event.target.value })} value={role.hired_name} /></td>
                  <td className="px-3 py-3"><input className="w-32 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, { start_date: event.target.value })} type="date" value={role.start_date ?? ""} /></td>
                  <td className="px-3 py-3"><select className="w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, { status: event.target.value })} value={role.status ?? ""}>{FILLED_STATUS_OPTIONS.map((option) => <option key={option || "blank"} value={option}>{option || "Blank"}</option>)}</select></td>
                  <td className="px-3 py-3"><textarea className="min-h-20 w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2" onChange={(event) => updateDraft(role, { notes: event.target.value })} value={role.notes ?? ""} /></td>
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
