import subprocess
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

from app.utils.ffmpeg_helper import FFmpegHelper

class VideoProcessor:
    @staticmethod
    def get_duration(file_path: Path):
        return FFmpegHelper.get_duration(file_path)

    @staticmethod
    def process_source_video(input_path: Path, output_path: Path, target_duration: float):
        """
        Crops to 9:16, removes audio, and loops to target duration.
        """
        # Crop logic: scale to cover 1080x1920, then crop centered
        filter_complex = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
        
        cmd = [
            "ffmpeg", "-y", "-stats",
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
    def merge_audio_video(video_path: Path, audio_path: Path, output_path: Path, audio_delay: float = 3.0, bg_music_path: Path = None):
        """
        Merges audio into video with a delay, and mixes background music.
        """
        delay_ms = int(audio_delay * 1000)
        
        inputs = ["-i", str(video_path), "-i", str(audio_path)]
        filter_complex = f"[1:a]adelay={delay_ms}|{delay_ms}[delayed_voice];"
        
        map_interaction = ""
        
        if bg_music_path and bg_music_path.exists():
            inputs.extend(["-stream_loop", "-1", "-i", str(bg_music_path)])
            # Loop music (handled by input flag), lower volume, trim to video length
            
            filter_complex += f"[2:a]volume=0.15,apad[bg_music];[delayed_voice][bg_music]amix=inputs=2:duration=first:dropout_transition=0[a_out]"
            map_audio = "-map [a_out]"
        else:
            filter_complex += "[delayed_voice]volume=1.0[a_out]"
            map_audio = "-map [a_out]"

        cmd = [
            "ffmpeg", "-y", "-stats",
            *inputs,
            "-filter_complex", filter_complex,
            "-map", "0:v",
            *map_audio.split(),
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest", # Ensure output stops when video stops
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
        gradient_bottom_path = assets_dir / template['gradient']['file']
        gradient_top_path = assets_dir / "overlays/gradient-top.png" # Assuming this exists or passed in config
        
        # We need to overlay intro at the start and outro at the end.
        # Plus the logo and gradient and subtitles.
        
        duration = VideoProcessor.get_duration(input_path)
        outro_start = duration - 3.0
        
        # Escape paths for ffmpeg
        def esc(p): return str(p).replace("\\", "/").replace(":", "\\:")
        
        # Get video dimensions for percentage calculations
        probe_cmd = [
            "ffprobe", "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-of", "json", str(input_path)
        ]
        probe_result = subprocess.run(probe_cmd, capture_output=True, text=True)
        video_info = json.loads(probe_result.stdout)
        video_width = int(video_info['streams'][0]['width'])
        
        # Calculate logo width (support both px and %)
        logo_width_config = template['logo'].get('width', '30%')
        if isinstance(logo_width_config, str) and '%' in str(logo_width_config):
            # Percentage-based width
            pct = float(str(logo_width_config).replace('%', ''))
            logo_width = int(video_width * (pct / 100))
        else:
            # Fixed pixel width
            logo_width = int(logo_width_config)
            
        # Theme color for tint (Gold/Amber: #FCC01E)
        theme_color = "#FCC01E" 
        
        # Note on Fonts: For ASS to use custom fonts, we might need fontsdir.
        # But we'll trust system or basic font for now.
        # Added fontsdir to ass filter just in case: fontsdir={esc(assets_dir / 'fonts')}
        fonts_dir = assets_dir / "fonts"

        # Timing Logic (Hardcoded to 4s based on merge_audio_video padding)
        intro_duration = 4.0
        outro_duration = 4.0
        
        intro_end = intro_duration
        outro_start = duration - outro_duration
        
        # Logo Timing: Matches content window (After intro, Before outro)
        # Fade logic:
        # Fade In: Starts at intro_end, lasts 1s.
        # Fade Out: Starts at (outro_start - 1s), lasts 1s.
        
        logo_fade_in_start = intro_end
        logo_fade_out_start = outro_start - 1.0 
        
        logo_filter = (
            f"[{5}:v]scale={logo_width}:-1,format=rgba,"
            f"fade=in:st={logo_fade_in_start}:d=1:alpha=1,"
            f"fade=out:st={logo_fade_out_start}:d=1:alpha=1[logo_s];"
        )

        filter_complex = (
            f"[0:v]drawbox=x=0:y=0:w=iw:h=ih:color={theme_color}@0.08:t=fill[v_tint]; " # Global Tint
            f"[v_tint]ass='{esc(ass_path)}':fontsdir='{esc(fonts_dir)}'[v_sub]; " # Subtitles
            f"[v_sub][1:v]overlay=0:0:enable='between(t,0,{intro_end})'[v_intro]; " # Intro: 0 to 4s
            f"[v_intro][2:v]overlay=0:0:enable='between(t,{outro_start},{duration})'[v_outro]; " # Outro
            f"[v_outro][3:v]overlay=0:H-h[v_grad_b]; " # Gradient Bottom
            f"[v_grad_b][4:v]overlay=W-w:0[v_grad_t]; " # Gradient Top
            f"{logo_filter}" # Logo Layer
            f"[v_grad_t][logo_s]overlay=W-w-60:60[v_final]" # Logo Start
        )
        
        cmd = [
            "ffmpeg", "-y", "-stats",
            "-i", str(input_path),
            "-i", str(intro_path),
            "-i", str(outro_path),
            "-i", str(gradient_bottom_path),
            "-i", str(gradient_top_path),
            "-i", str(logo_path),
            "-filter_complex", filter_complex,
            "-map", "[v_final]",
            "-map", "0:a", # Keep the delayed audio
            "-c:v", "libx264",
            "-c:a", "copy",
            str(output_path)
        ]
        subprocess.run(cmd, check=True)
