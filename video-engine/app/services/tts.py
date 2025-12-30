import os
import json
from elevenlabs import generate, save, set_api_key
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

class ElevenLabsService:
    def __init__(self):
        # Load dynamic settings and secrets
        self.base_dir = Path(__file__).resolve().parent.parent.parent
        self.secrets_path = self.base_dir / "data" / "secrets.json"
        
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        self.backup_key = os.getenv("ELEVENLABS_API_KEY_BACKUP")
        
        if self.secrets_path.exists():
            try:
                with open(self.secrets_path, "r") as f:
                    secrets = json.load(f)
                    self.api_key = secrets.get("elevenlabs_api_key", self.api_key)
                    self.backup_key = secrets.get("elevenlabs_api_key_backup", self.backup_key)
            except:
                pass

        if not self.api_key:
            raise ValueError("ELEVENLABS_API_KEY not found in environment or secrets.json")
        set_api_key(self.api_key)
        
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

    def text_to_speech(self, text: str, output_path: Path, voice_id: str = None, model_id: str = None):
        try:
            # Use provided params or fallback to instance defaults
            use_voice = voice_id if voice_id else self.voice_id
            use_model = model_id if model_id else self.model_id
            audio = generate(
                text=text,
                voice=use_voice,
                model=use_model
            )
            # Ensure parent dir exists
            output_path.parent.mkdir(parents=True, exist_ok=True)
            save(audio, str(output_path))
            print(f"DEBUG: Saved audio to {output_path.absolute()}")
            return output_path
        except Exception as e:
            import sys
            # Check for RateLimitError (namespaced or string check if import is tricky)
            error_str = str(e)
            sys.stderr.write(f"DEBUG: Caught exception: {type(e)}\n")
            sys.stderr.write(f"DEBUG: Error string: {error_str}\n")
            sys.stderr.flush()
            
            if "quota" in error_str.lower() or "rate limit" in error_str.lower():
                 if self.backup_key:
                     print("   ⚠️ Primary API Key quota exceeded. Switching to BACKUP key...")
                     set_api_key(self.backup_key)
                     audio = generate(
                        text=text,
                        voice=self.voice_id,
                        model=self.model_id
                     )
                     save(audio, str(output_path))
                     return output_path
            raise e
