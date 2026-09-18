@echo off
REM Local development — runs frontend React/Vite WITHOUT Docker
REM Prerequisites: Node 20+

cd frontend

echo 📦 Installing dependencies...
call npm install --legacy-peer-deps

echo ✅ Starting Vite dev server on http://localhost:5173
call npm run dev

pause
