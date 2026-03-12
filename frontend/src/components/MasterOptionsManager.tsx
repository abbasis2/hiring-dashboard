import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { MASTER_FIELD_LABELS } from "../constants";
import type { ApiResponse, MasterFieldKey, MasterOption } from "../types";
import client from "../api/client";

type Props = {
  optionsByField: Record<MasterFieldKey, string[]>;
};

const FIELD_KEYS = Object.keys(MASTER_FIELD_LABELS) as MasterFieldKey[];

export default function MasterOptionsManager({ optionsByField }: Props) {
  const queryClient = useQueryClient();
  const [fieldKey, setFieldKey] = useState<MasterFieldKey>("team");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await client.post<ApiResponse<MasterOption>>(`/api/master-options/${fieldKey}`, {
        value: value.trim(),
      });
      return response.data.data;
    },
    onSuccess: async () => {
      setMessage("Value added. Dropdowns are updated.");
      setValue("");
      await queryClient.invalidateQueries({ queryKey: ["master-options"] });
    },
    onError: (error) => {
      const detail =
        error instanceof AxiosError
          ? (error.response?.data?.detail as string | undefined) ?? "Unable to add value"
          : "Unable to add value";
      setMessage(detail);
    },
  });

  return (
    <section className="card-shell space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Manage Dropdown Values</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Add new dropdown values once, then use them everywhere in the app.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[240px_1fr_auto]">
        <label className="space-y-2">
          <span className="text-sm text-[var(--text-secondary)]">Field</span>
          <select
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setFieldKey(event.target.value as MasterFieldKey)}
            value={fieldKey}
          >
            {FIELD_KEYS.map((key) => (
              <option key={key} value={key}>
                {MASTER_FIELD_LABELS[key]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm text-[var(--text-secondary)]">New Value</span>
          <input
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2"
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter a new option value"
            value={value}
          />
        </label>

        <button
          className="mt-7 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 font-semibold text-slate-950 transition-all duration-200 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={mutation.isPending || !value.trim()}
          onClick={() => {
            setMessage("");
            mutation.mutate();
          }}
          type="button"
        >
          <PlusCircle className="h-4 w-4" />
          {mutation.isPending ? "Adding..." : "Add"}
        </button>
      </div>

      {message ? <p className="text-sm text-[var(--text-secondary)]">{message}</p> : null}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
        <p className="mb-2 text-sm font-medium">{MASTER_FIELD_LABELS[fieldKey]} values</p>
        <div className="flex flex-wrap gap-2">
          {(optionsByField[fieldKey] ?? []).map((option) => (
            <span key={option} className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs">
              {option}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
