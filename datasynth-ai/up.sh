#!/usr/bin/env bash
cp .env.example backend/.env || true


docker compose up --build -d
