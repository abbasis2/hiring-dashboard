import type { JobFormValues } from "../../types";

type Props = {
  values: JobFormValues;
};

export default function Step3Review({ values }: Props) {
  return (
    <section className="card-shell space-y-3 bg-[var(--bg-elevated)]">
      <h3 className="text-lg font-semibold">Review</h3>
      <p><span className="text-[var(--text-secondary)]">Role:</span> {values.role_title}</p>
      <p><span className="text-[var(--text-secondary)]">Department:</span> {values.department}</p>
      <p><span className="text-[var(--text-secondary)]">Location:</span> {values.location || "-"}</p>
      <p><span className="text-[var(--text-secondary)]">Employment:</span> {values.employment_type}</p>
    </section>
  );
}
