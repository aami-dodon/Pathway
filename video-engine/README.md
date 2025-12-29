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

## Render Pipeline
1. **Download:** `yt-dlp` fetches video.
2. **Crop:** FFmpeg crops/scales to 1080x1920 (9:16).
3. **Text Overlay:** ASS Subtitles generated from `template` + `text`, applied using `ass` filter. (Rendered below logo).
4. **Logo Overlay:** Static PNG overlay applied on top.

## text Processing
- Text is split into lines based on `max_words_per_line` defined in the template.
- Max lines are enforced via `max_lines`.
- Styling (Font, Size, Outline, Shadow, Position) is driven by `templates/default.yaml`.

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
    "text": "Hook text for the video",
    "template": "default"
  }
  ```
- Response:
  ```json
  {
    "status": "completed",
    "final_video": "outputs/final.mp4"
  }
  ```

## Project Structure
- `app/`: FastAPI code.
- `assets/`: 
  - `fonts/`: Fonts (e.g. `Roboto-Bold.ttf`).
  - `logo/`: Logo images.
- `templates/`: YAML configuration templates.
- `outputs/`: Artifacts.
