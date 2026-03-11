# PLAN.md — Codex Single-Shot Development Plan
# Plutus21 Hiring Dashboard
# Version: 1.0 | Execution: Single-shot, gated by tests

---

## EXECUTION RULES (READ FIRST — NON-NEGOTIABLE)

1. Execute ALL phases sequentially. No skipping. No reordering.
2. After completing each phase, run its test suite using `Bash`.
3. If ANY test fails → fix it → re-run → only then advance.
4. Announce phase transitions using the banner format from CLAUDE.md.
5. Make a git commit after every phase that passes all tests.
6. Do not stop execution until the Definition of Done in CLAUDE.md is satisfied.
7. If you encounter an ambiguity, choose the most defensible option and log it as a comment.

---

## ════════════════════════════════════════════
## PHASE 1 — PROJECT SCAFFOLD & ENVIRONMENT
## ════════════════════════════════════════════

### Objective
Establish the full directory structure, dependency manifests, and tooling config so that subsequent phases can build into a working skeleton.

### Step 1.1 — Initialize Git Repository
```bash
cd hiring-dashboard
git init
git add .gitignore
git commit -m "init: project scaffold"
```

Create `.gitignore` with:
```
__pycache__/
*.pyc
*.db
*.db-shm
*.db-wal
node_modules/
dist/
.env
logs/
*.log
```

### Step 1.2 — Create Backend `requirements.txt`
File: `backend/requirements.txt`
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
aiosqlite==0.20.0
pydantic==2.7.0
python-multipart==0.0.9
pytest==8.2.0
pytest-asyncio==0.23.0
httpx==0.27.0
```

Run: `cd backend && pip install -r requirements.txt`
Verify: `python -c "import fastapi, aiosqlite, pydantic; print('OK')"` — must print `OK`.

### Step 1.3 — Create Frontend `package.json`
File: `frontend/package.json`
```json
{
  "name": "hiring-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "zustand": "^4.5.0",
    "axios": "^1.7.0",
    "recharts": "^2.12.0",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.9",
    "vite": "^5.4.0",
    "vitest": "^2.0.0"
  }
}
```

Run: `cd frontend && npm install`
Verify: `ls frontend/node_modules | grep -c ""` — must show more than 100 lines.

### Step 1.4 — Create Vite Config
File: `frontend/vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

### Step 1.5 — Create TailwindCSS Config
Files: `frontend/tailwind.config.js`, `frontend/postcss.config.js`

### Step 1.6 — Create Test Setup File
File: `frontend/src/test/setup.js`
```js
import '@testing-library/jest-dom'
```

### Step 1.7 — Create Backend Package Init
File: `backend/routes/__init__.py` — empty file.
File: `backend/tests/__init__.py` — empty file.

### Step 1.8 — Create Vitest Config in package.json (already done in Step 1.3)

---

### ⚑ PHASE 1 TEST GATE

Run the following checks. All must succeed before proceeding:

```bash
# Test 1.A — Python imports
cd backend && python -c "import fastapi, aiosqlite, pydantic, pytest, httpx; print('PHASE1_PYTHON_OK')"

# Test 1.B — Node modules installed
ls frontend/node_modules/.bin/vite && echo "PHASE1_VITE_OK"

# Test 1.C — Vitest binary available
ls frontend/node_modules/.bin/vitest && echo "PHASE1_VITEST_OK"

# Test 1.D — Directory structure
ls backend/routes/__init__.py && ls backend/tests/__init__.py && echo "PHASE1_DIRS_OK"
```

**Expected output:** All four lines print `PHASE1_*_OK`.

**If any check fails:** Install the missing dependency. Do not proceed until all four pass.

After all pass → `git add -A && git commit -m "phase-1: scaffold complete"`

---

## ════════════════════════════════════════════
## PHASE 2 — BACKEND CORE
## ════════════════════════════════════════════

### Objective
Build the complete FastAPI backend: database layer, Pydantic models, all routes, middleware, and seeding.

### Step 2.1 — Create `backend/models.py`

Define these Pydantic v2 models:
- `OutstandingRole` — fields: id, job_id, role_title, team, location, backfill_reason, departure_type, status (default "Sourcing"), internal_shortlisted (int, default 0), interviews_done (int, default 0), interviews_pending (int, default 0), jd_link, created_at
- `FilledRole` — fields: id, job_id, role_title, team, location, departure_type, hired_name, start_date, hire_status (default "Offer Accepted"), notes
- `JobCreate` — request body for creating a new job (role_title required, team required, rest optional)
- `StatusUpdate` — single field: status (str)
- `APIResponse` — generic envelope: success (bool), data (Any), error (Optional[str]), request_id (str)

