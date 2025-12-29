# Video Engine

Standalone Python project for video processing.

## Requirements

- Python 3.10+
- Poetry

## Setup and Running

1. Install dependencies:
   ```bash
   poetry install
   ```

2. Run the FastAPI server:
   ```bash
   poetry run uvicorn app.main:app --host 127.0.0.1 --port 8001
   ```

## API Endpoints

- `GET /health`: Returns `{ "status": "ok" }`.

## Project Structure

- `app/`: FastAPI application code.
  - `api/`: API route handlers.
  - `pipeline/`: Video processing logic (placeholder).
- `outputs/`: Directory for generated video files.
- `pyproject.toml`: Poetry project configuration.
