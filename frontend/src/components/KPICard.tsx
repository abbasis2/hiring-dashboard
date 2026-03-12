import type { ReactNode } from "react";

const colorMap = {
  cyan: "var(--accent-primary)",
  emerald: "var(--accent-success)",
  amber: "var(--accent-warning)",
  red: "var(--accent-danger)"
} as const;

type Props = {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: ReactNode;
  tone?: keyof typeof colorMap;
};

export default function KPICard({ title, value, subtitle, icon, tone = "cyan" }: Props) {
  return (
    <div className="card-shell relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${colorMap[tone]}33 0%, transparent 70%)` }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{title}</p>
          <p className="mono mt-3 text-3xl font-semibold">{value}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{subtitle}</p>
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${colorMap[tone]}22`, color: colorMap[tone] }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