### Step 2.2 — Create `backend/database.py`

Implement:
- `DB_PATH = Path("hiring.db")` constant
- `OUTSTANDING_SEED` list of 10 tuples (from seed data in CLAUDE.md)
- `FILLED_SEED` list of 5 tuples (from seed data in CLAUDE.md)
- `async def init_db()` — creates tables, checks COUNT(*), seeds if empty
- Table `outstanding_roles`: id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT UNIQUE NOT NULL, role_title, team, location, backfill_reason, departure_type, status DEFAULT 'Sourcing', internal_shortlisted INTEGER DEFAULT 0, interviews_done INTEGER DEFAULT 0, interviews_pending INTEGER DEFAULT 0, jd_link, created_at TEXT DEFAULT (datetime('now'))
- Table `filled_roles`: id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT UNIQUE NOT NULL, role_title, team, location, departure_type, hired_name, start_date, hire_status DEFAULT 'Offer Accepted', notes

### Step 2.3 — Create `backend/routes/jobs.py`

Implement these endpoints:
- `GET /api/jobs` — returns all outstanding roles ordered by job_id
- `GET /api/jobs/{job_id}` — returns one role or 404
- `POST /api/jobs` — creates a new role, auto-generates next JOB-NNN id, returns created record
- `PATCH /api/jobs/{job_id}/status` — updates status field, returns `{job_id, status}`
- `DELETE /api/jobs/{job_id}` — deletes record, returns `{deleted: job_id}`

All use the `ok(data, rid)` helper that wraps in the envelope format.
Row-to-dict helper `row_to_role(row)` maps sqlite tuple to dict.

### Step 2.4 — Create `backend/routes/filled.py`

Implement:
- `GET /api/filled` — returns all filled roles ordered by start_date DESC
- `POST /api/filled` — inserts filled role record AND sets the corresponding outstanding_role status to 'Filled'

### Step 2.5 — Create `backend/routes/dashboard.py`

Implement `GET /api/dashboard` that returns a single aggregated KPI object:
```json
{
  "total_roles": int,
  "total_outstanding": int,
  "active_open": int,
  "total_filled": int,
  "fill_rate": float,
  "pipeline_conversion": float,
  "shortlisted": int,
  "interviews_done": int,
  "interviews_pending": int,
  "by_team": [{"team": str, "open": int, "filled": int}],
  "by_departure_type_outstanding": [{"type": str, "count": int}],
  "by_departure_type_filled": [{"type": str, "count": int}],
  "hire_status_breakdown": [{"status": str, "count": int}]
}
```

### Step 2.6 — Create `backend/main.py`

Implement:
- `@asynccontextmanager lifespan(app)` — calls `await init_db()` on startup
- `CORSMiddleware` — allows origins `http://localhost:5173` and `http://localhost:3000`
- HTTP middleware that attaches `request_id = uuid4()[:8]` to `request.state` and logs `{method, path, status, ms, rid}` as structured JSON
- Include all three routers with prefixes `/api/jobs`, `/api/filled`, `/api/dashboard`
- `GET /health` returns `{"status": "ok", "service": "hiring-dashboard-api"}`
- `GET /` returns `{"message": "Hiring Dashboard API", "docs": "/docs"}`

### Step 2.7 — Create Backend Test Conftest
File: `backend/tests/conftest.py`

```python
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from backend.main import app
from backend.database import init_db
import aiosqlite

# Override DB to use in-memory for tests
import backend.database as db_module

@pytest.fixture(autouse=True)
async def setup_test_db(monkeypatch, tmp_path):
    test_db = tmp_path / "test.db"
    monkeypatch.setattr(db_module, "DB_PATH", test_db)
    await init_db()
    yield

@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
```

Note: Add `asyncio_mode = "auto"` to `pytest.ini` or `pyproject.toml`.

---

### ⚑ PHASE 2 TEST GATE

Run: `cd backend && pytest tests/ -v --tb=short`

**Required passing tests** (write these in `tests/test_jobs.py`, `tests/test_filled.py`, `tests/test_dashboard.py` BEFORE running):

