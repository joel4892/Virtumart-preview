#!/usr/bin/env bash
set -e
cp backend/.env.example backend/.env || true
docker compose up --build -d
