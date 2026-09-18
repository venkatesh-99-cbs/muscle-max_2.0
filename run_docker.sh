#!/bin/bash
# Local development — starts all 3 services (PostgreSQL, Ollama, and the app) in the background
# For Linux/macOS with Docker installed

set -e

echo "🚀 Starting all services with Docker Compose..."
docker compose up --build --pull always

echo ""
echo "📌 Services running:"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  Database: localhost:5432"
echo "  Ollama:   http://localhost:11434"
echo ""
echo "Press Ctrl+C to stop."