**test_jobs.py** (8 tests):
- `test_list_jobs_returns_200` — GET /api/jobs → status 200
- `test_list_jobs_returns_10_seeded_roles` — response data has length 10
- `test_get_single_job_returns_correct_id` — GET /api/jobs/JOB-001 → job_id == "JOB-001"
- `test_get_nonexistent_job_returns_404` — GET /api/jobs/JOB-999 → status 404
- `test_create_job_returns_201_shape` — POST /api/jobs → success True, job_id present
- `test_create_job_auto_increments_id` — created job_id is "JOB-016" (next after seed max)
- `test_update_job_status` — PATCH /api/jobs/JOB-001/status → new status reflected
- `test_delete_job_removes_record` — DELETE /api/jobs/JOB-001 → subsequent GET returns 404

**test_filled.py** (5 tests):
- `test_list_filled_returns_200`
- `test_list_filled_returns_5_seeded_records`
- `test_filled_sorted_by_date_desc`
- `test_post_filled_marks_outstanding_as_filled` — POST /api/filled → GET /api/jobs/JOB-002 shows status "Filled"
- `test_post_filled_response_shape`

**test_dashboard.py** (7 tests):
- `test_dashboard_returns_200`
- `test_dashboard_total_roles_is_15` — 10 outstanding + 5 filled = 15
- `test_dashboard_total_filled_is_5`
- `test_dashboard_active_open_is_10`
- `test_dashboard_fill_rate_is_correct` — 5/15 * 100 = 33.3
- `test_dashboard_by_team_structure` — array of objects with "team", "open", "filled" keys
- `test_dashboard_hire_status_breakdown_present`

**Acceptance:** `20 passed` in output. Zero failures, zero errors.

After passing → `git add -A && git commit -m "phase-2: backend complete, 20 tests green"`

---

## ════════════════════════════════════════════
## PHASE 3 — FRONTEND CORE
## ════════════════════════════════════════════

### Objective
Build the complete React frontend: global store, API client, layout, all pages, components.

### Step 3.1 — Create `frontend/index.html`
Standard HTML5 boilerplate with:
- `<title>Plutus21 Hiring Dashboard</title>`
- Google Fonts link: Sora (300,400,600,700,800) + Inter (300,400,500,600)
- `<div id="root"></div>`
- `<script type="module" src="/src/main.jsx"></script>`

### Step 3.2 — Create `frontend/src/index.css`
Include:
- `@tailwind base; @tailwind components; @tailwind utilities;`
- `body` — background `#090e1a`, color `#e2e8f0`, font-family `'Inter', sans-serif`
- `h1, h2, h3, h4` — font-family `'Sora', sans-serif`
- Custom scrollbar (webkit) — dark track, `#334155` thumb
- `@keyframes slide-up` animation + `.animate-slide-up` utility class
- `.delay-100` through `.delay-400` animation delay classes

### Step 3.3 — Create `frontend/src/hooks/useApi.js`
Axios instance with:
- `baseURL: ''` (uses Vite proxy)
- `timeout: 10000`
- Request interceptor: adds `X-Client-Request-ID: crypto.randomUUID().slice(0,8)` header
- Response interceptor: on network error (no `response`), retries up to 2 times with `1000ms * retryCount` delay

### Step 3.4 — Create `frontend/src/store/useStore.js`
Zustand store with state: `jobs[]`, `filledRoles[]`, `kpis: null`, `loading: {jobs, filled, kpis}`, `error: null`

Actions (all async):
- `fetchKPIs()` — GET /api/dashboard
- `fetchJobs()` — GET /api/jobs
- `fetchFilled()` — GET /api/filled
- `addJob(data)` — POST /api/jobs, appends to jobs, re-fetches KPIs
- `updateJobStatus(jobId, status)` — PATCH /api/jobs/{jobId}/status, updates jobs array locally
- `fetchAll()` — `Promise.all([fetchKPIs(), fetchJobs(), fetchFilled()])`

### Step 3.5 — Create `frontend/src/App.jsx`
React Router setup with `<BrowserRouter>`:
- `<Toaster>` from react-hot-toast, dark style (`background: '#1e293b'`)
- Routes: `/` → Dashboard, `/jobs` → OutstandingJobs, `/filled` → FilledRoles, `/add-job` → AddJob
- All wrapped in `<Layout>`

### Step 3.6 — Create `frontend/src/main.jsx`
Standard React 18 entry: `ReactDOM.createRoot(getElementById('root')).render(<App/>)`

