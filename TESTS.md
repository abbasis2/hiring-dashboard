# TESTS.md — Complete Testing Scenarios
# Plutus21 Hiring Dashboard
# Reference: Used by Codex to write and verify all test cases

---

## Testing Philosophy

Every test in this file maps to a real user scenario or system behavior. Tests are organized by phase and layer. Codex must implement ALL tests listed here before the corresponding test gate in PLAN.md can be considered satisfied.

**Test naming convention:** `test_{what}_{expected_outcome}`

**Test isolation rules:**
- Backend tests use an in-memory (tmp_path) SQLite DB — never the real `hiring.db`
- Frontend tests mock all Axios/API calls using `vi.mock` (Vitest)
- No test should depend on another test's state

---

## ══════════════════════════════════════════
## TIER 1: BACKEND UNIT & INTEGRATION TESTS
## (pytest + httpx AsyncClient)
## ══════════════════════════════════════════

### File: `backend/tests/test_jobs.py`

---

#### TEST-B-001 `test_list_jobs_returns_200`
**Scenario:** A client sends `GET /api/jobs` to list all outstanding roles.
**Precondition:** Database seeded with 10 outstanding roles.
**Steps:**
1. Send `GET /api/jobs`
2. Assert HTTP status code == 200
3. Assert response JSON `success` == True
**Pass condition:** Status 200, `{"success": true, "data": [...], "error": null}`

---

#### TEST-B-002 `test_list_jobs_returns_10_seeded_roles`
**Scenario:** The seeded database contains exactly 10 outstanding roles.
**Steps:**
1. Send `GET /api/jobs`
2. Parse `data` array from response
3. Assert `len(data) == 10`
**Pass condition:** `data` has exactly 10 items.

---

#### TEST-B-003 `test_list_jobs_response_includes_all_fields`
**Scenario:** Each job object in the list response contains all required fields.
**Steps:**
1. Send `GET /api/jobs`
2. Take `data[0]`
3. Assert all keys present: `job_id`, `role_title`, `team`, `location`, `departure_type`, `status`, `internal_shortlisted`, `interviews_done`, `interviews_pending`
**Pass condition:** All 9 fields present in first record.

---

#### TEST-B-004 `test_get_single_job_returns_correct_id`
**Scenario:** Fetching a specific job by ID returns the correct record.
**Steps:**
1. Send `GET /api/jobs/JOB-001`
2. Assert status 200
3. Assert `data.job_id == "JOB-001"`
4. Assert `data.role_title == "Senior Database Engineer"`
**Pass condition:** Correct record returned with matching job_id and title.

---

#### TEST-B-005 `test_get_nonexistent_job_returns_404`
**Scenario:** Requesting a job ID that doesn't exist returns a 404.
**Steps:**
1. Send `GET /api/jobs/JOB-999`
2. Assert HTTP status == 404
**Pass condition:** Status 404.

---

#### TEST-B-006 `test_create_job_returns_success_shape`
**Scenario:** Creating a new job via POST returns the correct response envelope.
**Payload:** `{"role_title": "Test Engineer", "team": "Team D", "departure_type": "Backfill"}`
**Steps:**
1. Send `POST /api/jobs` with payload
2. Assert status 200
3. Assert `success == True`
4. Assert `data.job_id` is not null
5. Assert `data.role_title == "Test Engineer"`
**Pass condition:** Response has valid shape with auto-generated job_id.

---

#### TEST-B-007 `test_create_job_auto_increments_id`
**Scenario:** The system auto-generates the next sequential Job ID.
**Context:** Seed data max is JOB-015 (filled). Next should be JOB-016.
**Steps:**
1. Send `POST /api/jobs` with minimal payload
2. Assert `data.job_id == "JOB-016"`
**Pass condition:** `job_id` is `"JOB-016"`.

---

#### TEST-B-008 `test_create_job_missing_required_field_returns_422`
**Scenario:** POST without required `role_title` returns validation error.
**Steps:**
1. Send `POST /api/jobs` with `{"team": "Team D"}` (no role_title)
2. Assert status == 422
**Pass condition:** Status 422 (Pydantic validation error).

---

