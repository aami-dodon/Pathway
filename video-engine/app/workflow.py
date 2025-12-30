import os
import yaml
from pathlib import Path
from dotenv import load_dotenv
from app.services.llm import GeminiService
from app.services.tts import ElevenLabsService
from app.services.stt import WhisperService
from app.services.downloader import YTDownloader
from app.services.video_processor import VideoProcessor

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
        
        # 3. Subtitle Generation
        print("   ✍️ Generating subtitles with Whisper...")
        ass_path = self.outputs_dir / "captions.ass"
        
        if ass_path.exists():
             print("   ⚠️ Subtitles found, skipping Whisper generation...")
        else:
            words = self.stt.transcribe(audio_path)
            
            # Extract font settings from template
            font_config = template.get('text', {}).get('typography', {})
            font_name = font_config.get('font', 'Inter-Bold').split('/')[-1].replace('.ttf', '')
            font_size = font_config.get('size', 110)
            
            # Use the new time_offset parameter (4.0s) to sync with audio delay
            self.stt.generate_ass(words, ass_path, font_name=font_name, font_size=font_size, time_offset=4.0)
            print(f"      ✅ Subtitles generated: {ass_path.name}")
        
        # 4. Download YouTube Video
        print(f"   📥 Downloading video from {yt_url}...")
        source_path, res = self.downloader.download(yt_url, self.outputs_dir)
        print(f"      ✅ Video downloaded: {source_path.name} (Resolution: {res})")
        
        # 5. Video Processing
        print("   🎬 Processing video...")
        audio_duration = self.processor.get_duration(audio_path)
        total_duration = audio_duration + 8.0 # 4s intro + 4s outro
        
        processed_source = self.outputs_dir / "processed_source.mp4"
        self.processor.process_source_video(source_path, processed_source, total_duration)
        
        # Load template to get music file
        template_path = self.base_dir / "templates" / f"{template_name}.yaml"
        with open(template_path, "r") as f:
            template = yaml.safe_load(f)
            
        bg_music_path = self.base_dir / "assets" / template['music']['file']
        
        muxed_path = self.outputs_dir / "muxed.mp4"
        self.processor.merge_audio_video(processed_source, audio_path, muxed_path, audio_delay=4.0, bg_music_path=bg_music_path)
        print(f"      ✅ Video processed and merged with audio")
        
        # 6. Apply VFX (Overlays, Logos, etc.)
        print("   🎨 Applying VFX overlays...")
        # Template already loaded above
            
        final_path = self.outputs_dir / "final_video.mp4"
        self.processor.apply_vfx(muxed_path, final_path, ass_path, template, self.base_dir)
        print(f"      ✅ VFX applied. Final video: {final_path.name}")
        
        return final_path

if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent
    workflow = VideoWorkflow(BASE_DIR)
    
    input_text = "Benefits of AI in coding"
    yt_url = "https://youtu.be/iUtnZpzkbG8"
    
    workflow.run(input_text, yt_url)
