# Video Engine

AI-powered video generation service for creating educational content automatically.

## Prerequisites

- Python 3.11+
- Poetry (Python package manager)
- FFmpeg (system dependency)

### Installing FFmpeg

| Platform | Command |
|----------|---------|
| macOS | `brew install ffmpeg` |
| Windows | `winget install ffmpeg` |
| Ubuntu/Debian | `sudo apt install ffmpeg` |

## Getting Started

### 1. Configure API Keys

Create a `.env` file in the `video-engine` directory:

```env
GOOGLE_API_KEY=your_google_ai_studio_key
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### 2. Install & Initialize

Run the following commands to set up the environment:

```bash
# Install Python dependencies
poetry install

# Initialize models and generate assets
poetry run init
```

### 3. Start the Application

Launch the Video Engine Wizard:

```bash
poetry run python app/main.py
```

The UI opens automatically at **http://localhost:8001**.

## How to Use

### Video Generation Workflow

1. **Open the Wizard** - Launch the app and access the web UI
2. **Configure Settings** - Set your preferences for voice, style, and output
3. **Input Content** - Provide the topic or script for your video
4. **Generate** - The engine processes: Script → Audio → Subtitles → Video
5. **Download** - Get your generated video from the outputs folder

### Utility Commands

| Command | Description |
|---------|-------------|
| `poetry run init` | Initialize environment and pre-load models |
| `poetry run gen-assets` | Regenerate brand assets (logos, gradients) |
| `poetry run list-models` | List available AI voices and models |

## Project Structure

```
video-engine/
├── app/
│   ├── main.py           # Application entry point
│   ├── ui_components.py  # UI logic and state
│   ├── workflow.py       # Video generation pipeline
│   ├── services/         # AI integrations (LLM, TTS, STT)
│   └── scripts/          # Utility scripts
├── data/                 # Job history and configs
├── outputs/              # Generated video files
└── settings.json         # User preferences (auto-generated)
```

## Troubleshooting

### FFmpeg Not Found

Ensure FFmpeg is installed and available in your PATH:

```bash
ffmpeg -version
```

### API Key Issues

Verify your API keys are correctly set in the `.env` file. You can test them with:

```bash
poetry run list-models
```

### Dependency Issues

If you encounter dependency problems, try:

```bash
poetry install --no-cache
```

## Docker

Run using the convenience script from the project root:

```bash
./start-video-engine.sh
```

Or manually with Docker Compose:

```bash
docker compose up video-engine
```
