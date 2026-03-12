import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useMasterOptions } from "../api/masterOptions";
import client from "../api/client";
import FilledRolesTable from "../components/FilledRolesTable";
import type { ApiResponse, FilledRole } from "../types";

async function fetchFilledRoles() {
  const response = await client.get<ApiResponse<FilledRole[]>>("/api/filled-roles?size=100");
  return response.data.data;
}

export default function FilledPositions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const optionsQuery = useMasterOptions();
  const filledQuery = useQuery({
    queryKey: ["filled-roles"],
    queryFn: fetchFilledRoles,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  const updateFilled = useMutation({
    mutationFn: async ({ roleId, values }: { roleId: number; values: Partial<FilledRole> }) => {
      await client.put(`/api/filled-roles/${roleId}`, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["filled-roles"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  });

  const filledRoles = useMemo(() => {
    const roles = filledQuery.data ?? [];
    return roles.filter((role) => `${role.job_id} ${role.role_title} ${role.team} ${role.location} ${role.hired_name}`.toLowerCase().includes(search.toLowerCase()));
  }, [filledQuery.data, search]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Filled Positions</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Edit and save the same fields from the workbook's Filled Roles tab.</p>
        </div>
        <label className="flex min-w-80 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3">
          <Search className="h-4 w-4 text-[var(--text-secondary)]" />
          <input className="w-full bg-transparent outline-none" onChange={(event) => setSearch(event.target.value)} placeholder="Search by job id, role, team, location, or hire" value={search} />
        </label>
      </section>
      {filledQuery.isError ? (
        <div className="card-shell border-red-500/30 bg-red-500/10 text-sm text-red-200">
          Unable to load filled positions. Please refresh and try again.
        </div>
      ) : null}
      {filledQuery.isLoading || !optionsQuery.data ? (
        <div className="card-shell h-64 animate-pulse" />
      ) : (
        <FilledRolesTable
          options={optionsQuery.data}
          roles={filledRoles}
          onSave={async (roleId, values) => updateFilled.mutateAsync({ roleId, values })}
        />
      )}
    </div>
  );
}
