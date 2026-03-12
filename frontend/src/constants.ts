import type { DropdownOptions, MasterFieldKey } from "./types";

export const TEAM_OPTIONS: string[] = [
  "Team D",
  "Team 27",
  "Team 10",
  "Team 19",
  "Team 23",
  "Team 19/23/27 (Generate)",
  "Team 35",
  "Team 28",
  "Team A",
  "Team 3",
  "Team K",
  "SAP S/4 - Team 8",
];

export const DEPARTURE_TYPE_OPTIONS: string[] = [
  "Backfill",
  "Attrition",
  "Termination",
  "New / Reallocation",
];

export const OUTSTANDING_STATUS_OPTIONS: string[] = [
  "Sourcing",
  "Interviewing",
  "Offer",
  "Filled",
];

export const ACTIVE_STATUS_OPTIONS: string[] = ["Active", "Inactive"];

export const FILLED_STATUS_OPTIONS: string[] = ["Offer Accepted", "Started"];

export const LOCATION_OPTIONS: string[] = [
  "CN/Lahore",
  "CN/Lahore - South America",
  "ISSM/Islamabad",
];

export const MASTER_FIELD_LABELS: Record<MasterFieldKey, string> = {
  team: "Team",
  location: "Location",
  departure_type: "Departure Type",
  outstanding_status: "Outstanding Status",
  active_inactive: "Active / Inactive",
  filled_status: "Filled Status",
};

export const MASTER_FIELD_KEYS = Object.keys(MASTER_FIELD_LABELS) as MasterFieldKey[];

export const MASTER_FIELD_DESCRIPTIONS: Record<MasterFieldKey, string> = {
  team: "Controls available team values in Add, Outstanding, and Filled pages.",
  location: "Controls available location values in Add, Outstanding, and Filled pages.",
  departure_type: "Controls available departure type values across all role forms.",
  outstanding_status: "Controls status values shown for outstanding positions.",
  active_inactive: "Controls active/inactive values used in outstanding roles.",
  filled_status: "Controls status values shown for filled positions.",
};

export const MASTER_FIELD_ROUTE_LABELS: Record<MasterFieldKey, string> = {
  team: "Teams",
  location: "Locations",
  departure_type: "Departure Types",
  outstanding_status: "Outstanding Statuses",
  active_inactive: "Active / Inactive",
  filled_status: "Filled Statuses",
};

export function isMasterFieldKey(value: string): value is MasterFieldKey {
  return MASTER_FIELD_KEYS.includes(value as MasterFieldKey);
}

export const DEFAULT_DROPDOWN_OPTIONS: DropdownOptions = {
  team: TEAM_OPTIONS,
  location: LOCATION_OPTIONS,
  departure_type: DEPARTURE_TYPE_OPTIONS,
  outstanding_status: OUTSTANDING_STATUS_OPTIONS,
  active_inactive: ACTIVE_STATUS_OPTIONS,
  filled_status: FILLED_STATUS_OPTIONS,
};
