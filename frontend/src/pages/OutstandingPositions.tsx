import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useMasterOptions } from "../api/masterOptions";
import client from "../api/client";
import { useAuth } from "../auth/useAuth";
import PositionTable from "../components/PositionTable";
import type { ApiResponse, OutstandingRole } from "../types";

async function fetchOutstandingRoles() {
  const response = await client.get<ApiResponse<OutstandingRole[]>>("/api/positions?size=100");
  return response.data.data;
}

export default function OutstandingPositions() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const optionsQuery = useMasterOptions();
  const outstandingQuery = useQuery({
    queryKey: ["outstanding-roles"],
    queryFn: fetchOutstandingRoles,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  const updateOutstanding = useMutation({
    mutationFn: async ({ roleId, values }: { roleId: number; values: Partial<OutstandingRole> }) => {
      await client.put(`/api/positions/${roleId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["outstanding-roles"] });
      await queryClient.invalidateQueries({ queryKey: ["filled-roles"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  const deleteOutstanding = useMutation({
    mutationFn: async (roleId: number) => {
      await client.delete(`/api/positions/${roleId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["outstanding-roles"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  const outstandingRoles = useMemo(() => {
    const roles = outstandingQuery.data ?? [];
    return roles.filter((role) =>
      `${role.job_id} ${role.role_title} ${role.team} ${role.location} ${role.candidate_gender} ${role.reason_why_next_steps}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
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
      {outstandingQuery.isError ? (
        <div className="card-shell border-[var(--danger-border)] bg-[var(--danger-soft)] text-sm text-[var(--danger-text)]">
          Unable to load outstanding positions. Please refresh and try again.
        </div>
      ) : null}
      {outstandingQuery.isLoading || !optionsQuery.data ? (
        <div className="card-shell h-64 animate-pulse" />
      ) : (
        <PositionTable
          canDelete={auth.isSuperAdmin}
          options={optionsQuery.data}
          roles={outstandingRoles}
          onDelete={async (roleId) => deleteOutstanding.mutateAsync(roleId)}
          onSave={async (roleId, values) => updateOutstanding.mutateAsync({ roleId, values })}
        />
      )}
    </div>
  );
}
