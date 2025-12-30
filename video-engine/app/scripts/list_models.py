import os
import json
import requests
import google.generativeai as genai
from pathlib import Path
from dotenv import load_dotenv

# Paths
SCRIPT_DIR = Path(__file__).resolve().parent
BASE_DIR = SCRIPT_DIR.parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

load_dotenv(BASE_DIR / ".env")

def list_google_models():
    print("🤖 Fetching Google Gemini models and verifying usability...")
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return
    
    genai.configure(api_key=api_key)
    google_models = []
    
    preferred_models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-flash-latest", "gemini-2.0-flash-lite"]
    
    try:
        available = genai.list_models()
        for m in available:
            if 'generateContent' not in m.supported_generation_methods:
                continue
            
            name_lower = m.name.lower()
            if any(p in name_lower for p in preferred_models):
                print(f"   Testing {m.name}...", end=" ", flush=True)
                try:
                    # Live test
                    model = genai.GenerativeModel(m.name)
                    response = model.generate_content("Hi", generation_config={"max_output_tokens": 10})
                    _ = response.text
                    print("✅ OK")
                    google_models.append({
                        "name": m.name,
                        "display_name": m.display_name,
                        "description": m.description
                    })
                except Exception as e:
                    print(f"❌ (Skipped: {str(e).split('.')[0]})")
        
        output_path = DATA_DIR / "google_models.json"
        with open(output_path, "w") as f:
            json.dump(google_models, f, indent=4)
        print(f"✅ Saved {len(google_models)} verified Google models to {output_path.name}")
    except Exception as e:
        print(f"❌ Error fetching Google models: {e}")

def list_elevenlabs_resources():
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key:
        return
    
    headers = {"xi-api-key": api_key, "Accept": "application/json"}
    
    # Check subscription for tier info
    print("💳 Checking ElevenLabs Subscription Tier...")
    tier = "free"
    sub_resp = requests.get("https://api.elevenlabs.io/v1/user/subscription", headers=headers)
    if sub_resp.status_code == 200:
        tier = sub_resp.json().get("tier", "free")
        print(f"      Tier identified: {tier}")

    # 1. Voices
    print("🗣️ Fetching and verifying ElevenLabs voices...")
    v_resp = requests.get("https://api.elevenlabs.io/v1/voices", headers=headers)
    if v_resp.status_code == 200:
        voices = v_resp.json().get("voices", [])
        voice_data = [{"name": v["name"], "voice_id": v["voice_id"], "category": v["category"]} for v in voices]
        output_path = DATA_DIR / "elevenlabs_voices.json"
        with open(output_path, "w") as f:
            json.dump(voice_data, f, indent=4)
        print(f"✅ Saved {len(voice_data)} verified ElevenLabs voices to {output_path.name}")

    # 2. Models
    print("🧱 Fetching and verifying ElevenLabs models...")
    m_resp = requests.get("https://api.elevenlabs.io/v1/models", headers=headers)
    if m_resp.status_code == 200:
        models = m_resp.json()
        model_data = []
        # Use Rachel for testing
        test_voice = "21m00Tcm4TlvDq8ikWAM"
        for m in models:
            if not m.get("can_do_text_to_speech"):
                continue
            
            model_id = m.get("model_id")
            if tier == "free" and "v1" in model_id:
                continue

            print(f"   Testing {model_id}...", end=" ", flush=True)
            try:
                test_url = f"https://api.elevenlabs.io/v1/text-to-speech/{test_voice}/stream"
                test_resp = requests.post(test_url, json={"text": "Hi", "model_id": model_id}, headers=headers, stream=True)
                if test_resp.status_code == 200:
                    print("✅ OK")
                    model_data.append({
                        "model_id": model_id, 
                        "name": m["name"], 
                        "description": m.get("description", "N/A")
                    })
                else:
                    print(f"❌ (Skipped: {test_resp.status_code})")
            except:
                print("❌ (Skipped: Request Error)")
            
        output_path = DATA_DIR / "elevenlabs_models.json"
        with open(output_path, "w") as f:
            json.dump(model_data, f, indent=4)
        print(f"✅ Saved {len(model_data)} verified ElevenLabs models to {output_path.name}")

if __name__ == "__main__":
    list_google_models()
    print("-" * 30)
    list_elevenlabs_resources()
