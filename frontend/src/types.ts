export type Meta = {
  total: number;
  page: number;
};

export type ApiResponse<T> = {
  data: T;
  meta: Meta;
};

export type OutstandingRole = {
  id: number;
  job_id: string;
  role_title: string;
  link_to_jd: string;
  team: string;
  location: string;
  backfill_reason: string;
  departure_type: string;
  start_date: string;
  status: string;
  internal_shortlisted: number | null;
  interviews_completed: number | null;
  interviews_pending: number | null;
  date_filled: string;
  active_inactive: string;
  created_at: string;
  updated_at: string;
};

export type FilledRole = {
  id: number;
  job_id: string;
  role_title: string;
  team: string;
  location: string;
  backfill_reason: string;
  departure_type: string;
  hired_name: string;
  start_date: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type Job = {
  id: number;
  role_title: string;
  department: string;
  location: string;
  employment_type: string;
  status: string;
  description: string;
  requirements: string;
  created_at: string;
  updated_at: string;
};

export type FunnelStage = {
  stage: string;
  count: number;
};

export type DashboardSummary = {
  total_roles: number;
  active_open: number;
  filled: number;
  fill_rate: string;
  avg_time_to_fill: string;
  pipeline_conversion: string;
  offer_acceptance_rate: string;
};

export type TeamBreakdown = {
  team: string;
  active_outstanding: number;
  filled: number;
  total: number;
  fill_rate: string;
  attrition_fills: number;
  termination_fills: number;
  other_fills: number;
};

export type BreakdownRow = {
  label: string;
  active_outstanding: number;
  filled: number;
  total: number;
  fill_rate: string;
};

export type DashboardStats = {
  generated_on: string;
  summary: DashboardSummary;
  by_team: TeamBreakdown[];
  departure_type_breakdown: BreakdownRow[];
  location_breakdown: BreakdownRow[];
};

export type JobFormValues = {
  role_title: string;
  department: string;
  location: string;
  employment_type: string;
  status: string;
  description: string;
  requirements: string;
};

export type MasterFieldKey =
  | "team"
  | "location"
  | "departure_type"
  | "outstanding_status"
  | "active_inactive"
  | "filled_status";

export type MasterOption = {
  id: number;
  field_key: MasterFieldKey;
  value: string;
  sort_order: number;
  is_active: boolean;
};

export type MasterOptionsMap = Record<MasterFieldKey, MasterOption[]>;

export type DropdownOptions = Record<MasterFieldKey, string[]>;

export type UserRole = "super_admin" | "user";

export type AuthUser = {
  id: number;
  email: string;
  role: UserRole;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

export type AuthLoginPayload = {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
};

export type AuthSignupPayload = {
  message: string;
  email: string;
  verification_code: string | null;
};
