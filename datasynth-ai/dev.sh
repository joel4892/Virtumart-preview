#!/usr/bin/env bash
set -e
cd backend
cp .env.example .env || true
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/datasynth npx prisma migrate dev --name init || true
npm run dev
EOF
chmod +x dev.sh && sed -n "1,120p" dev.sh | cat
