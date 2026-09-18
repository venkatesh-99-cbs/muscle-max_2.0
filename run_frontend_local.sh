#!/bin/bash
# Local development — runs frontend React/Vite WITHOUT Docker
# Prerequisites: Node 20+

cd frontend

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "✅ Starting Vite dev server on http://localhost:5173"
npm run dev
