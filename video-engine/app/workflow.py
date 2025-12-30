import os
import json
import yaml
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from app.services.llm import GeminiService
from app.services.tts import ElevenLabsService
from app.services.stt import WhisperService
from app.services.downloader import YTDownloader
from app.services.video_processor_ffmpeg import VideoProcessorFFmpeg
from app.utils.theme_parser import get_theme_color

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
        self.processor = VideoProcessorFFmpeg()
        
        # Determine theme color once
        theme_css_path = base_dir.parent / "packages" / "brand" / "theme.css"
        self.theme_color = get_theme_color(theme_css_path)
        print(f"🎨 Theme Color: {self.theme_color}")

    def run(self, input_text: str, yt_url: Optional[str] = None, template_name: str = "default", content: Optional[dict] = None):
        print(f"🚀 Starting workflow for: {input_text}")
        
        # Load template early to get settings
        template_path = self.base_dir / "templates" / f"{template_name}.yaml"
        with open(template_path, "r") as f:
            template = yaml.safe_load(f)

        # 1. Content Generation
        if content:
            print("   📄 Using provided content (skipped Gemini generation)")
        else:
            speech_script_path = self.outputs_dir / "speech_script.txt"
            if speech_script_path.exists():
                 print("   ⚠️ Speech script found, skipping Gemini generation...")
                 content = {
                     "speech": speech_script_path.read_text(),
                     "blog": "",
                     "excerpt": ""
                 }
            else:
                print("   📝 Generating content with Gemini...")
                content = self.llm.generate_content(input_text)
                
                # Save all three outputs
                (self.outputs_dir / "blog.txt").write_text(content["blog"])
                (self.outputs_dir / "excerpt.txt").write_text(content["excerpt"])
                (self.outputs_dir / "speech_script.txt").write_text(content["speech"])
                print(f"      ✅ Content generated.")
        
        # 2. Speech Generation
        # Check content for specific audio file (standardized: voice_file)
        audio_filename = "voice.mp3"
        if content and content.get("voice_file"):
            audio_path = self.outputs_dir / content["voice_file"]
        else:
            audio_path = self.outputs_dir / audio_filename

        if audio_path.exists() and audio_path.stat().st_size > 1000:
             print(f"   ⚠️ Audio found ({audio_path.name}), skipping ElevenLabs generation...")
        else:
            print(f"   🎤 Generating speech with ElevenLabs to {audio_path.name}...")
            script = content.get("speech", "") if content else ""
            if script:
                 self.tts.text_to_speech(script, audio_path)
                 print(f"      ✅ Audio generated: {audio_path.name}")
            else:
                 raise ValueError("No speech script available for audio generation")
        
        # 3. Subtitle Generation (Whisper)
        print("   ✍️ Transcribing audio with Whisper...")
        # Standardized: subtitle_file should be unique per slug
        subtitle_filename = content.get("subtitle_file") if content else None
        if subtitle_filename:
            words_json = self.outputs_dir / subtitle_filename
        else:
            words_json = self.outputs_dir / f"{audio_path.stem}_words.json"
        
        if words_json.exists():
            print(f"      ⚠️ Word data found ({words_json.name}), skipping transcription...")
            with open(words_json, 'r') as f:
                words = json.load(f)
        else:
            words = self.stt.transcribe(audio_path)
            with open(words_json, 'w') as f:
                json.dump(words, f)
            print(f"      ✅ Audio transcribed and saved to {words_json.name}")
        
        # 4. Source Video Acquisition
        source_video_path = None
        if yt_url:
            print(f"   📥 Downloading video from {yt_url}...")
            source_video_path, res = self.downloader.download(yt_url, self.outputs_dir)
            print(f"      ✅ Video downloaded: {source_video_path.name} (Resolution: {res})")
        else:
            existing_videos = list(self.outputs_dir.glob("*.mp4"))
            source_candidates = [v for v in existing_videos if "final" not in v.name and "overlay" not in v.name]
            
            if source_candidates:
                source_video_path = source_candidates[0]
                print(f"      📂 Using existing source video: {source_video_path.name}")
            else:
                print("      ⚠️ No specific source video found, assuming FFmpeg processor handles this")
                source_video_path = self.outputs_dir / "source_1080p.mp4" # Placeholder default
        
        # --- 5. Final Rendering (FFmpeg Pipeline) ---
        print(f"\n   [Step 5/6] Rendering Video with FFmpeg pipeline")
        
        # Determine final video path (standardized: output_video)
        if content and content.get("output_video"):
            final_video = self.outputs_dir / content["output_video"]
        else:
            final_video = self.outputs_dir / "final_video.mp4"

        assets_dir = self.base_dir / "assets"
        
        self.processor.generate_final_video(
            source_video_path=source_video_path,
            voice_path=audio_path,
            output_path=final_video,
            words=words,
            template=template,
            base_dir=self.base_dir,
            bg_music_path=assets_dir / template['music']['file'],
            theme_color=self.theme_color
        )
        print(f"      ✅ Final video generated: {final_video.name}")
        
        return {
            "video": final_video,
            "subtitles": words_json,
            "source": source_video_path
        }

if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent
    workflow = VideoWorkflow(BASE_DIR)
    
    input_text = "Benefits of AI in coding"
    yt_url = "https://youtu.be/iUtnZpzkbG8"
    
    workflow.run(input_text, yt_url)