### Step 3.7 — Create `frontend/src/components/Layout.jsx`
Dark sidebar layout with:
- Sidebar width: `w-60` (open) / `w-16` (collapsed) with toggle button
- Logo: indigo square icon + "Plutus21" / "Hiring Hub" text
- Nav links using `<NavLink>` for: Dashboard (`/`), Open Roles (`/jobs`), Filled Roles (`/filled`), Post a Job (`/add-job`)
- Active link style: `bg-indigo-600/20 text-indigo-400 border border-indigo-600/30`
- Icons from `lucide-react`: LayoutDashboard, Briefcase, UserCheck, PlusCircle, Menu, X, Zap

### Step 3.8 — Create `frontend/src/components/KPICard.jsx`
Props: `title`, `value` (number or string), `subtitle`, `icon`, `color` (hex, default `#6366f1`), `suffix`, `delay`

Features:
- `useCountUp(target, duration=1200)` hook — animates number from 0 to target over 1.2s using `setInterval`
- Gradient border using `border: 1px solid ${color}30`
- Radial glow using absolutely positioned blurred div
- Top-right icon in colored circle
- `animate-slide-up` class with `animationDelay: ${delay}ms` inline style

### Step 3.9 — Create `frontend/src/pages/Dashboard.jsx`
Layout: top header, 6-card KPI grid, 2-column chart row, departure type breakdown

KPI cards (6):
1. Total Roles — `kpis.total_roles` — Briefcase — indigo
2. Active Open — `kpis.active_open` — Clock — amber
3. Filled — `kpis.total_filled` — CheckCircle — emerald
4. Fill Rate — `kpis.fill_rate` — TrendingUp — purple — suffix `%`
5. Shortlisted — `kpis.shortlisted` — Users — cyan
6. Interviews Done — `kpis.interviews_done` — Target — pink

Charts:
- `BarChart` (Recharts) — `kpis.by_team` data — two bars per team: "open" (indigo) and "filled" (emerald)
- `PieChart` (Recharts) — `[{name:'Open', value: active_open}, {name:'Filled', value: total_filled}]` — innerRadius 60, outerRadius 90, paddingAngle 4
- Custom `<Tooltip>` with dark background `#1e293b`

Loading state: pulsing skeleton divs.

On mount: `useEffect(() => { fetchAll() }, [])`

### Step 3.10 — Create `frontend/src/pages/OutstandingJobs.jsx`
Features:
- Search input (filters by role_title and job_id)
- Team dropdown filter
- Departure type dropdown filter
- Table with columns: Job ID, Role Title, Team, Location, Type, Pipeline (shortlisted/done/pending), Status (editable `<select>`), JD link
- Status `<select>` calls `updateJobStatus` on change and shows toast
- Inline `statusStyles` map: `Sourcing→amber`, `Filled→emerald`, `default→slate`
- Refresh button with spinning icon while `loading.jobs`
- Row hover state: `hover:bg-slate-800/30`

### Step 3.11 — Create `frontend/src/pages/FilledRoles.jsx`
Features:
- Card-based list (not table)
- Each card shows: icon, role title, team + location, hired name, start date, hire status badge
- Status badge color map: `Started→emerald`, `Offer Accepted→indigo`
- Skeleton loading (4 placeholder divs while loading)
- Empty state message

### Step 3.12 — Create `frontend/src/pages/AddJob.jsx`
Form fields:
- Role Title (required, text input)
- Team (required, `<select>` with all 9 teams from seed data)
- Location (optional, text input)
- Departure Type (pill button group: Backfill / Attrition / Termination / New Headcount)
- Backfill Reason (optional, text input)
- JD Link (optional, text input)

Behavior:
- On submit: validates required fields, calls `addJob(form)`, shows success toast, redirects to `/jobs` after 1.8s
- Post-submit success state: full-screen checkmark animation
- Loading state: disabled button + "Creating..." text

---

### ⚑ PHASE 3 TEST GATE

Write test files in `frontend/src/test/` before running.

Run: `cd frontend && npm run test`

**Required passing tests:**

**`src/test/KPICard.test.jsx`** (4 tests):
- `renders title and subtitle` — KPICard with title="Test" subtitle="sub" renders both strings
- `renders numeric value` — value=42 renders "42" in DOM
- `renders suffix` — value=33.3 suffix="%" renders "%" in DOM (may show 0% initially due to counter)
- `applies custom color class` — color="#10b981" applied in some inline style

**`src/test/Layout.test.jsx`** (3 tests):
- `renders nav links` — Dashboard, Open Roles, Filled Roles, Post a Job all visible
- `toggle button collapses sidebar` — click toggle → sidebar shrinks (check class or aria)
- `active link highlighted` — navlink for current route has indigo class

