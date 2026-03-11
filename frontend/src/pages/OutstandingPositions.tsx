import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import client from "../api/client";
import PositionTable from "../components/PositionTable";
import type { ApiResponse, OutstandingRole } from "../types";

async function fetchOutstandingRoles() {
  const response = await client.get<ApiResponse<OutstandingRole[]>>("/api/positions?size=100");
  return response.data.data;
}

export default function OutstandingPositions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const outstandingQuery = useQuery({ queryKey: ["outstanding-roles"], queryFn: fetchOutstandingRoles });

  const updateOutstanding = useMutation({
    mutationFn: async ({ roleId, values }: { roleId: number; values: Partial<OutstandingRole> }) => {
      await client.put(`/api/positions/${roleId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["outstanding-roles"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  const outstandingRoles = useMemo(() => {
    const roles = outstandingQuery.data ?? [];
    return roles.filter((role) => `${role.job_id} ${role.role_title} ${role.team} ${role.location}`.toLowerCase().includes(search.toLowerCase()));
  }, [outstandingQuery.data, search]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Outstanding Positions</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Edit and save the same fields from the workbook's Outstanding Roles tab.</p>
        </div>
        <label className="flex min-w-80 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--text-secondary)]" />
          <input className="w-full bg-transparent outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search by job id, role, team, or location" value={search} />
        </label>
      </section>
      {outstandingQuery.isLoading ? <div className="card-shell h-64 animate-pulse" /> : <PositionTable roles={outstandingRoles} onSave={async (roleId, values) => updateOutstanding.mutateAsync({ roleId, values })} />}
    </div>
  );
}
