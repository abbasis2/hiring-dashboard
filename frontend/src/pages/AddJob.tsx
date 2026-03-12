import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useMasterOptions } from "../api/masterOptions";
import client from "../api/client";
import MasterOptionsManager from "../components/MasterOptionsManager";
import {
  DEFAULT_DROPDOWN_OPTIONS,
} from "../constants";
import type { ApiResponse, OutstandingRole } from "../types";

const nullableNumber = z.preprocess(
  (value) => (value === "" || value === null || value === undefined ? null : Number(value)),
  z.number().nullable()
);

const schema = z.object({
  job_id: z.string().default(""),
  role_title: z.string().min(1, "Role title is required"),
  link_to_jd: z.string().default(""),
  team: z.string().min(1, "Team is required"),
  location: z.string().default(""),
  backfill_reason: z.string().default(""),
  departure_type: z.string().default("Backfill"),
  start_date: z.string().default(""),
  status: z.string().default("Sourcing"),
  internal_shortlisted: nullableNumber,
  interviews_completed: nullableNumber,
  interviews_pending: nullableNumber,
  date_filled: z.string().default(""),
  active_inactive: z.string().default("Active"),
});

type FormValues = z.infer<typeof schema>;

export default function AddJob() {
  const queryClient = useQueryClient();
  const optionsQuery = useMasterOptions();
  const options = optionsQuery.data ?? DEFAULT_DROPDOWN_OPTIONS;
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      job_id: "",
      role_title: "",
      link_to_jd: "",
      team: options.team[0] ?? "",
      location: options.location[0] ?? "",
      backfill_reason: "",
      departure_type: options.departure_type[0] ?? "Backfill",
      start_date: "",
      status: options.outstanding_status[0] ?? "Sourcing",
      internal_shortlisted: null,
      interviews_completed: null,
      interviews_pending: null,
      date_filled: "",
      active_inactive: options.active_inactive[0] ?? "Active",
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload = {
        ...values,
        internal_shortlisted: values.internal_shortlisted ?? null,
        interviews_completed: values.interviews_completed ?? null,
        interviews_pending: values.interviews_pending ?? null,
      };
      const response = await client.post<ApiResponse<OutstandingRole>>("/api/positions", payload);
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["outstanding-roles"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Add Position</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Create a new outstanding position. It is saved directly into the Outstanding Positions dataset and updates the dashboard.
        </p>
      </section>
      <form className="grid gap-6" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div className="card-shell grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Job ID</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" placeholder="Auto-generated if left blank" {...register("job_id")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Role Title</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("role_title")} />
            {errors.role_title ? <p className="text-sm text-red-300">{errors.role_title.message}</p> : null}
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Link to JD</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("link_to_jd")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Team</span>
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("team")}>
              {options.team.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Location</span>
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("location")}>
              {options.location.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Departure Type</span>
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("departure_type")}>
              {options.departure_type.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-[var(--text-secondary)]">Backfill Reason</span>
            <textarea className="min-h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("backfill_reason")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Start Date</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" type="date" {...register("start_date")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Status</span>
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("status")}>
              {options.outstanding_status.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Internal Shortlisted</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" type="number" {...register("internal_shortlisted")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">3E Interviews</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" type="number" {...register("interviews_completed")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Interviews Pending</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" type="number" {...register("interviews_pending")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Date Filled</span>
            <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" type="date" {...register("date_filled")} />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[var(--text-secondary)]">Active / Inactive</span>
            <select className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("active_inactive")}>
              {options.active_inactive.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <MasterOptionsManager optionsByField={options} />
        <div className="flex items-center gap-4">
          <button className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Create Position"}
          </button>
          {mutation.isSuccess ? <span className="text-sm text-emerald-300">Position added to outstanding positions.</span> : null}
          {mutation.isError ? <span className="text-sm text-red-300">Unable to create position.</span> : null}
        </div>
      </form>
    </div>
  );
}
