import os
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

    def text_to_speech(self, text: str, output_path: Path):
        audio = generate(
            text=text,
            voice="21m00Tcm4TlvDq8ikWAM", # Rachel voice ID
            model="eleven_multilingual_v2"
        )
        save(audio, str(output_path))
        return output_path
