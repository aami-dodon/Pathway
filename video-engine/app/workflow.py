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
        
        # 1. Content Generation
        print("   📝 Generating content with Gemini...")
        blog = self.llm.generate_blog(input_text)
        script = self.llm.generate_video_script(input_text)
        
        blog_path = self.outputs_dir / "blog.txt"
        blog_path.write_text(blog)
        print(f"      ✅ Blog generated: {blog_path.name}")
        
        # 2. Speech Generation
        print("   🎤 Generating speech with ElevenLabs...")
        audio_path = self.outputs_dir / "voice.mp3"
        self.tts.text_to_speech(script, audio_path)
        print(f"      ✅ Audio generated: {audio_path.name}")
        
        # 3. Subtitle Generation
        print("   ✍️ Generating subtitles with Whisper...")
        words = self.stt.transcribe(audio_path)
        ass_path = self.outputs_dir / "captions.ass"
        # Since the audio is delayed by 3s in the final video, 
        # we need to offset the subtitle timestamps by 3s.
        for w in words:
            w['start'] += 3.0
            w['end'] += 3.0
        self.stt.generate_ass(words, ass_path)
        print(f"      ✅ Subtitles generated: {ass_path.name}")
        
        # 4. Download YouTube Video
        print(f"   📥 Downloading video from {yt_url}...")
        source_path, res = self.downloader.download(yt_url, self.outputs_dir)
        print(f"      ✅ Video downloaded: {source_path.name} (Resolution: {res})")
        
        # 5. Video Processing
        print("   🎬 Processing video...")
        audio_duration = self.processor.get_duration(audio_path)
        total_duration = audio_duration + 6.0 # 3s intro + 3s outro
        
        processed_source = self.outputs_dir / "processed_source.mp4"
        self.processor.process_source_video(source_path, processed_source, total_duration)
        
        muxed_path = self.outputs_dir / "muxed.mp4"
        self.processor.merge_audio_video(processed_source, audio_path, muxed_path, audio_delay=3.0)
        print(f"      ✅ Video processed and merged with audio")
        
        # 6. Apply VFX (Overlays, Logos, etc.)
        print("   🎨 Applying VFX overlays...")
        template_path = self.base_dir / "templates" / f"{template_name}.yaml"
        with open(template_path, "r") as f:
            template = yaml.safe_load(f)
            
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
