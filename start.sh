#!/usr/bin/env bash
# NeuroAid – Start backend + frontend in parallel

echo "╔══════════════════════════════════════╗"
echo "║   NeuroAid AI — Starting Services    ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Backend  → http://localhost:8000"
echo "Frontend → http://localhost:5173"
echo "API Docs → http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both."
echo ""

# Start backend
(
  cd backend
  source .venv/bin/activate 2>/dev/null || true
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
) &
BACKEND_PID=$!

# Give backend a moment
sleep 2

# Start frontend
(
  cd frontend
  npm run dev
) &
FRONTEND_PID=$!

# Wait and clean up on Ctrl+C
trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT
wait
