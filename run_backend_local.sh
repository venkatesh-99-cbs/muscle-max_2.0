#!/bin/bash
# Local development — runs backend Django server WITHOUT Docker
# Prerequisites: Python 3.12+, PostgreSQL running on localhost:5432, Ollama on localhost:11434

set -e

cd backend

echo "🔧 Installing dependencies..."
pip install -r requirements.txt

echo "🗄️  Running migrations..."
python manage.py migrate

echo "✅ Starting Django server on http://localhost:8000"
python manage.py runserver 0.0.0.0:8000
