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

export const GENDER_OPTIONS: string[] = [
  "Female",
  "Male",
  "Non-binary",
  "Prefer not to say",
];

export const DROPOUT_STAGE_OPTIONS: string[] = [
  "Screening",
  "Technical Interview",
  "Manager Interview",
  "Final Interview",
  "Offer",
];

export const DROPOUT_REASON_OPTIONS: string[] = [
  "Accepted another offer",
  "Compensation mismatch",
  "Role mismatch",
  "Communication delay",
  "Personal reasons",
];

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
  gender: "Gender",
  dropout_stage: "Dropout Stage",
  dropout_reason: "Dropout Reason",
};

export const MASTER_FIELD_KEYS = Object.keys(MASTER_FIELD_LABELS) as MasterFieldKey[];

export const MASTER_FIELD_DESCRIPTIONS: Record<MasterFieldKey, string> = {
  team: "Controls available team values in Add, Outstanding, and Filled pages.",
  location: "Controls available location values in Add, Outstanding, and Filled pages.",
  departure_type: "Controls available departure type values across all role forms.",
  outstanding_status: "Controls status values shown for outstanding positions.",
  active_inactive: "Controls active/inactive values used in outstanding roles.",
  filled_status: "Controls status values shown for filled positions.",
  gender: "Controls gender values used in pipeline/results tracking.",
  dropout_stage: "Controls recruiting dropout stage values.",
  dropout_reason: "Controls recruiting dropout reason values.",
};

export const MASTER_FIELD_ROUTE_LABELS: Record<MasterFieldKey, string> = {
  team: "Teams",
  location: "Locations",
  departure_type: "Departure Types",
  outstanding_status: "Outstanding Statuses",
  active_inactive: "Active / Inactive",
  filled_status: "Filled Statuses",
  gender: "Genders",
  dropout_stage: "Dropout Stages",
  dropout_reason: "Dropout Reasons",
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
  gender: GENDER_OPTIONS,
  dropout_stage: DROPOUT_STAGE_OPTIONS,
  dropout_reason: DROPOUT_REASON_OPTIONS,
};
