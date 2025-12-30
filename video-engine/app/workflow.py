import os
import json
import yaml
from pathlib import Path
from dotenv import load_dotenv
from app.services.llm import GeminiService
from app.services.tts import ElevenLabsService
from app.services.stt import WhisperService
from app.services.downloader import YTDownloader
from app.services.video_processor_moviepy import VideoProcessor

load_dotenv()

class VideoWorkflow:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.outputs_dir = base_dir / "outputs"
        self.outputs_dir.mkdir(exist_ok=True)
        
        self.llm = GeminiService()
        self.tts = ElevenLabsService()
        self.stt = WhisperService()
        self.downloader = YTDownloader(cookies_path=base_dir / "cookies.txt")
        self.processor = VideoProcessor()

    def run(self, input_text: str, yt_url: str, template_name: str = "default"):
        print(f"🚀 Starting workflow for: {input_text}")
        
        # Load template early to get settings
        template_path = self.base_dir / "templates" / f"{template_name}.yaml"
        with open(template_path, "r") as f:
            template = yaml.safe_load(f)

        # 1. Content Generation
        speech_script_path = self.outputs_dir / "speech_script.txt"
        
        if speech_script_path.exists():
             print("   ⚠️ Speech script found, skipping Gemini generation...")
             # We only strictly need the speech script for the video, 
             # but loading others is good practice if used elsewhere.
             content = {
                 "speech": speech_script_path.read_text(),
                 "blog": "", # placeholders if not needed downstream
                 "excerpt": ""
             }
        else:
            print("   📝 Generating content with Gemini...")
            content = self.llm.generate_content(input_text)
            
            # Save all three outputs
            blog_path = self.outputs_dir / "blog.txt"
            blog_path.write_text(content["blog"])
            
            excerpt_path = self.outputs_dir / "excerpt.txt"
            excerpt_path.write_text(content["excerpt"])
            
            speech_script_path.write_text(content["speech"])
            print(f"      ✅ Content generated.")
        
        # 2. Speech Generation
        audio_path = self.outputs_dir / "voice.mp3"
        if audio_path.exists() and audio_path.stat().st_size > 1000:
             print("   ⚠️ Audio found, skipping ElevenLabs generation...")
        else:
            print("   🎤 Generating speech with ElevenLabs...")
            self.tts.text_to_speech(content["speech"], audio_path)
            print(f"      ✅ Audio generated: {audio_path.name}")
        
        # 3. Subtitle Generation (Whisper)
        print("   ✍️ Transcribing audio with Whisper...")
        words_json = self.outputs_dir / "words.json"
        
        if words_json.exists():
            print("      ⚠️ Word data found, skipping transcription...")
            with open(words_json, 'r') as f:
                words = json.load(f)
        else:
            words = self.stt.transcribe(audio_path)
            with open(words_json, 'w') as f:
                json.dump(words, f)
            print(f"      ✅ Audio transcribed and saved to {words_json.name}")
        
        # 4. Download YouTube Video
        print(f"   📥 Downloading video from {yt_url}...")
        source_video_path, res = self.downloader.download(yt_url, self.outputs_dir)
        print(f"      ✅ Video downloaded: {source_video_path.name} (Resolution: {res})")
        
        # --- 5. Final Rendering (MoviePy Only - Optimized) ---
        print(f"\n   [Step 5/6] Optimized Single-Pass Rendering (MoviePy)")
        final_video = self.outputs_dir / "final_video.mp4"
        assets_dir = self.base_dir / "assets"
        
        self.processor.generate_final_video(
            source_video_path=source_video_path,
            voice_path=audio_path,
            output_path=final_video,
            words=words,
            template=template,
            base_dir=self.base_dir,
            bg_music_path=assets_dir / template['music']['file']
        )
        print(f"      ✅ Final video generated: {final_video.name}")
        
        return final_video

if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent
    workflow = VideoWorkflow(BASE_DIR)
    
    input_text = "Benefits of AI in coding"
    yt_url = "https://youtu.be/iUtnZpzkbG8"
    
    workflow.run(input_text, yt_url)