**`src/test/AddJob.test.jsx`** (4 tests):
- `renders all form fields` — Role Title, Team select, Location, JD Link inputs present
- `submit with empty title shows error toast` — fire submit without filling role_title
- `departure type pills render` — Backfill, Attrition, Termination, New Headcount all visible
- `selecting a departure type highlights it` — click Attrition → it gets active styling

**`src/test/store.test.js`** (4 tests — mock axios):
- `initial state is correct` — jobs=[], filledRoles=[], kpis=null
- `fetchJobs populates jobs array` — mock GET returns [{job_id:"JOB-001"}], state.jobs has length 1
- `addJob appends to jobs` — mock POST returns new job, jobs array grows by 1
- `updateJobStatus changes status locally` — jobs array updated without re-fetch

**Acceptance:** `15 passed` in output. Zero failures.

After passing → `git add -A && git commit -m "phase-3: frontend complete, 15 tests green"`

---

## ════════════════════════════════════════════
## PHASE 4 — INTEGRATION & END-TO-END WIRING
## ════════════════════════════════════════════

### Objective
Wire frontend to backend, verify full data flow, create startup scripts, confirm app runs end-to-end.

### Step 4.1 — Create `scripts/start.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

echo "▶ Starting backend..."
cd backend
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"
cd ..

echo "▶ Waiting for backend to be ready..."
for i in {1..15}; do
  curl -sf http://localhost:8000/health > /dev/null && break
  sleep 1
done
curl -sf http://localhost:8000/health || { echo "Backend did not start"; kill $BACKEND_PID; exit 1; }
echo "  Backend ready."

echo "▶ Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
echo "  Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "════════════════════════════════════════"
echo "  App is live!"
echo "  Frontend:  http://localhost:5173"
echo "  API Docs:  http://localhost:8000/docs"
echo "  Health:    http://localhost:8000/health"
echo "════════════════════════════════════════"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT SIGINT SIGTERM
wait
```

Run `chmod +x scripts/start.sh`

### Step 4.2 — Verify CORS Headers
Start backend: `cd backend && uvicorn main:app --port 8000 &`
```bash
curl -s -X OPTIONS http://localhost:8000/api/jobs \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -I | grep -i access-control
```
Must see `access-control-allow-origin: http://localhost:5173`.

### Step 4.3 — Verify Seed Data via API
```bash
# Check outstanding roles
curl -s http://localhost:8000/api/jobs | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Outstanding: {len(d[\"data\"])} (expect 10)')"

# Check filled roles
curl -s http://localhost:8000/api/filled | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Filled: {len(d[\"data\"])} (expect 5)')"

# Check dashboard KPIs
curl -s http://localhost:8000/api/dashboard | python3 -c "import sys,json; d=json.load(sys.stdin)['data']; print(f'Total: {d[\"total_roles\"]}, Fill Rate: {d[\"fill_rate\"]}%')"
```

Expected output:
```
Outstanding: 10 (expect 10)
Filled: 5 (expect 5)
Total: 15, Fill Rate: 33.3%
```

### Step 4.4 — Verify Job Creation Flow
```bash
curl -s -X POST http://localhost:8000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"role_title":"Integration Test Role","team":"Team D","departure_type":"Backfill"}' \
  | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['data']['job_id'], r['success'])"
```
Expected: `JOB-016 True`

### Step 4.5 — Kill background backend process
```bash
kill $(lsof -ti:8000) 2>/dev/null || true
```

### Step 4.6 — Verify Frontend Build Compiles
```bash
cd frontend && npm run build 2>&1 | tail -5
```
Must not contain `ERROR` or `error`. Should show `dist/` output.

---

### ⚑ PHASE 4 TEST GATE

This phase uses integration verification scripts, not pytest or vitest.

Run each check. All must produce the expected output.

**Check 4.A — Backend health:**
```bash
cd backend && uvicorn main:app --port 8001 --log-level error &
sleep 3
RESULT=$(curl -s http://localhost:8001/health | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")
kill $(lsof -ti:8001) 2>/dev/null
[ "$RESULT" = "ok" ] && echo "CHECK_4A_PASS" || echo "CHECK_4A_FAIL: got $RESULT"
```

**Check 4.B — Outstanding roles count:**
```bash
cd backend && uvicorn main:app --port 8002 --log-level error &
sleep 3
RESULT=$(curl -s http://localhost:8002/api/jobs | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))")
kill $(lsof -ti:8002) 2>/dev/null
[ "$RESULT" = "10" ] && echo "CHECK_4B_PASS" || echo "CHECK_4B_FAIL: got $RESULT"
```