#### TEST-B-009 `test_update_job_status_reflects_in_get`
**Scenario:** After PATCHing a job status, subsequent GET returns the updated status.
**Steps:**
1. Send `PATCH /api/jobs/JOB-001/status` with `{"status": "Interviewing"}`
2. Assert status 200
3. Send `GET /api/jobs/JOB-001`
4. Assert `data.status == "Interviewing"`
**Pass condition:** Status persisted and returned.

---

#### TEST-B-010 `test_delete_job_removes_record`
**Scenario:** DELETE removes the record; subsequent GET returns 404.
**Steps:**
1. Send `DELETE /api/jobs/JOB-001`
2. Assert status 200
3. Send `GET /api/jobs/JOB-001`
4. Assert status 404
**Pass condition:** Record no longer accessible after delete.

---

### File: `backend/tests/test_filled.py`

---

#### TEST-B-011 `test_list_filled_returns_200`
**Scenario:** GET /api/filled returns 200 with success envelope.
**Steps:**
1. Send `GET /api/filled`
2. Assert status 200
3. Assert `success == True`
**Pass condition:** Status 200, `success: true`.

---

#### TEST-B-012 `test_list_filled_returns_5_seeded_records`
**Scenario:** Seeded database has exactly 5 filled roles.
**Steps:**
1. Send `GET /api/filled`
2. Assert `len(data) == 5`
**Pass condition:** Exactly 5 records.

---

#### TEST-B-013 `test_filled_contains_hired_name`
**Scenario:** Each filled role includes the hired person's name.
**Steps:**
1. Send `GET /api/filled`
2. Assert every record in `data` has non-null `hired_name`
3. Assert at least one record has `hired_name == "Muhammad Adam"`
**Pass condition:** `hired_name` present and correct on seed data.

---

#### TEST-B-014 `test_post_filled_marks_outstanding_as_filled`
**Scenario:** Adding a filled role via POST causes the corresponding outstanding role status to become "Filled".
**Steps:**
1. Send `POST /api/filled` with `{"job_id":"JOB-002","role_title":"Senior Cloud Engineer","team":"Team 27","hired_name":"Ahmed Khan","hire_status":"Offer Accepted"}`
2. Assert status 200
3. Send `GET /api/jobs/JOB-002`
4. Assert `data.status == "Filled"`
**Pass condition:** Outstanding role status changed to "Filled".

---

#### TEST-B-015 `test_post_filled_response_contains_correct_job_id`
**Scenario:** POST /api/filled response returns the created record with the correct job_id.
**Steps:**
1. Send `POST /api/filled` with `job_id: "JOB-004"`
2. Assert `data.job_id == "JOB-004"`
**Pass condition:** Correct job_id in response data.

---

### File: `backend/tests/test_dashboard.py`

---

#### TEST-B-016 `test_dashboard_returns_200`
**Scenario:** GET /api/dashboard returns 200.
**Pass condition:** Status 200, `success: true`.

---

#### TEST-B-017 `test_dashboard_total_roles_is_15`
**Scenario:** Total roles = outstanding (10) + filled (5) = 15.
**Steps:**
1. Send `GET /api/dashboard`
2. Assert `data.total_roles == 15`
**Pass condition:** `total_roles` equals 15.

---

#### TEST-B-018 `test_dashboard_active_open_is_10`
**Scenario:** Active open roles = 10 (all outstanding roles, none filled yet in test state).
**Steps:**
1. Send `GET /api/dashboard`
2. Assert `data.active_open == 10`
**Pass condition:** `active_open` equals 10.

---

#### TEST-B-019 `test_dashboard_fill_rate_is_33_point_3`
**Scenario:** Fill rate = 5/15 * 100 = 33.3%.
**Steps:**
1. Send `GET /api/dashboard`
2. Assert `data.fill_rate == 33.3`
**Pass condition:** `fill_rate` exactly equals 33.3.

---

#### TEST-B-020 `test_dashboard_by_team_is_list_of_dicts`
**Scenario:** `by_team` is a list where each entry has "team", "open", "filled" keys.
**Steps:**
1. Send `GET /api/dashboard`
2. Assert `data.by_team` is a list
3. Assert `len(data.by_team) > 0`
4. Assert each item has keys: `team`, `open`, `filled`
**Pass condition:** Well-formed by_team array.

