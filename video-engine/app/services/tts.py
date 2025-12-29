import os
import json
from elevenlabs import generate, save, set_api_key
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

class ElevenLabsService:
    def __init__(self):
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise ValueError("ELEVENLABS_API_KEY not found in environment")
        set_api_key(api_key)
        
        # Load dynamic settings
        base_dir = Path(__file__).resolve().parent.parent.parent
        settings_path = base_dir / "data" / "settings.json"
        
        # Defaults
        self.voice_id = "21m00Tcm4TlvDq8ikWAM" # Rachel
        self.model_id = "eleven_multilingual_v2"
        
        if settings_path.exists():
            try:
                with open(settings_path, "r") as f:
                    settings = json.load(f)
                    self.voice_id = settings.get("tts_voice_id", self.voice_id)
                    self.model_id = settings.get("tts_model", self.model_id)
            except:
                pass

    def text_to_speech(self, text: str, output_path: Path):
        audio = generate(
            text=text,
            voice=self.voice_id,
            model=self.model_id
        )
        save(audio, str(output_path))
        return output_path
