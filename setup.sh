#!/usr/bin/env bash
# NeuroAid – One-shot local setup script
set -e

echo "╔══════════════════════════════════════╗"
echo "║   NeuroAid AI — Local Setup          ║"
echo "╚══════════════════════════════════════╝"

# 1. Backend deps
echo ""
echo "→ Installing backend Python deps..."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -q -r requirements.txt
deactivate
cd ..

# 2. Frontend deps
echo ""
echo "→ Installing frontend npm deps..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Now run:  ./start.sh"