---

#### TEST-B-021 `test_dashboard_hire_status_breakdown_present`
**Scenario:** `hire_status_breakdown` reflects the 5 filled roles.
**Steps:**
1. Send `GET /api/dashboard`
2. Assert `data.hire_status_breakdown` is a non-empty list
3. Sum all `count` values across entries == 5
**Pass condition:** Total count across all statuses == 5.

---

#### TEST-B-022 `test_dashboard_response_has_request_id`
**Scenario:** Every API response includes a `request_id` field for tracing.
**Steps:**
1. Send `GET /api/dashboard`
2. Assert `request_id` is in the response root object
3. Assert `request_id` is a non-empty string
**Pass condition:** `request_id` present and non-empty.

---

## ══════════════════════════════════════════
## TIER 2: FRONTEND COMPONENT TESTS
## (Vitest + React Testing Library)
## ══════════════════════════════════════════

### File: `frontend/src/test/KPICard.test.jsx`

---

#### TEST-F-001 `test_kpicard_renders_title`
**Scenario:** KPICard displays its title prop.
```jsx
render(<KPICard title="Total Roles" value={15} />)
expect(screen.getByText('Total Roles')).toBeInTheDocument()
```
**Pass condition:** "Total Roles" visible.

---

#### TEST-F-002 `test_kpicard_renders_subtitle`
**Scenario:** KPICard displays its subtitle prop.
```jsx
render(<KPICard title="X" value={5} subtitle="All tracked positions" />)
expect(screen.getByText('All tracked positions')).toBeInTheDocument()
```
**Pass condition:** Subtitle text visible.

---

#### TEST-F-003 `test_kpicard_renders_suffix`
**Scenario:** KPICard appended with suffix "%" renders that suffix somewhere.
```jsx
render(<KPICard title="Fill Rate" value={33} suffix="%" />)
expect(screen.getByText(/%/)).toBeInTheDocument()
```
**Pass condition:** "%" present in DOM.

---

#### TEST-F-004 `test_kpicard_renders_zero_value`
**Scenario:** KPICard with value=0 doesn't crash and renders something.
```jsx
render(<KPICard title="Empty" value={0} />)
expect(screen.getByText('Empty')).toBeInTheDocument()
```
**Pass condition:** No crash, title rendered.

---

### File: `frontend/src/test/Layout.test.jsx`

---

#### TEST-F-005 `test_layout_renders_all_nav_links`
**Scenario:** Sidebar contains all four navigation links.
```jsx
render(<MemoryRouter><Layout><div/></Layout></MemoryRouter>)
expect(screen.getByText('Dashboard')).toBeInTheDocument()
expect(screen.getByText('Open Roles')).toBeInTheDocument()
expect(screen.getByText('Filled Roles')).toBeInTheDocument()
expect(screen.getByText('Post a Job')).toBeInTheDocument()
```
**Pass condition:** All 4 nav labels visible.

---

#### TEST-F-006 `test_layout_renders_brand_name`
**Scenario:** Sidebar shows the "Plutus21" brand text.
```jsx
render(<MemoryRouter><Layout><div/></Layout></MemoryRouter>)
expect(screen.getByText('Plutus21')).toBeInTheDocument()
```
**Pass condition:** "Plutus21" visible.

---

#### TEST-F-007 `test_layout_renders_children`
**Scenario:** Layout renders its children in the main content area.
```jsx
render(<MemoryRouter><Layout><p>Hello World</p></Layout></MemoryRouter>)
expect(screen.getByText('Hello World')).toBeInTheDocument()
```
**Pass condition:** "Hello World" visible.

---

### File: `frontend/src/test/AddJob.test.jsx`

---

#### TEST-F-008 `test_addjob_renders_role_title_input`
**Scenario:** Add Job form has a Role Title input.
```jsx
render(<MemoryRouter><AddJob /></MemoryRouter>)
expect(screen.getByPlaceholderText(/Senior AI Engineer/i)).toBeInTheDocument()
```
**Pass condition:** Placeholder text found.

---

#### TEST-F-009 `test_addjob_renders_team_select`
**Scenario:** Add Job form has a Team dropdown.
```jsx
render(<MemoryRouter><AddJob /></MemoryRouter>)
expect(screen.getByRole('combobox')).toBeInTheDocument()
```
**Pass condition:** A `<select>` element is present.

