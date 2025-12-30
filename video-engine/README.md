# Video Engine
Standalone Python project for automated video generation using AI.

## Requirements
- Python 3.11+
- Poetry
- FFmpeg (System dependency)

### Installing FFmpeg
- **macOS (Homebrew):** `brew install ffmpeg`
- **Windows (Winget):** `winget install ffmpeg`

## Quick Start (New Developers)

1. **API Keys:** Create a `.env` file in the root with your keys:
   ```env
   GOOGLE_API_KEY=your_google_ai_studio_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   ```

2. **Install & Initialize:**
   One command to install dependencies, pre-load models, and generate assets:
   ```bash
   poetry install
   poetry run init
   ```

3. **Start the App:**
   Run the following command to launch the Video Engine Wizard:
   ```bash
   poetry run python app/main.py
   ```
   The UI will open automatically at **http://localhost:8001**.

## Utility Commands

- **Regenerate Brand Assets:**
  Updates logos, gradients, and animations from `packages/brand`:
  ```bash
  poetry run gen-assets
  ```

- **Explore AI Models:**
  Lists available ElevenLabs voices and Gemini models compatible with your tier:
  ```bash
  poetry run list-models
  ```

## Project Structure
- `app/`:
  - `main.py`: NiceGUI application entry point
  - `ui_components.py`: UI logic and state management
  - `workflow.py`: Video generation pipeline (Audio -> Subtitles -> Rendering)
  - `services/`: Integrations (LLM, TTS, STT, Downloader)
  - `scripts/`: Utility scripts (init, assets, models)
- `data/`: Local storage for job history and configs
- `outputs/`: Generated media files
- `settings.json`: User preferences (Auto-generated)
