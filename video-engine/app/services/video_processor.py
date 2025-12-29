import subprocess
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class VideoProcessor:
    @staticmethod
    def get_duration(file_path: Path):
        cmd = [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "json", str(file_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        data = json.loads(result.stdout)
        return float(data['format']['duration'])

    @staticmethod
    def process_source_video(input_path: Path, output_path: Path, target_duration: float):
        """
        Crops to 9:16, removes audio, and loops to target duration.
        """
        # Crop logic: scale to cover 1080x1920, then crop centered
        filter_complex = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
        
        cmd = [
            "ffmpeg", "-y",
            "-stream_loop", "-1", # Loop infinitely
            "-i", str(input_path),
            "-t", str(target_duration),
            "-vf", filter_complex,
            "-an", # Remove audio
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            str(output_path)
        ]
        subprocess.run(cmd, check=True)

    @staticmethod
    def merge_audio_video(video_path: Path, audio_path: Path, output_path: Path, audio_delay: float = 3.0):
        """
        Merges audio into video with a delay.
        """
        # adelay filter expects delay in ms for each channel. 
        # For simplicity, we can use an offset in the filter_complex or just -itsoffset.
        # But adelay is cleaner for specific streams.
        delay_ms = int(audio_delay * 1000)
        
        cmd = [
            "ffmpeg", "-y",
            "-i", str(video_path),
            "-i", str(audio_path),
            "-filter_complex", f"[1:a]adelay={delay_ms}|{delay_ms}[delayed_audio]",
            "-map", "0:v",
            "-map", "[delayed_audio]",
            "-c:v", "copy",
            "-c:a", "aac",
            str(output_path)
        ]
        subprocess.run(cmd, check=True)

    @staticmethod
    def apply_vfx(input_path: Path, output_path: Path, ass_path: Path, template: dict, base_dir: Path):
        """
        Applies intro, outro, subtitles, logo, and gradient.
        This is a complex one, we'll adapt the logic from render.py.
        """
        # We'll implement this in the main workflow for better control or here.
        # Let's keep it here for modularity.
        
        assets_dir = base_dir / "assets"
        intro_path = assets_dir / template['intro']['file']
        outro_path = assets_dir / template['outro']['file']
        logo_path = assets_dir / template['logo']['file']
        gradient_path = assets_dir / template['gradient']['file']
        
        # We need to overlay intro at the start and outro at the end.
        # Plus the logo and gradient and subtitles.
        
        duration = VideoProcessor.get_duration(input_path)
        outro_start = duration - 3.0
        
        # Escape paths for ffmpeg
        def esc(p): return str(p).replace("\\", "/").replace(":", "\\:")
        
        filter_complex = (
            f"[0:v]ass='{esc(ass_path)}'[v_sub]; " # Subtitles
            f"[v_sub][1:v]overlay=0:0:enable='between(t,0,3)'[v_intro]; " # Intro animation
            f"[v_intro][2:v]overlay=0:0:enable='between(t,{outro_start},{duration})'[v_outro]; " # Outro animation
            f"[v_outro][3:v]overlay=0:H-h[v_grad]; " # Gradient at bottom
            f"[{4}:v]scale={template['logo']['width']}:-1[logo_s]; " # Scale logo
            f"[v_grad][logo_s]overlay=W-w-60:60[v_final]" # Logo top-right
        )
        
        cmd = [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-i", str(intro_path),
            "-i", str(outro_path),
            "-i", str(gradient_path),
            "-i", str(logo_path),
            "-filter_complex", filter_complex,
            "-map", "[v_final]",
            "-map", "0:a", # Keep the delayed audio
            "-c:v", "libx264",
            "-c:a", "copy",
            str(output_path)
        ]
        subprocess.run(cmd, check=True)
