import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusCircle, Save, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import client from "../api/client";
import { useMasterOptions } from "../api/masterOptions";
import { useAuth } from "../auth/useAuth";
import { DEFAULT_DROPDOWN_OPTIONS } from "../constants";
import type { ApiResponse, RecruitingDropout } from "../types";

type FormValues = {
  job_id: string;
  role_title: string;
  team: string;
  location: string;
  stage: string;
  dropout_reason: string;
  candidate_gender: string;
  dropout_date: string;
  reason_why_next_steps: string;
  status: string;
};

const INITIAL_FORM: FormValues = {
  job_id: "",
  role_title: "",
  team: "",
  location: "",
  stage: "",
  dropout_reason: "",
  candidate_gender: "",
  dropout_date: "",
  reason_why_next_steps: "",
  status: "Open",
};

async function fetchDropouts() {
  const response = await client.get<ApiResponse<RecruitingDropout[]>>("/api/recruiting-dropouts?size=200");
  return response.data.data;
}

export default function RecruitingDropouts() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const optionsQuery = useMasterOptions();
  const options = optionsQuery.data ?? DEFAULT_DROPDOWN_OPTIONS;
  const [search, setSearch] = useState("");
  const [formValues, setFormValues] = useState<FormValues>(INITIAL_FORM);
  const [drafts, setDrafts] = useState<Record<number, RecruitingDropout>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string>("");

  const query = useQuery({
    queryKey: ["recruiting-dropouts"],
    queryFn: fetchDropouts,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: FormValues) => {
      await client.post("/api/recruiting-dropouts", payload);
    },
    onSuccess: async () => {
      setNotice("Dropout event saved.");
      setFormValues(INITIAL_FORM);
      await queryClient.invalidateQueries({ queryKey: ["recruiting-dropouts"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["master-options"] });
    },
    onError: (error) => {
      const detail =
        error instanceof AxiosError
          ? (error.response?.data?.detail as string | undefined) ?? "Unable to save dropout event."
          : "Unable to save dropout event.";
      setNotice(detail);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: number; values: Partial<RecruitingDropout> }) => {
      await client.put(`/api/recruiting-dropouts/${id}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["recruiting-dropouts"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["master-options"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/api/recruiting-dropouts/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["recruiting-dropouts"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      await queryClient.invalidateQueries({ queryKey: ["master-options"] });
    },
  });

  const rows = useMemo(() => {
    const values = (query.data ?? []).filter((row) =>
      `${row.job_id} ${row.role_title} ${row.team} ${row.stage} ${row.dropout_reason}`.toLowerCase().includes(search.toLowerCase())
    );
    return values.map((row) => drafts[row.id] ?? row);
  }, [query.data, drafts, search]);

  const setDraftValue = (row: RecruitingDropout, values: Partial<RecruitingDropout>) => {
    setDrafts((current) => ({
      ...current,
      [row.id]: {
        ...(current[row.id] ?? row),
        ...values,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold">Recruiting Dropouts</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Track candidate churn by stage, reason, gender, and follow-up actions. Dashboard heatmaps update from this data.
        </p>
      </section>

      <section className="card-shell space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Add Dropout Event</h2>
          <label className="flex min-w-72 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2">
            <Search className="h-4 w-4 text-[var(--text-secondary)]" />
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search existing events"
              value={search}
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFormValues((current) => ({ ...current, job_id: event.target.value }))}
            placeholder="Job ID"
            value={formValues.job_id}
          />
          <input
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFormValues((current) => ({ ...current, role_title: event.target.value }))}
            placeholder="Role Title"
            value={formValues.role_title}
          />
          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFormValues((current) => ({ ...current, team: event.target.value }))}
            value={formValues.team}
          >
            <option value="">Team</option>
            {options.team.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFormValues((current) => ({ ...current, location: event.target.value }))}
            value={formValues.location}
          >
            <option value="">Location</option>
            {options.location.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFormValues((current) => ({ ...current, stage: event.target.value }))}
            value={formValues.stage}
          >
            <option value="">Dropout Stage</option>
            {options.dropout_stage.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFormValues((current) => ({ ...current, dropout_reason: event.target.value }))}
            value={formValues.dropout_reason}
          >
            <option value="">Dropout Reason</option>
            {options.dropout_reason.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFormValues((current) => ({ ...current, candidate_gender: event.target.value }))}
            value={formValues.candidate_gender}
          >
            <option value="">Gender</option>
            {options.gender.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFormValues((current) => ({ ...current, dropout_date: event.target.value }))}
            type="date"
            value={formValues.dropout_date}
          />
          <select
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFormValues((current) => ({ ...current, status: event.target.value }))}
            value={formValues.status}
          >
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
          <textarea
            className="min-h-24 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 md:col-span-2 xl:col-span-3"
            onChange={(event) => setFormValues((current) => ({ ...current, reason_why_next_steps: event.target.value }))}
            placeholder="Reason / Why / Next Steps"
            value={formValues.reason_why_next_steps}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--accent-primary-strong)] disabled:opacity-60"
            disabled={createMutation.isPending}
            onClick={() => {
              setNotice("");
              createMutation.mutate(formValues);
            }}
            type="button"
          >
            <PlusCircle className="h-4 w-4" />
            {createMutation.isPending ? "Saving..." : "Add Dropout Event"}
          </button>
          {notice ? <span className="text-sm text-[var(--text-secondary)]">{notice}</span> : null}
        </div>
      </section>

      <section className="card-shell overflow-hidden p-0">
        {query.isLoading ? (
          <div className="h-48 animate-pulse bg-[var(--bg-elevated)]" />
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-[var(--text-secondary)]">No dropout events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1700px] divide-y divide-[var(--border)] text-sm">
              <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-3 py-3">Job ID</th>
                  <th className="px-3 py-3">Role</th>
                  <th className="px-3 py-3">Team</th>
                  <th className="px-3 py-3">Location</th>
                  <th className="px-3 py-3">Stage</th>
                  <th className="px-3 py-3">Reason</th>
                  <th className="px-3 py-3">Gender</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Reason/Why/Next Steps</th>
                  <th className="px-3 py-3">Save</th>
                  {auth.isSuperAdmin ? <th className="px-3 py-3">Delete</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {rows.map((row) => (
                  <tr key={row.id} className="align-top transition-all duration-200 hover:bg-[var(--bg-elevated)]">
                    <td className="px-3 py-3">
                      <input
                        className="w-28 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { job_id: event.target.value })}
                        value={row.job_id}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        className="w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { role_title: event.target.value })}
                        value={row.role_title}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="w-40 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { team: event.target.value })}
                        value={row.team}
                      >
                        <option value="">Team</option>
                        {options.team.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { location: event.target.value })}
                        value={row.location}
                      >
                        <option value="">Location</option>
                        {options.location.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="w-40 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { stage: event.target.value })}
                        value={row.stage}
                      >
                        <option value="">Stage</option>
                        {options.dropout_stage.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="w-48 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { dropout_reason: event.target.value })}
                        value={row.dropout_reason}
                      >
                        <option value="">Reason</option>
                        {options.dropout_reason.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="w-36 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { candidate_gender: event.target.value })}
                        value={row.candidate_gender}
                      >
                        <option value="">Gender</option>
                        {options.gender.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        className="w-32 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { dropout_date: event.target.value })}
                        type="date"
                        value={row.dropout_date ?? ""}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { status: event.target.value })}
                        value={row.status}
                      >
                        <option value="Open">Open</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">
                      <textarea
                        className="min-h-20 w-72 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-2"
                        onChange={(event) => setDraftValue(row, { reason_why_next_steps: event.target.value })}
                        value={row.reason_why_next_steps}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-primary)] px-3 py-2 font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--accent-primary-strong)] disabled:opacity-70"
                        disabled={savingId === row.id}
                        onClick={async () => {
                          setSavingId(row.id);
                          try {
                            await updateMutation.mutateAsync({ id: row.id, values: drafts[row.id] ?? row });
                            setDrafts((current) => {
                              const next = { ...current };
                              delete next[row.id];
                              return next;
                            });
                          } catch {
                            setNotice("Unable to save changes.");
                          } finally {
                            setSavingId(null);
                          }
                        }}
                        type="button"
                      >
                        <Save className="h-4 w-4" />
                        {savingId === row.id ? "Saving" : "Save"}
                      </button>
                    </td>
                    {auth.isSuperAdmin ? (
                      <td className="px-3 py-3">
                        <button
                          className="inline-flex items-center gap-2 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3 py-2 font-semibold text-[var(--danger-text)] transition-all duration-200 hover:opacity-90 disabled:opacity-70"
                          disabled={deletingId === row.id}
                          onClick={async () => {
                            if (!window.confirm("Delete this dropout record?")) {
                              return;
                            }
                            setDeletingId(row.id);
                            try {
                              await deleteMutation.mutateAsync(row.id);
                            } catch {
                              setNotice("Unable to delete record.");
                            } finally {
                              setDeletingId(null);
                            }
                          }}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === row.id ? "Deleting" : "Delete"}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
