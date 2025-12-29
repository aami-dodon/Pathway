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
    },
    "text": "This is a sample hook text for the video overlay"
  }
  ```
- Behavior:
  1. **Download:** Downloads video from URL (supports YouTube).
  2. **Crop:** Crops/Scales to 9:16 vertical aspect ratio (1080x1920) and limits to 30s.
  3. **Overlay:** Adds Instagram-style text overlay (white, centered, bottom) if `text` is provided.
- Response:
  ```json
  {
    "status": "completed",
    "final_video": "outputs/final.mp4"
  }
  ```

## Project Structure
- `app/`: FastAPI application code.
  - `api/`
    - `health.py`: Health check.
    - `render.py`: Main rendering logic.
- `assets/fonts/`: Contains `Roboto-Bold.ttf`.
- `outputs/`:
  - `input.mp4`: Raw download.
  - `output.mp4`: Cropped intermediate.
  - `final.mp4`: Final with text.
- `cookies.txt`: Optional YouTube cookies for `yt-dlp`.
