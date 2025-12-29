# Video Engine

Standalone Python project for video processing.

## Requirements

- Python 3.10+
- Poetry
- FFmpeg (System dependency)

### Installing FFmpeg
- **macOS (Homebrew):**
  ```bash
  brew install ffmpeg
  ```
- **Windows (Winget):**
  ```bash
  winget install ffmpeg
  ```

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

### Render
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
- Behavior:
  1. Downloads video from URL.
  2. Crops to 9:16 vertical aspect ratio (1080x1920).
  3. Limits duration to 30 seconds.
- Response:
  ```json
  {
    "status": "processed",
    "input": "outputs/input.mp4",
    "output": "outputs/output.mp4"
  }
  ```

## Project Structure

- `app/`: FastAPI application code.
  - `api/`: API route handlers.
    - `health.py`: Health check endpoint.
    - `render.py`: Render endpoint (download + crop).
  - `pipeline/`: Video processing logic (placeholder).
- `outputs/`: Directory for generated video files.
  - `input.mp4`: Raw downloaded video.
  - `output.mp4`: Processed vertical video.
- `pyproject.toml`: Poetry project configuration.
