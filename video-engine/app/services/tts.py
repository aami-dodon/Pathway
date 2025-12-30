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
        try:
            audio = generate(
                text=text,
                voice=self.voice_id,
                model=self.model_id
            )
            save(audio, str(output_path))
            return output_path
        except Exception as e:
            import sys
            # Check for RateLimitError (namespaced or string check if import is tricky)
            error_str = str(e)
            sys.stderr.write(f"DEBUG: Caught exception: {type(e)}\n")
            sys.stderr.write(f"DEBUG: Error string: {error_str}\n")
            sys.stderr.flush()
            
            if "quota" in error_str.lower() or "rate limit" in error_str.lower():
                 backup_key = os.getenv("ELEVENLABS_API_KEY_BACKUP")
                 print(f"DEBUG: Backup key found? {'Yes' if backup_key else 'No'}")
                 
                 if backup_key:
                     print("   ⚠️ Primary API Key quota exceeded. Switching to BACKUP key...")
                     set_api_key(backup_key)
                     audio = generate(
                        text=text,
                        voice=self.voice_id,
                        model=self.model_id
                     )
                     save(audio, str(output_path))
                     return output_path
            raise e
