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
| GET | `/api/positions` | List positions with filters |
| POST | `/api/positions` | Create a position |
| PUT | `/api/positions/{id}` | Update a position |
| DELETE | `/api/positions/{id}` | Delete a position |
| GET | `/api/jobs` | List jobs with pagination and search |
| POST | `/api/jobs` | Create a job |
| PUT | `/api/jobs/{id}` | Update a job |
| GET | `/api/dashboard/stats` | Fetch dashboard KPIs |
| GET | `/api/dashboard/funnel` | Fetch funnel data |
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
- Add `FRONTEND_URL=https://<your-frontend>.vercel.app`
- Or set `ALLOWED_ORIGINS=https://<your-frontend>.vercel.app`

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
4. Open the frontend URL and verify dashboard, edit, add-position, and import flows.

## Notes

- Seed data is inserted only when the tables are empty.
- Local development still uses `backend/recruitment_dashboard.db` automatically if `DATABASE_URL` is not set.
- Vercel deployment should use Postgres because SQLite is not reliable on Vercel serverless infrastructure.