**Check 4.C — Dashboard fill_rate is 33.3:**
```bash
cd backend && uvicorn main:app --port 8003 --log-level error &
sleep 3
RESULT=$(curl -s http://localhost:8003/api/dashboard | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['fill_rate'])")
kill $(lsof -ti:8003) 2>/dev/null
[ "$RESULT" = "33.3" ] && echo "CHECK_4C_PASS" || echo "CHECK_4C_FAIL: got $RESULT"
```

**Check 4.D — Frontend build succeeds:**
```bash
cd frontend && npm run build > /tmp/build_out.txt 2>&1
grep -i "error" /tmp/build_out.txt && echo "CHECK_4D_FAIL" || echo "CHECK_4D_PASS"
```

**Acceptance:** All four print `CHECK_4*_PASS`.

After passing → `git add -A && git commit -m "phase-4: integration verified, all checks green"`

---

## ════════════════════════════════════════════
## PHASE 5 — FINAL HARDENING & DEFINITION OF DONE
## ════════════════════════════════════════════

### Objective
Final polish, error boundary handling, security headers, and confirmation that the full Definition of Done is met.

### Step 5.1 — Add Error Boundary to Frontend
Create `frontend/src/components/ErrorBoundary.jsx`:
```jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
          <p className="text-lg font-semibold text-white mb-2">Something went wrong</p>
          <p className="text-sm">{this.state.error?.message}</p>
          <button onClick={() => this.setState({hasError:false})} className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm">
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

Wrap `<Layout>` in `App.jsx` with `<ErrorBoundary>`.

### Step 5.2 — Add Security Headers to Backend
In `backend/main.py`, add middleware after CORS:
```python
@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response
```

### Step 5.3 — Add Not Found Handler to Backend
```python
from fastapi import HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"success": False, "data": None, "error": "Not found", "request_id": getattr(request.state, 'request_id', 'n/a')})
```

### Step 5.4 — Add Empty State to All Pages
- OutstandingJobs: "No matching roles found" centered message with muted text
- FilledRoles: "No filled roles yet" message
- Dashboard: Loading skeleton while `loading.kpis && !kpis`

### Step 5.5 — Verify `favicon.svg`
Create `frontend/public/favicon.svg` — a simple indigo square SVG (16x16).

### Step 5.6 — Create Final README
File: `README.md` (at project root) — include:
- Quick start (2 commands)
- Tech stack table
- API endpoint table
- How to run tests
- How the agent was built (reference to CLAUDE.md and PLAN.md)

---

### ⚑ PHASE 5 TEST GATE — FULL REGRESSION

Run the complete test suites one final time to confirm nothing regressed:

```bash
# Backend full suite
echo "=== BACKEND TESTS ===" && cd backend && pytest tests/ -v && cd ..

# Frontend full suite
echo "=== FRONTEND TESTS ===" && cd frontend && npm run test && cd ..
```

**Acceptance criteria:**
- Backend: `20 passed, 0 failed, 0 errors`
- Frontend: `15 passed, 0 failed, 0 errors`

If ANY test fails → fix immediately → re-run the relevant suite → do not commit until clean.

**Final integration smoke test:**
```bash
bash scripts/start.sh &
sleep 6
HEALTH=$(curl -s http://localhost:8000/health | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")
JOBS=$(curl -s http://localhost:8000/api/jobs | python3 -c "import sys,json; print(len(json.load(sys.stdin)['data']))")
kill %1 2>/dev/null
echo "Health: $HEALTH (expect ok)"
echo "Jobs: $JOBS (expect 10)"
[ "$HEALTH" = "ok" ] && [ "$JOBS" = "10" ] && echo "SMOKE_TEST_PASS" || echo "SMOKE_TEST_FAIL"
```

**After all checks pass:**
```bash
git add -A && git commit -m "phase-5: integration complete, all tests green"
```

Then print the final success banner:
```
╔══════════════════════════════════════════════════════════╗
║  🎉 ALL PHASES COMPLETE — DEFINITION OF DONE MET        ║
║                                                          ║
║  Backend:   http://localhost:8000                        ║
║  Frontend:  http://localhost:5173                        ║
║  API Docs:  http://localhost:8000/docs                   ║
║  Tests:     20 backend + 15 frontend = 35 total PASSED  ║
║                                                          ║
║  Run: bash scripts/start.sh                              ║
╚══════════════════════════════════════════════════════════╝
```
