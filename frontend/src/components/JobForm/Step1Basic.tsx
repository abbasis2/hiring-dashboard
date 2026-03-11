import type { UseFormRegister } from "react-hook-form";

import type { JobFormValues } from "../../types";

type Props = {
  register: UseFormRegister<JobFormValues>;
};

export default function Step1Basic({ register }: Props) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm text-[var(--text-secondary)]">Role Title</span>
        <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("role_title")} />
      </label>
      <label className="space-y-2">
        <span className="text-sm text-[var(--text-secondary)]">Department</span>
        <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("department")} />
      </label>
      <label className="space-y-2">
        <span className="text-sm text-[var(--text-secondary)]">Location</span>
        <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("location")} />
      </label>
      <label className="space-y-2">
        <span className="text-sm text-[var(--text-secondary)]">Employment Type</span>
        <input className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("employment_type")} />
      </label>
    </section>
  );
}
