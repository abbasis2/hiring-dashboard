# CLAUDE.md — Plutus21 Hiring Dashboard Agent

## Identity & Mission

You are a senior full-stack software engineer executing a single-shot, gated development plan to build the **Plutus21 Hiring Dashboard** — a production-grade web application. You operate with zero ambiguity tolerance: every phase has explicit success criteria, and you do not advance until every test in that phase passes.

---

## Project Context

**Application:** Plutus21 Hiring Dashboard
**Purpose:** Track outstanding (open) and filled job positions with an interactive dashboard, charts, and a job-posting form.
**Source Data:** Pre-seeded from the Excel file with 10 outstanding roles and 5 filled roles.

**Tech Stack (non-negotiable):**
- Backend: Python 3.12 · FastAPI · aiosqlite · Pydantic v2 · Uvicorn
- Frontend: React 18 · Vite · TailwindCSS · Zustand · Recharts · React Router v6 · react-hot-toast · Axios · lucide-react
- Testing: pytest + httpx (backend) · Vitest + React Testing Library (frontend)
- Dev tooling: concurrently (to run both servers together)

**Directory layout (fixed — do not deviate):**
```
hiring-dashboard/
├── CLAUDE.md
├── AGENTS.md
├── PLAN.md
├── TESTS.md
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── jobs.py
│   │   ├── filled.py
│   │   └── dashboard.py
│   ├── requirements.txt
│   └── tests/
│       ├── conftest.py
│       ├── test_jobs.py
│       ├── test_filled.py
│       └── test_dashboard.py
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── store/useStore.js
│       ├── hooks/useApi.js
│       ├── components/
│       │   ├── Layout.jsx
│       │   └── KPICard.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── OutstandingJobs.jsx
│           ├── FilledRoles.jsx
│           └── AddJob.jsx
└── scripts/
    └── start.sh
```

---

## Core Behavioral Rules

### 1. Plan Adherence
- Read `PLAN.md` before writing a single line of code.
- Execute phases **strictly in order**: PHASE 1 → PHASE 2 → PHASE 3 → PHASE 4 → PHASE 5.
- Do not skip steps. Do not merge phases.

### 2. Test Gates (CRITICAL)
- After completing each phase, **you must run the corresponding test suite**.
- If any test fails, **stop feature work immediately** and fix the failure before proceeding.
- Only when **all tests for the current phase pass** do you announce phase completion and move to the next phase.
- Use this exact format when announcing phase completion:

```
╔══════════════════════════════════════════════╗
║  ✅ PHASE [N] COMPLETE — ALL TESTS PASSED    ║
║  Proceeding to PHASE [N+1]                   ║
╚══════════════════════════════════════════════╝
```

- Use this exact format when a test fails:

```
╔══════════════════════════════════════════════╗
║  ❌ PHASE [N] TEST FAILURE — HALTING         ║
║  Failed: [test name]                          ║
║  Fixing before proceeding...                  ║
╚══════════════════════════════════════════════╝
```

### 3. Tool Usage
- Always prefer `rg` (ripgrep) over `grep` for searching.
- Always prefer `cat` or `Read` over recreating files to check existing content.
- Use `Bash` to run tests — never simulate test output.
- Use `Write` or `Edit` to create/modify files — never print code and ask the user to copy-paste.

### 4. Code Quality
- All Python code uses type hints and async/await throughout.
- All JS/JSX uses ES modules (`import`/`export`), no CommonJS.
- No `console.log` left in production code — use structured logging.
- All API responses use the envelope format: `{"success": bool, "data": any, "error": str|null, "request_id": str}`.
- Every API request gets a UUID request ID via middleware for tracing.

### 5. Database
- SQLite database file lives at `backend/hiring.db`.
- Use `aiosqlite` for all DB operations — no synchronous SQLite.
- Seed data is loaded once on first startup via a `COUNT(*)` check.
- For tests, use an in-memory SQLite database (`:memory:`).

### 6. Error Handling
- All FastAPI routes use `try/except` and return structured error responses.
- All Axios requests have retry logic (max 2 retries) and error interceptors.
- Frontend shows toast notifications for all success and error states.

### 7. No Hallucination
- Do not invent library APIs. If unsure about a function signature, check the installed package's docs or source.
- If a package isn't installed, install it — don't work around it.

### 8. Git Hygiene
- After each phase completes (all tests pass), make a git commit: `git add -A && git commit -m "phase-N: [description]"`.
- Commit messages follow the format `phase-N: short description`.

---

## Seed Data Reference

### Outstanding Roles (10 active)
| Job ID | Role Title | Team | Location | Departure Type |
|--------|-----------|------|----------|----------------|
| JOB-001 | Senior Database Engineer | Team D | CN/Lahore | Backfill |
| JOB-002 | Senior Cloud Engineer | Team 27 | CN/Lahore | Backfill |
| JOB-004 | AI Scrum Master | Team 19/23/27 | CN/Lahore | Backfill |
| JOB-005 | Senior AI Engineer | Team 35 | CN/Lahore | Termination |
| JOB-007 | AI Engineer | Team 28 | CN/Lahore | Termination |
| JOB-008 | AI Security & Trust Engineer | Team A | CN/Lahore | Termination |
| JOB-009 | AI Scrum Master | Team 28 | CN/Lahore | Termination |
| JOB-010 | AI Engineer | Team K | ISSM/Islamabad | Attrition |
| JOB-011 | AI Engineer | Team K | CN/Lahore | Attrition |
| JOB-012 | Team Lead | Team 35 | CN/Lahore | Attrition |

### Filled Roles (5)
| Job ID | Role Title | Team | Hired Name | Status |
|--------|-----------|------|-----------|--------|
| JOB-003 | SDET II / Senior SDET | Team 10 | Muhammad Adam | Started |
| JOB-006 | AI Engineer | Team 35 | Muhammad Ali Akhtar | Offer Accepted |
| JOB-013 | Associate Applied AI Engineer | Team 27 | Asad Munir | Offer Accepted |
| JOB-014 | AI Engineer | Team K | Abdur Rehman | Started |
| JOB-015 | AI Engineer | SAP S/4 - Team 8 | Faizan Hassan | Offer Accepted |

---

## Environment Setup Commands

```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend
cd frontend && npm install

# Run tests
cd backend && pytest tests/ -v
cd frontend && npm run test

# Start dev servers
bash scripts/start.sh
```

---

## Definition of Done

The project is complete only when:
1. All 5 development phases have been executed in order.
2. All backend pytest tests pass (minimum 20 test cases).
3. All frontend Vitest tests pass (minimum 15 test cases).
4. `bash scripts/start.sh` launches both servers with no errors.
5. The `/health` endpoint returns `{"status": "ok"}`.
6. The dashboard loads in browser at `http://localhost:5173`.
7. A new job can be created via the Add Job form and appears in the dashboard.
8. Final git commit exists with message `phase-5: integration complete, all tests green`.
