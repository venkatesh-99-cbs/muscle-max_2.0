@echo off
REM Local development — starts all services with Docker Compose
REM For Windows with Docker Desktop installed

echo 🚀 Starting all services with Docker Compose...
docker compose up --build --pull always

echo.
echo 📌 Services running:
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:5173
echo   Database: localhost:5432
echo   Ollama:   http://localhost:11434
echo.
echo Press Ctrl+C to stop.

pause
