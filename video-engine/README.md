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

### Render Stub
- `POST /render`
- Request Body:
  ```json
  {
    "source": {
      "type": "url",
      "value": "https://example.com/video.mp4"
    },
    "text": "Sample hook text",
    "template": "default"
  }
  ```
- Response:
  ```json
  {
    "status": "accepted",
    "output_path": "outputs/placeholder.txt"
  }
  ```

## Project Structure

- `app/`: FastAPI application code.
  - `api/`: API route handlers.
    - `health.py`: Health check endpoint.
    - `render.py`: Render stub endpoint.
  - `pipeline/`: Video processing logic (placeholder).
- `outputs/`: Directory for generated video files.
- `pyproject.toml`: Poetry project configuration.
