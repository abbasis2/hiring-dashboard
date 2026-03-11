import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { FunnelStage } from "../types";

type Props = {
  stages: FunnelStage[];
};

export default function HiringFunnel({ stages }: Props) {
  return (
    <div className="card-shell h-[320px]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Hiring Funnel</h2>
        <p className="text-sm text-[var(--text-secondary)]">Current movement from open positions to active jobs.</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={stages} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
          <XAxis dataKey="stage" stroke="#94a3b8" tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#08101f", border: "1px solid #1e293b", borderRadius: "12px" }}
            cursor={{ fill: "rgba(6, 182, 212, 0.08)" }}
          />
          <Bar dataKey="count" fill="#06b6d4" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