---

#### TEST-F-010 `test_addjob_renders_departure_type_pills`
**Scenario:** All four departure type options render as buttons.
```jsx
render(<MemoryRouter><AddJob /></MemoryRouter>)
expect(screen.getByText('Backfill')).toBeInTheDocument()
expect(screen.getByText('Attrition')).toBeInTheDocument()
expect(screen.getByText('Termination')).toBeInTheDocument()
expect(screen.getByText('New Headcount')).toBeInTheDocument()
```
**Pass condition:** All 4 departure type labels visible.

---

#### TEST-F-011 `test_addjob_renders_post_button`
**Scenario:** The submit button "Post Role" is visible.
```jsx
render(<MemoryRouter><AddJob /></MemoryRouter>)
expect(screen.getByText('Post Role')).toBeInTheDocument()
```
**Pass condition:** "Post Role" button visible.

---

### File: `frontend/src/test/store.test.js`

---

#### TEST-F-012 `test_store_initial_state`
**Scenario:** Fresh Zustand store has correct initial values.
```js
const state = useStore.getState()
expect(state.jobs).toEqual([])
expect(state.filledRoles).toEqual([])
expect(state.kpis).toBeNull()
expect(state.loading.jobs).toBe(false)
```
**Pass condition:** All initial state values correct.

---

#### TEST-F-013 `test_store_fetchJobs_sets_jobs`
**Scenario:** Calling fetchJobs populates the jobs array from the mocked API response.
```js
vi.mock('../hooks/useApi', () => ({
  default: { get: vi.fn().mockResolvedValue({ data: { data: [{ job_id: 'JOB-001' }] } }) }
}))
await useStore.getState().fetchJobs()
expect(useStore.getState().jobs).toHaveLength(1)
```
**Pass condition:** `jobs` array has 1 item after mock fetch.

---

#### TEST-F-014 `test_store_fetchJobs_sets_loading_false_after_complete`
**Scenario:** After fetchJobs resolves, `loading.jobs` is false.
```js
// Same mock as above
await useStore.getState().fetchJobs()
expect(useStore.getState().loading.jobs).toBe(false)
```
**Pass condition:** `loading.jobs` is false after resolution.

---

#### TEST-F-015 `test_store_updateJobStatus_changes_status_locally`
**Scenario:** updateJobStatus mutates the matching job's status in the local state.
```js
// Pre-seed store state
useStore.setState({ jobs: [{ job_id: 'JOB-001', status: 'Sourcing' }] })
vi.mock('../hooks/useApi', () => ({ default: { patch: vi.fn().mockResolvedValue({}) } }))
await useStore.getState().updateJobStatus('JOB-001', 'Interviewing')
const job = useStore.getState().jobs.find(j => j.job_id === 'JOB-001')
expect(job.status).toBe('Interviewing')
```
**Pass condition:** Local state updated without full re-fetch.

---

## ══════════════════════════════════════════
## TIER 3: INTEGRATION SMOKE TESTS
## (curl-based, Phase 4 gate)
## ══════════════════════════════════════════

### TEST-I-001 `smoke_backend_health`
```bash
curl -sf http://localhost:8000/health | python3 -c \
  "import sys,json; d=json.load(sys.stdin); assert d['status']=='ok', 'FAIL'; print('PASS')"
```
**Expected:** `PASS`

---

### TEST-I-002 `smoke_jobs_count`
```bash
curl -sf http://localhost:8000/api/jobs | python3 -c \
  "import sys,json; d=json.load(sys.stdin); assert len(d['data'])==10, f'FAIL: got {len(d[\"data\"])}'; print('PASS')"
```
**Expected:** `PASS`

---

### TEST-I-003 `smoke_filled_count`
```bash
curl -sf http://localhost:8000/api/filled | python3 -c \
  "import sys,json; d=json.load(sys.stdin); assert len(d['data'])==5, f'FAIL: got {len(d[\"data\"])}'; print('PASS')"
```
**Expected:** `PASS`

---

