import { AxiosError } from "axios";
import { Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { DropdownOptions, FilledRole } from "../types";

type Props = {
  roles: FilledRole[];
  options: DropdownOptions;
  canDelete?: boolean;
  onDelete?: (roleId: number) => Promise<void>;
  onSave: (roleId: number, values: Partial<FilledRole>) => Promise<void>;
};

const AUTOSAVE_DELAY_MS = 900;

export default function FilledRolesTable({ roles, options, canDelete = false, onDelete, onSave }: Props) {
  const [drafts, setDrafts] = useState<Record<number, FilledRole>>({});
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const draftsRef = useRef<Record<number, FilledRole>>({});
  const autoSaveTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const rows = useMemo(() => roles.map((role) => drafts[role.id] ?? role), [drafts, roles]);
  const visibleIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => Boolean(selectedRows[id]));

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  useEffect(
    () => () => {
      for (const timer of Object.values(autoSaveTimersRef.current)) {
        clearTimeout(timer);
      }
    },
    []
  );

  const persistDraft = async (roleId: number) => {
    const draft = draftsRef.current[roleId];
    if (!draft) {
      return;
    }
    if (autoSaveTimersRef.current[roleId]) {
      clearTimeout(autoSaveTimersRef.current[roleId]);
      delete autoSaveTimersRef.current[roleId];
    }

    setError("");
    setSavingId(roleId);
    try {
      await onSave(roleId, draft);
      setDrafts((current) => {
        const next = { ...current };
        delete next[roleId];
        return next;
      });
    } catch (err) {
      const detail = err instanceof AxiosError ? err.response?.data?.detail ?? err.message : "Save failed";
      setError(detail);
    } finally {
      setSavingId((current) => (current === roleId ? null : current));
    }
  };

  const queueAutoSave = (roleId: number) => {
    if (autoSaveTimersRef.current[roleId]) {
      clearTimeout(autoSaveTimersRef.current[roleId]);
    }
    autoSaveTimersRef.current[roleId] = setTimeout(() => {
      void persistDraft(roleId);
    }, AUTOSAVE_DELAY_MS);
  };

  const updateDraft = (role: FilledRole, values: Partial<FilledRole>) => {
    setDrafts((current) => ({
      ...current,
      [role.id]: {
        ...(current[role.id] ?? role),
        ...values,
      },
    }));
    queueAutoSave(role.id);
  };

  if (!roles.length) {
    return <div className="card-shell flex min-h-52 items-center justify-center text-sm text-[var(--text-secondary)]">No filled roles found.</div>;
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
          {error}
        </div>
      ) : null}
      <div className="card-shell overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1700px] divide-y divide-[var(--border)] text-sm">
            <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              <tr>
                <th className="px-3 py-3">
                  <input
                    aria-label="Select all filled rows"
                    checked={allVisibleSelected}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setSelectedRows((current) => {
                        const next = { ...current };
                        for (const id of visibleIds) {
                          next[id] = checked;
                        }
                        return next;
                      });
                    }}
                    type="checkbox"
                  />
                </th>
                <th className="px-3 py-3">Job ID</th>
                <th className="px-3 py-3">Role Title</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">Backfill Reason</th>
                <th className="px-3 py-3">Departure Type</th>
                <th className="px-3 py-3">Hired Name</th>
                <th className="px-3 py-3">Hired Gender</th>
                <th className="px-3 py-3">Departure Event Date</th>
                <th className="px-3 py-3">Start Date</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Notes</th>
                <th className="px-3 py-3">Reason/Why/Next Steps</th>
                <th className="px-3 py-3">Save</th>
                {canDelete ? <th className="px-3 py-3">Delete</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((role) => (
                <tr key={role.id} className="align-top transition-all duration-200 hover:bg-[var(--bg-elevated)]">
                  <td className="px-3 py-3">
                    <input
                      aria-label={`Select filled row ${role.job_id}`}
                      checked={Boolean(selectedRows[role.id])}
                      onChange={(event) =>
                        setSelectedRows((current) => ({
                          ...current,
                          [role.id]: event.target.checked,
                        }))
                      }
                      type="checkbox"
                    />
                  </td>
                  <td className="px-3 py-3 font-medium">{role.job_id}</td>
                  <td className="px-3 py-3">
                    <input
                      className="w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { role_title: event.target.value })}
                      value={role.role_title}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="w-40 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { team: event.target.value })}
                      value={role.team}
                    >
                      {options.team.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { location: event.target.value })}
                      value={role.location}
                    >
                      {options.location.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <textarea
                      className="min-h-20 w-64 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { backfill_reason: event.target.value })}
                      value={role.backfill_reason}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="w-32 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { departure_type: event.target.value })}
                      value={role.departure_type}
                    >
                      {options.departure_type.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="w-40 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { hired_name: event.target.value })}
                      value={role.hired_name}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { hired_gender: event.target.value })}
                      value={role.hired_gender}
                    >
                      <option value="">Not specified</option>
                      {options.gender.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { departure_event_date: event.target.value })}
                      type="date"
                      value={role.departure_event_date ?? ""}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="w-32 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { start_date: event.target.value })}
                      type="date"
                      value={role.start_date ?? ""}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { status: event.target.value })}
                      value={role.status ?? ""}
                    >
                      <option value="">Blank</option>
                      {options.filled_status.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <textarea
                      className="min-h-20 w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { notes: event.target.value })}
                      value={role.notes ?? ""}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <textarea
                      className="min-h-20 w-64 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-2"
                      onChange={(event) => updateDraft(role, { reason_why_next_steps: event.target.value })}
                      value={role.reason_why_next_steps ?? ""}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-primary)] px-3 py-2 font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--accent-primary-strong)] disabled:opacity-70"
                      disabled={savingId === role.id}
                      onClick={async () => {
                        await persistDraft(role.id);
                      }}
                      type="button"
                    >
                      <Save className="h-4 w-4" />
                      {savingId === role.id ? "Saving" : "Save"}
                    </button>
                  </td>
                  {canDelete ? (
                    <td className="px-3 py-3">
                      <button
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3 py-2 font-semibold text-[var(--danger-text)] transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                        disabled={!onDelete || deletingId === role.id}
                        onClick={async () => {
                          if (!onDelete) {
                            return;
                          }
                          if (!window.confirm(`Delete record ${role.job_id}? This action cannot be undone.`)) {
                            return;
                          }
                          setError("");
                          setDeletingId(role.id);
                          try {
                            await onDelete(role.id);
                          } catch (err) {
                            const detail = err instanceof AxiosError ? err.response?.data?.detail ?? err.message : "Delete failed";
                            setError(detail);
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === role.id ? "Deleting" : "Delete"}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
