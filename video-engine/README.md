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
poetry run python app/scripts/generate_vfx.py
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
5. Merge everything with a **4s intro and 4s outro buffer**.
6. Apply branding (Logo, Gradient, Animations).

### 3. Video Rendering (Local)
Re-render the final video using existing assets in `outputs/`. Two options available:

#### MoviePy Renderer (Single-Pass)
Best for quick iteration with all effects applied in one render:
```bash
poetry run python run_moviepy.py
```
- **Output:** `outputs/final_moviepy.mp4`
- **Pros:** All-in-one render, Python-native text rendering
- **Cons:** Slower for complex compositions

#### FFmpeg Renderer (Pipeline)
Best for maximum quality and control via multi-stage FFmpeg processing:
```bash
poetry run python run_ffmpeg.py
```
- **Output:** `outputs/final_ffmpeg.mp4`
- **Pros:** Faster encoding, better compression, native ASS subtitles
- **Cons:** Multi-step pipeline with intermediate files

### 4. Utility Scripts
List available and tier-compatible models and voices:
```bash
poetry run python app/scripts/list_models.py
```
Outputs are saved as JSON files in the `data/` directory.

## Project Structure
- `app/`:
  - `services/`:
    - `video_processor_moviepy.py`: MoviePy-based video processor
    - `video_processor_ffmpeg.py`: FFmpeg-based video processor
    - `llm.py`, `tts.py`, `stt.py`, `downloader.py`: Service integrations
  - `scripts/`: Utility scripts (e.g., `list_models.py`, `generate_vfx.py`)
  - `workflow.py`: Main orchestration script
- `run_moviepy.py`: MoviePy video renderer (local)
- `run_ffmpeg.py`: FFmpeg video renderer (local)
- `data/`: JSON references for models and voices
- `assets/`: 
  - `animations/`: Generated intro/outro webm files
  - `fonts/`: Typography assets
  - `logo/`: Branded logos
  - `overlays/`: Gradient overlays
- `templates/`: YAML configuration templates for styling
- `outputs/`: Final videos and intermediate artifacts
