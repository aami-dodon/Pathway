import os
import json
import yaml
import subprocess
import sys
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).resolve().parent
BASE_DIR = SCRIPT_DIR.parent.parent
DATA_DIR = BASE_DIR / "data"
TEMPLATES_DIR = BASE_DIR / "templates"

def run_asset_generation():
    print("🎨 Step 1: Generating Branding Assets...")
    generator_path = SCRIPT_DIR / "generate_vfx.py"
    subprocess.run([sys.executable, str(generator_path)], check=True)

def run_model_discovery():
    print("🔍 Step 2: Discovering Available Models and Voices...")
    lister_path = SCRIPT_DIR / "list_models.py"
    subprocess.run([sys.executable, str(lister_path)], check=True)

def setup_defaults():
    print("⚙️ Step 3: Setting Up Default Configurations...")
    
    # 1. Load discovered data
    google_models_path = DATA_DIR / "google_models.json"
    eleven_models_path = DATA_DIR / "elevenlabs_models.json"
    eleven_voices_path = DATA_DIR / "elevenlabs_voices.json"
    
    if not all([google_models_path.exists(), eleven_models_path.exists(), eleven_voices_path.exists()]):
        print("❌ Error: Missing discovered data files.")
        return

    google_models = json.load(open(google_models_path))
    eleven_models = json.load(open(eleven_models_path))
    eleven_voices = json.load(open(eleven_voices_path))

    # 2. Select Defaults
    # LLM: Preferred gemini-flash-latest or the first available
    llm_model = "models/gemini-flash-latest" 
    if not any(m['name'] == llm_model for m in google_models) and google_models:
        llm_model = google_models[0]['name']

    # TTS Model: Preferred multilingual v2 or the first available
    tts_model = "eleven_multilingual_v2"
    if not any(m['model_id'] == tts_model for m in eleven_models) and eleven_models:
        tts_model = eleven_models[0]['model_id']

    # THE CALM VOICE: Sarah is mature/reassuring. Brian is comforting.
    # Searching for "Sarah" or "Brian" or "River"
    preferred_voices = ["Sarah", "River", "Brian", "George"]
    selected_voice = eleven_voices[0] if eleven_voices else None
    
    for pref in preferred_voices:
        match = next((v for v in eleven_voices if pref in v['name']), None)
        if match:
            selected_voice = match
            break
    
    if not selected_voice:
        print("⚠️ No suitable voice found, using first available.")
        selected_voice = eleven_voices[0] if eleven_voices else {"name": "Default", "voice_id": "21m00Tcm4TlvDq8ikWAM"}

    print(f"      Selected LLM: {llm_model}")
    print(f"      Selected TTS Model: {tts_model}")
    print(f"      Selected Voice: {selected_voice['name']} ({selected_voice['voice_id']})")

    # 3. Save to data/settings.json
    settings = {
        "llm_model": llm_model,
        "tts_model": tts_model,
        "tts_voice_id": selected_voice['voice_id'],
        "tts_voice_name": selected_voice['name']
    }
    
    settings_path = DATA_DIR / "settings.json"
    with open(settings_path, "w") as f:
        json.dump(settings, f, indent=4)
    print(f"      ✅ Settings saved to {settings_path.relative_to(BASE_DIR)}")

    # 4. Update default.yaml
    template_path = TEMPLATES_DIR / "default.yaml"
    if template_path.exists():
        with open(template_path, "r") as f:
            template = yaml.safe_load(f) or {}
            
        # Add a 'defaults' section for the workflow to read if desired
        template['ai_defaults'] = settings
        
        with open(template_path, "w") as f:
            yaml.dump(template, f, default_flow_style=False)
        print(f"      ✅ Template {template_path.name} updated with AI defaults")

def main():
    print("🚀 Initializing Video Engine...")
    try:
        run_asset_generation()
        print("-" * 30)
        run_model_discovery()
        print("-" * 30)
        setup_defaults()
        print("-" * 30)
        print("✨ Video Engine is ready!")
    except Exception as e:
        print(f"💥 Critical Error during initialization: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
