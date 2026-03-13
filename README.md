# Recruitment Dashboard

A full-stack hiring dashboard with FastAPI, React, Tailwind CSS, TanStack Query, and Excel import support. Local development uses SQLite. Vercel deployment uses a hosted Postgres database.

## Quick Start

1. Install backend dependencies: `cd backend && python -m pip install -r requirements.txt`
2. Install frontend dependencies: `cd frontend && npm install`
3. Run the backend: `cd backend && python -m uvicorn app:app --reload --port 8000`
4. Run the frontend: `cd frontend && npm run dev`

Or start both together with `bash scripts/start.sh` after both toolchains are installed.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | Zustand, TanStack Query |
| Forms | React Hook Form, Zod |
| Charts | Recharts |
| Backend | FastAPI, SQLAlchemy, Alembic |
| Database | SQLite (local), Postgres (Vercel) |
| Excel Parsing | openpyxl |
| Testing | pytest, httpx, Vitest, Testing Library |
| Containers | Docker, Docker Compose |

## API Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/auth/signup` | Create user account |
| POST | `/api/auth/verify-email` | Verify email using code |
| POST | `/api/auth/login` | Authenticate and get bearer token |
| GET | `/api/auth/me` | Current authenticated user |
| GET | `/api/users` | List users (super admin only) |
| PATCH | `/api/users/{id}/access` | Revoke/restore access (super admin only) |
| DELETE | `/api/users/{id}` | Delete user (super admin only) |
| GET | `/api/positions` | List positions with filters |
| POST | `/api/positions` | Create a position |
| PUT | `/api/positions/{id}` | Update a position |
| DELETE | `/api/positions/{id}` | Delete a position |
| GET | `/api/filled-roles` | List filled roles |
| PUT | `/api/filled-roles/{id}` | Update a filled role |
| DELETE | `/api/filled-roles/{id}` | Delete a filled role |
| GET | `/api/jobs` | List jobs with pagination and search |
| POST | `/api/jobs` | Create a job |
| PUT | `/api/jobs/{id}` | Update a job |
| GET | `/api/dashboard/stats` | Fetch dashboard KPIs |
| POST | `/api/upload-excel` | Import positions from Excel |

## Tests

- Backend: `cd backend && pytest -v`
- Frontend: `cd frontend && npm run test`
- Frontend lint: `cd frontend && npm run lint`
- Frontend typecheck/build: `cd frontend && npm run build`

## Environment Variables

Backend:

- `DATABASE_URL`: optional for local development, required for Vercel. Use a hosted Postgres URL.
- `FRONTEND_URL`: optional single frontend origin to allow through CORS.
- `ALLOWED_ORIGINS`: optional comma-separated CORS allowlist. Overrides `FRONTEND_URL`.
- `ALLOWED_ORIGIN_REGEX`: optional regex CORS allow rule (for Vercel previews, for example `https://.*\\.vercel\\.app`).
- `AUTH_SECRET_KEY`: required for production. Long random secret for token signing.
- `AUTH_TOKEN_TTL_MINUTES`: optional token expiry minutes.
- `SUPER_ADMIN_EMAIL`: required for production. Bootstrapped super admin email.
- `SUPER_ADMIN_PASSWORD`: required for production. Bootstrapped super admin password.
- `AUTH_RETURN_VERIFICATION_CODE`: temporary no-SMTP mode. If `true`, signup returns verification code in API response.

Frontend:

- `VITE_API_BASE_URL`: optional for local development, required on Vercel. Set this to your deployed backend URL.

See:

- `backend/.env.example`
- `frontend/.env.example`

## Vercel Deployment

Deploy this repo as two Vercel projects:

1. Backend project
2. Frontend project

Backend project settings:

- Import the same Git repository into Vercel.
- Set the Root Directory to `backend`.
- Add `DATABASE_URL` from your hosted Postgres database.
- Add `AUTH_SECRET_KEY` (strong random value).
- Add `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`.
- Add `FRONTEND_URL=https://<your-frontend>.vercel.app` and optionally:
  - `ALLOWED_ORIGIN_REGEX=https://.*\\.vercel\\.app` (for preview links)
- If no email provider is configured yet, set `AUTH_RETURN_VERIFICATION_CODE=true` so signup/verify works.

Backend entrypoint:

- Vercel will detect `backend/app.py`, which exposes the FastAPI app for deployment.

Frontend project settings:

- Import the same Git repository into Vercel.
- Set the Root Directory to `frontend`.
- Add `VITE_API_BASE_URL=https://<your-backend>.vercel.app`

Recommended database options:

- Vercel Postgres
- Neon
- Supabase Postgres

Deploy order:

1. Create the Postgres database.
2. Deploy the backend and confirm `https://<backend>.vercel.app/api/health` works.
3. Deploy the frontend with `VITE_API_BASE_URL` pointed at the backend URL.
4. Login using the configured super admin account.
5. Verify dashboard, edit, add-position, import, and user-access-management flows.

## Notes

- Seed data is inserted only when the tables are empty.
- For local development, a default super admin is auto-created:
  - `admin@local.test` / `Admin@12345`
- Local development still uses `backend/recruitment_dashboard.db` automatically if `DATABASE_URL` is not set.
- Vercel deployment should use Postgres because SQLite is not reliable on Vercel serverless infrastructure.
