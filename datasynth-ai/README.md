# Datasynth AI (V2)

High-compliance data ingestion, annotation, and export platform for regulated industries.

## Tech Stack
- Frontend: Next.js 14, Tailwind CSS, Zustand (simple state when needed)
- Backend: Node.js (Express + TypeScript), Prisma ORM, PostgreSQL, AWS SDK (S3), Multer
- Auth: JWT + bcrypt

## Features (V2)
- User auth with roles: Admin, Annotator, Viewer
- Multi-organization, projects, datasets
- Upload to Local or S3
- Text and image annotation primitives, AI-assisted suggestions (mock)
- PII detection & masking (regex-based), PDF certificate generation
- Export datasets as JSON/CSV
- REST API with RBAC

## Monorepo Layout
- `backend/` Express API + Prisma
- `frontend/` Next.js app

## Quickstart (Docker Compose)

1. Copy envs
```bash
cp backend/.env.example backend/.env
```

2. Start services
```bash
docker compose up --build -d
```

3. Apply DB migrations and seed
```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend node -e "require('dotenv').config(); require('child_process').spawnSync('node', ['-e', 'console.log(1)'])"
docker compose exec backend npm run seed
```

4. Open apps
- API: `http://localhost:4000/health`
- Frontend: `http://localhost:3000`

Seed admin: `admin@seed.local` / `admin123`

## Local Dev (without Docker)
- Start Postgres locally and set `DATABASE_URL` in `backend/.env`
- Backend:
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```
- Frontend:
```bash
cd frontend
npm install
npm run dev
```

## REST API (high-level)
- `POST /auth/signup`, `POST /auth/login`
- `GET /projects`, `POST /projects`
- `POST /datasets` (multipart form-data `file`, `name`, `type`, `projectId`)
- `GET /datasets`, `PATCH /datasets/:id/status`
- `POST /annotations`, `GET /annotations/dataset/:datasetId`, `POST /annotations/assist`
- `POST /compliance/run`, `GET /compliance/dataset/:datasetId`
- `GET /export/dataset/:datasetId.json|.csv`
- `GET /admin/users`, `PATCH /admin/users/:id/role`

## Notes
- S3 is optional; default storage is local under `backend/storage/`
- Replace mock AI suggestions with real models later via `src/services/aiAssist.ts`
- Add spaCy or other NLP in a future iteration for stronger PII detection