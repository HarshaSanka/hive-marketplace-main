#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-8001}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

cd "$ROOT_DIR"

if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  "$PYTHON_BIN" -m venv venv
  ./venv/bin/pip install -r requirements.txt
fi

if [ ! -f ".env" ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

mkdir -p data uploads

if lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Stopping existing process on port $PORT..."
  lsof -tiTCP:"$PORT" -sTCP:LISTEN | xargs kill
  sleep 1
fi

echo "Running database migrations..."
./venv/bin/alembic upgrade head

echo "Starting backend on http://127.0.0.1:$PORT ..."
exec ./venv/bin/uvicorn app.main:app --reload --port "$PORT"
