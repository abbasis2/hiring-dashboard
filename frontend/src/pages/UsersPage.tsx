import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Shield, Trash2, UserX } from "lucide-react";

import client from "../api/client";
import { useAuth } from "../auth/useAuth";
import type { ApiResponse, AuthUser } from "../types";

async function fetchUsers() {
  const response = await client.get<ApiResponse<AuthUser[]>>("/api/users");
  return response.data.data;
}

export default function UsersPage() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 30_000,
  });

  const accessMutation = useMutation({
    mutationFn: async (payload: { userId: number; isActive: boolean }) => {
      await client.patch(`/api/users/${payload.userId}/access`, { is_active: payload.isActive });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      await client.delete(`/api/users/${userId}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const errorText = (() => {
    if (!usersQuery.error) {
      return "";
    }
    if (usersQuery.error instanceof AxiosError) {
      return (usersQuery.error.response?.data?.detail as string | undefined) ?? "Unable to load users";
    }
    return "Unable to load users";
  })();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Users</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Super admin controls to revoke or delete user access.
        </p>
      </section>

      {errorText ? (
        <div className="card-shell border-[var(--danger-border)] bg-[var(--danger-soft)] text-sm text-[var(--danger-text)]">
          {errorText}
        </div>
      ) : null}

      {usersQuery.isLoading ? (
        <div className="card-shell h-64 animate-pulse" />
      ) : (
        <div className="card-shell overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)] text-sm">
              <thead className="bg-[var(--bg-elevated)] text-left text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Verified</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {(usersQuery.data ?? []).map((user) => {
                  const isSelf = user.id === auth.user?.id;
                  const actionBusy = accessMutation.isPending || deleteMutation.isPending;
                  return (
                    <tr key={user.id} className="hover:bg-[var(--bg-elevated)]">
                      <td className="px-4 py-3 font-medium">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 text-xs">
                          <Shield className="h-3 w-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.is_active ? "Active" : "Revoked"}</td>
                      <td className="px-4 py-3">{user.email_verified ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-xs font-semibold transition-all duration-200 hover:border-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSelf || actionBusy}
                            onClick={() => accessMutation.mutate({ userId: user.id, isActive: !user.is_active })}
                            type="button"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            {user.is_active ? "Revoke" : "Restore"}
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] px-3 py-2 text-xs font-semibold text-[var(--danger-text)] transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isSelf || actionBusy}
                            onClick={() => {
                              if (window.confirm(`Delete user ${user.email}? This cannot be undone.`)) {
                                deleteMutation.mutate(user.id);
                              }
                            }}
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