### TEST-I-004 `smoke_dashboard_kpis`
```bash
curl -sf http://localhost:8000/api/dashboard | python3 -c "
import sys,json
d=json.load(sys.stdin)['data']
assert d['total_roles']==15, f'FAIL total_roles: {d[\"total_roles\"]}'
assert d['fill_rate']==33.3, f'FAIL fill_rate: {d[\"fill_rate\"]}'
print('PASS')
"
```
**Expected:** `PASS`

---

### TEST-I-005 `smoke_create_job`
```bash
curl -sf -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"role_title":"Smoke Test Role","team":"Team D"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); assert d['success']==True; assert 'JOB-' in d['data']['job_id']; print('PASS')"
```
**Expected:** `PASS`

---

### TEST-I-006 `smoke_cors_headers`
```bash
CORS=$(curl -sf -X OPTIONS http://localhost:8000/api/jobs \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" -I \
  | grep -i "access-control-allow-origin")
echo "$CORS" | grep -q "5173" && echo "PASS" || echo "FAIL: $CORS"
```
**Expected:** `PASS`

---

### TEST-I-007 `smoke_request_id_in_response`
```bash
curl -sf http://localhost:8000/api/jobs | python3 -c \
  "import sys,json; d=json.load(sys.stdin); assert 'request_id' in d and len(d['request_id'])>0, 'FAIL'; print('PASS')"
```
**Expected:** `PASS`

---

### TEST-I-008 `smoke_404_returns_json`
```bash
curl -s http://localhost:8000/api/jobs/JOB-999 | python3 -c \
  "import sys,json; d=json.load(sys.stdin); assert d['success']==False, 'FAIL'; print('PASS')"
```
**Expected:** `PASS`

---

## ══════════════════════════════════════════
## TIER 4: EDGE CASES & BOUNDARY TESTS
## ══════════════════════════════════════════

These are additional tests Codex should implement if time permits, or on any bug fix iteration.

### Edge Case Tests (Backend)

| Test ID | Description | Expected |
|---------|-------------|----------|
| TEST-E-001 | Create job with very long role_title (500 chars) | 200, stored as-is |
| TEST-E-002 | PATCH status with invalid value | 200, status stored regardless (no enum validation) |
| TEST-E-003 | DELETE same job twice | First 200, second 200 (idempotent delete) |
| TEST-E-004 | GET /api/jobs after all jobs deleted | 200, empty data array |
| TEST-E-005 | POST /api/filled with duplicate job_id | 200, REPLACE behavior (INSERT OR REPLACE) |
| TEST-E-006 | Dashboard after adding 1 more outstanding | total_roles increments correctly |

### Edge Case Tests (Frontend)

| Test ID | Description | Expected |
|---------|-------------|----------|
| TEST-E-007 | Dashboard renders with kpis=null | Shows skeleton, no crash |
| TEST-E-008 | OutstandingJobs with empty jobs array | Shows "No matching roles found" |
| TEST-E-009 | AddJob form submit with network error | Shows error toast, form still accessible |
| TEST-E-010 | KPICard with value=0 doesn't divide by zero | Renders 0 or "—", no crash |

---

## ══════════════════════════════════════════
## TEST SUMMARY TABLE
## ══════════════════════════════════════════

| Phase Gate | Suite | Tests Required | Tests Pass Target |
|------------|-------|----------------|-------------------|
| Phase 2 | pytest backend | 20 (B-001 to B-022) | 20 / 20 |
| Phase 3 | vitest frontend | 15 (F-001 to F-015) | 15 / 15 |
| Phase 4 | curl integration | 8 (I-001 to I-008) | 8 / 8 |
| Phase 5 | full regression | 35 total | 35 / 35 |

**Grand Total: 35 automated tests must pass before the project is complete.**

---

## Failure Response Protocol

When a test fails, Codex must:

1. Print the failure banner from CLAUDE.md
2. Read the failing test carefully
3. Identify the root cause (wrong logic, missing field, off-by-one, etc.)
4. Fix the source code — never comment out or skip the test
5. Re-run the specific test file: `pytest tests/test_dashboard.py::test_fill_rate -v`
6. If fixed, re-run the full suite to confirm no regressions
7. Only then advance

**Never, under any circumstance, mark a test as `xfail` or `skip` to pass the gate.**
