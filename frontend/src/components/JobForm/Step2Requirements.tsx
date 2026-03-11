import type { UseFormRegister } from "react-hook-form";

import type { JobFormValues } from "../../types";

type Props = {
  register: UseFormRegister<JobFormValues>;
};

export default function Step2Requirements({ register }: Props) {
  return (
    <section className="grid gap-4">
      <label className="space-y-2">
        <span className="text-sm text-[var(--text-secondary)]">Description</span>
        <textarea className="min-h-32 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("description")} />
      </label>
      <label className="space-y-2">
        <span className="text-sm text-[var(--text-secondary)]">Requirements</span>
        <textarea className="min-h-32 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3" {...register("requirements")} />
      </label>
    </section>
  );
}
