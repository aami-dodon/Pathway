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

### Health Check
- `GET /health`
- Response: `{ "status": "ok" }`

### Render (Download Only)
- `POST /render`
- Request Body:
  ```json
  {
    "source": {
      "type": "url",
      "value": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  }
  ```
- Response:
  ```json
  {
    "status": "downloaded",
    "local_path": "outputs/input.mp4"
  }
  ```
- This endpoint currently only downloads the video from the provided URL to `outputs/input.mp4`. No processing is performed.

## Project Structure

- `app/`: FastAPI application code.
  - `api/`: API route handlers.
    - `health.py`: Health check endpoint.
    - `render.py`: Render endpoint (currently download-only).
  - `pipeline/`: Video processing logic (placeholder).
- `outputs/`: Directory for generated video files.
- `pyproject.toml`: Poetry project configuration.
