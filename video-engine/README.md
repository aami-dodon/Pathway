# Video Engine
Standalone Python project for automated video generation using AI.

## Requirements
- Python 3.11+
- Poetry
- FFmpeg (System dependency)

### Installing FFmpeg
- **macOS (Homebrew):** `brew install ffmpeg`
- **Windows (Winget):** `winget install ffmpeg`

## Setup
1. **API Keys:** Create a `.env` file in the root with your keys:
   ```env
   GOOGLE_API_KEY=your_google_ai_studio_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   ```
2. **Install dependencies:**
   ```bash
   poetry install
   poetry run pip install openai-whisper
   ```

## Usage

### 1. Asset Generation
Generate brand-specific logos, gradients, and animations based on `packages/brand`:
```bash
poetry run python app/generate_vfx.py
```

### 2. Automated Workflow
Generate a complete video from a text topic and a YouTube source:
```bash
poetry run python app/workflow.py
```
This script will:
1. Generate a blog post and a 60s video script using **Google Gemini**.
2. Convert the script to high-quality audio using **ElevenLabs**.
3. Generate word-synced subtitles using **Whisper (STT)**.
4. Download the source video from YouTube and crop it to **9:16**.
5. Merge everything with a **3s intro and 3s outro buffer**.
6. Apply branding (Logo, Gradient, Animations).

## Project Structure
- `app/`:
  - `services/`: Core logic for LLM, TTS, STT, Downloading, and Processing.
  - `generate_vfx.py`: Branding asset generator.
  - `workflow.py`: Main orchestration script.
- `assets/`: 
  - `animations/`: Generated intro/outro webm files.
  - `fonts/`: Typography assets.
  - `logo/`: Branded logos.
  - `overlays/`: Gradient overlays.
- `templates/`: YAML configuration templates for styling.
- `outputs/`: Final videos and intermediate artifacts.
