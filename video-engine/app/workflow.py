import os
import json
import yaml
import logging
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

# Setup module logger
logger = logging.getLogger(__name__)

class VideoWorkflow:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.outputs_dir = base_dir / "data" / "outputs"
        self.outputs_dir.mkdir(parents=True, exist_ok=True)
        
        self.llm = GeminiService()
        self.tts = ElevenLabsService()
        self.stt = WhisperService()
        self.downloader = YTDownloader(cookies_path=base_dir / "cookies.txt")
        self.processor = VideoProcessorFFmpeg()
        
        # Determine theme color once
        theme_css_path = base_dir.parent / "packages" / "brand" / "theme.css"
        self.theme_color = get_theme_color(theme_css_path)
        print(f"🎨 Theme Color: {self.theme_color}")

    def download_video(self, yt_url: str, filename_prefix: str = "source"):
        """Standalone method to download source video."""
        print(f"   📥 Downloading video from {yt_url}...")
        source_video_path, res = self.downloader.download(yt_url, self.outputs_dir, filename_prefix=filename_prefix)
        print(f"      ✅ Video downloaded: {source_video_path.name} (Resolution: {res})")
        return source_video_path, res

    def step_audio_gen(self, content: dict, audio_path: Path):
        """Step 2: Generate speech audio."""
        try:
            if audio_path.exists() and audio_path.stat().st_size > 1000:
                logger.info(f"Audio found ({audio_path.name}), skipping ElevenLabs.")
                return audio_path
                 
            logger.info(f"Generating speech with ElevenLabs to {audio_path.name}...")
            script = content.get("speech", "")
            if script:
                self.tts.text_to_speech(script, audio_path)
                logger.info(f"Audio generated successfully.")
                return audio_path
            else:
                raise ValueError("No speech script available for audio generation")
        except Exception as e:
            logger.error(f"Audio generation failed: {e}", exc_info=True)
            raise RuntimeError(f"Audio Stage Failed: {e}") from e

    def step_transcribe(self, audio_path: Path, subtitle_path: Path):
        """Step 3: Transcribe audio with Whisper."""
        try:
            if subtitle_path.exists():
                logger.info(f"Word data found ({subtitle_path.name}), skipping Whisper.")
                with open(subtitle_path, 'r') as f:
                    return json.load(f)
            
            logger.info("Transcribing audio with Whisper...")
            words = self.stt.transcribe(audio_path)
            with open(subtitle_path, 'w') as f:
                json.dump(words, f)
            logger.info(f"Transcription saved to {subtitle_path.name}")
            return words
        except Exception as e:
            logger.error(f"Transcription failed: {e}", exc_info=True)
            raise RuntimeError(f"Transcription Stage Failed: {e}") from e

    def step_video_download(self, yt_url: str, slug: str):
        """Step 4: Mandatory source download."""
        try:
            source_filename = f"{slug}_source.mp4"
            source_video_path = self.outputs_dir / source_filename
            
            if source_video_path.exists():
                logger.info(f"Using existing source video: {source_video_path.name}")
                return source_video_path
                
            logger.info(f"Downloading video from {yt_url}...")
            path, res = self.downloader.download(yt_url, self.outputs_dir, filename_prefix=slug+"_source")
            logger.info(f"Video downloaded: {path.name} (Resolution: {res})")
            return path
        except Exception as e:
            logger.error(f"Video download failed: {e}", exc_info=True)
            raise RuntimeError(f"Download Stage Failed: {e}") from e

    def step_video_crop(self, source_path: Path, audio_path: Path, output_path: Path, progress_callback=None):
        """Step 5: Crop/Loop source to match audio duration."""
        try:
            if output_path.exists():
                logger.info(f"Processed video already exists: {output_path.name}")
                return output_path
                
            logger.info("Processing source video (Crop/Loop)...")
            voice_duration = VideoProcessorFFmpeg.get_duration(audio_path)
            target_duration = voice_duration + 8.0 # 4s intro + 4s outro
            
            VideoProcessorFFmpeg.process_source_video(
                source_path, output_path, target_duration,
                progress_callback=progress_callback, base_progress=0, weight=100
            )
            logger.info(f"Video cropped successfully to {output_path.name}")
            return output_path
        except Exception as e:
            logger.error(f"Video crop failed: {e}", exc_info=True)
            raise RuntimeError(f"Crop Stage Failed: {e}") from e

    def step_music_merge(self, video_path: Path, audio_path: Path, output_path: Path, bg_music_path: Path, progress_callback=None):
        """Step 6: Merge voice and background music."""
        try:
            if output_path.exists():
                logger.info(f"Merged audio video already exists: {output_path.name}")
                return output_path
                
            logger.info(f"Mixing tracks with {bg_music_path.name}...")
            VideoProcessorFFmpeg.merge_audio_video(
                video_path=video_path,
                audio_path=audio_path,
                output_path=output_path,
                audio_delay=4.0,
                bg_music_path=bg_music_path,
                progress_callback=progress_callback, base_progress=0, weight=100
            )
            logger.info(f"Audio merged successfully to {output_path.name}")
            return output_path
        except Exception as e:
            logger.error(f"Music merge failed: {e}", exc_info=True)
            raise RuntimeError(f"Music Mix Stage Failed: {e}") from e

    def step_final_render(self, input_path: Path, output_path: Path, ass_path: Path, template: dict, theme_color: str, progress_callback=None):
        """Step 7: Apply VFX and Subtitles."""
        try:
            if output_path.exists():
                logger.info(f"Final video already exists: {output_path.name}")
                return output_path
                
            logger.info("Applying final VFX and Subtitles...")
            VideoProcessorFFmpeg.apply_vfx(
                input_path=input_path,
                output_path=output_path,
                ass_path=ass_path,
                template=template,
                base_dir=self.base_dir,
                theme_color=theme_color,
                progress_callback=progress_callback, base_progress=0, weight=100
            )
            logger.info(f"Final video rendered successfully: {output_path.name}")
            return output_path
        except Exception as e:
            logger.error(f"Final render failed: {e}", exc_info=True)
            raise RuntimeError(f"Final Render Stage Failed: {e}") from e

    def run(self, input_text: str, yt_url: Optional[str] = None, template_name: str = "default", content: Optional[dict] = None, progress_callback=None):
        """Monolithic wrapper kept for compatibility but refactored to use steps."""
        print(f"🚀 Starting/Resuming workflow for: {input_text}")
        
        # Determine slug early
        from app.utils.slug import slugify
        slug = content.get("slug") if content else slugify(input_text)
        
        # Load template
        template_path = self.base_dir / "templates" / f"{template_name}.yaml"
        with open(template_path, "r") as f:
            template = yaml.safe_load(f)

        # 1. Content (Keep simple for now)
        if not content or not content.get("speech"):
             print("   📝 Generating content with Gemini...")
             content = self.llm.generate_content(input_text)
             content["slug"] = slug
        
        # 2. Audio
        audio_path = self.outputs_dir / f"{slug}.mp3"
        self.step_audio_gen(content, audio_path)
        
        # 3. Transcribe
        subtitle_path = self.outputs_dir / f"{slug}_words.json"
        words = self.step_transcribe(audio_path, subtitle_path)
        
        # 4. Download
        if not yt_url:
             raise ValueError("Source video URL is mandatory")
        source_video_path = self.step_video_download(yt_url, slug)
        
        # 5. Crop
        processed_video = self.outputs_dir / f"{slug}_cropped.mp4"
        self.step_video_crop(source_video_path, audio_path, processed_video, progress_callback)
        
        # 6. Music
        # Pick music from assets if provided in content, else use template default
        music_file = content.get("bg_music") or template['music']['file']
        bg_music_path = self.base_dir / "assets" / music_file
        mixed_video = self.outputs_dir / f"{slug}_mixed.mp4"
        self.step_music_merge(processed_video, audio_path, mixed_video, bg_music_path, progress_callback)
        
        # 7. Final
        final_video = self.outputs_dir / f"{slug}_final.mp4"
        
        # Prepare ASS (local WhisperService logic)
        from app.services.stt import WhisperService
        stt = WhisperService()
        ass_path = self.outputs_dir / f"{slug}_captions.ass"
        font_name = template['text']['typography']['font'].split('.')[0]
        font_size = template['text']['typography'].get('size', 110)
        
        stt.generate_ass(words, ass_path, font_name, font_size, time_offset=4.0)
        
        self.step_final_render(mixed_video, final_video, ass_path, template, self.theme_color, progress_callback)
        
        # Cleanup intermediate temps if desired? (Optionally keep for resumption)
        
        return {
            "video": final_video,
            "subtitles": subtitle_path,
            "source": source_video_path
        }

if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent
    workflow = VideoWorkflow(BASE_DIR)
    
    input_text = "Benefits of AI in coding"
    yt_url = "https://youtu.be/iUtnZpzkbG8"
    
    workflow.run(input_text, yt_url)
