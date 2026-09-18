FROM python:3.12-slim

WORKDIR /app

# Use production requirements (without heavy ML dependencies like torch)
COPY requirements-prod.txt ./
RUN pip install --no-cache-dir -r requirements-prod.txt

COPY . .

EXPOSE 8000

# Default command for Docker — runs Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
