import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowLeft, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import client from "../../api/client";
import { useMasterOptions } from "../../api/masterOptions";
import {
  isMasterFieldKey,
  MASTER_FIELD_DESCRIPTIONS,
  MASTER_FIELD_LABELS,
  MASTER_FIELD_ROUTE_LABELS,
} from "../../constants";
import type { ApiResponse, MasterFieldKey, MasterOption } from "../../types";

type Notice = {
  tone: "success" | "error";
  text: string;
};

export default function MasterFieldPage() {
  const { fieldKey: rawFieldKey = "" } = useParams();
  const queryClient = useQueryClient();
  const query = useMasterOptions();
  const [value, setValue] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);

  const fieldKey = isMasterFieldKey(rawFieldKey) ? rawFieldKey : null;

  const existingValues = useMemo(() => {
    if (!fieldKey) {
      return [];
    }
    return query.data?.[fieldKey] ?? [];
  }, [fieldKey, query.data]);

  const createMutation = useMutation({
    mutationFn: async (payload: { fieldKey: MasterFieldKey; value: string }) => {
      const response = await client.post<ApiResponse<MasterOption>>(`/api/master-options/${payload.fieldKey}`, {
        value: payload.value,
      });
      return response.data.data;
    },
    onSuccess: async () => {
      setNotice({ tone: "success", text: "Value added. It is now available in app dropdowns." });
      setValue("");
      await queryClient.invalidateQueries({ queryKey: ["master-options"] });
    },
    onError: (error) => {
      const detail =
        error instanceof AxiosError
          ? (error.response?.data?.detail as string | undefined) ?? "Unable to add value"
          : "Unable to add value";
      setNotice({ tone: "error", text: detail });
    },
  });

  if (!fieldKey) {
    return (
      <div className="card-shell max-w-2xl">
        <h1 className="text-2xl font-semibold">Master Page Not Found</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          This master field does not exist. Use one of the listed master pages.
        </p>
        <Link
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-[var(--accent-primary)]"
          to="/master-pages"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Master Pages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Link
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
          to="/master-pages"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Master Pages
        </Link>
        <div>
          <h1 className="text-3xl font-semibold">{MASTER_FIELD_ROUTE_LABELS[fieldKey]}</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{MASTER_FIELD_DESCRIPTIONS[fieldKey]}</p>
        </div>
      </section>

      <section className="card-shell space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Add New {MASTER_FIELD_LABELS[fieldKey]} Value</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Values are unique for this field and update dropdowns everywhere in the app.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3"
            onChange={(event) => setValue(event.target.value)}
            placeholder={`Enter new ${MASTER_FIELD_LABELS[fieldKey]} value`}
            value={value}
          />
          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-3 font-semibold text-[var(--text-on-accent)] transition-all duration-200 hover:bg-[var(--accent-primary-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={createMutation.isPending || !value.trim()}
            onClick={() => {
              setNotice(null);
              createMutation.mutate({ fieldKey, value: value.trim() });
            }}
            type="button"
          >
            <PlusCircle className="h-4 w-4" />
            {createMutation.isPending ? "Adding..." : "Add Value"}
          </button>
        </div>
        {notice ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              notice.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger-text)]"
            }`}
          >
            {notice.text}
          </div>
        ) : null}
      </section>

      <section className="card-shell space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Existing Values</h2>
          <span className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-1 text-xs text-[var(--text-secondary)]">
            {existingValues.length} total
          </span>
        </div>

        {query.isError ? (
          <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-text)]">
            Unable to load values right now. Please refresh and try again.
          </div>
        ) : null}

        {query.isLoading ? (
          <div className="h-36 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]" />
        ) : existingValues.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            No values found yet for this field.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {existingValues.map((option, index) => (
              <div
                key={option}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
              >
                <span className="mr-2 text-xs text-[var(--text-secondary)]">{String(index + 1).padStart(2, "0")}</span>
                {option}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
