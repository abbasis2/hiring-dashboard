import { useQuery } from "@tanstack/react-query";

import { DEFAULT_DROPDOWN_OPTIONS } from "../constants";
import type { ApiResponse, DropdownOptions, MasterFieldKey, MasterOptionsMap } from "../types";
import client from "./client";

const ORDERED_FIELDS: MasterFieldKey[] = [
  "team",
  "location",
  "departure_type",
  "outstanding_status",
  "active_inactive",
  "filled_status",
];

function normalizeOptions(data?: Partial<MasterOptionsMap>): DropdownOptions {
  const next: DropdownOptions = { ...DEFAULT_DROPDOWN_OPTIONS };
  for (const field of ORDERED_FIELDS) {
    const values = data?.[field]?.map((option) => option.value).filter(Boolean) ?? [];
    if (values.length > 0) {
      next[field] = values;
    }
  }
  return next;
}

async function fetchMasterOptions(): Promise<DropdownOptions> {
  const response = await client.get<ApiResponse<Partial<MasterOptionsMap>>>("/api/master-options");
  return normalizeOptions(response.data.data);
}

export function useMasterOptions() {
  return useQuery({
    queryKey: ["master-options"],
    queryFn: fetchMasterOptions,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });
}
