import re
import sys
import json
import logging
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)

class VideoProcessorFFmpeg:
    @staticmethod
    def get_duration(file_path: Path):
        cmd = [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(file_path)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        return float(result.stdout.strip())

    @staticmethod
    def run_cmd_with_progress(cmd, duration, progress_callback, base_progress=0, weight=100.0):
        """Runs an FFmpeg command and reports progress via callback."""
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            bufsize=1
        )
        
        time_regex = re.compile(r"time=(\d+):(\d+):(\d+.\d+)")
        
        for line in process.stdout:
            match = time_regex.search(line)
            if match and duration > 0:
                h, m, s = map(float, match.groups())
                current_time = h * 3600 + m * 60 + s
                p = min(1.0, current_time / duration)
                if progress_callback:
                    progress_callback(base_progress + (p * weight))
        
        process.wait()
        if process.returncode != 0:
            raise subprocess.CalledProcessError(process.returncode, cmd)

    @staticmethod
    def process_source_video(input_path: Path, output_path: Path, target_duration: float, progress_callback=None, base_progress=0, weight=10.0):
        """Crops to 9:16, removes audio, and loops using FFmpeg."""
        filter_complex = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
        cmd = [
            "ffmpeg", "-y", "-stats",
            "-stream_loop", "-1",
            "-i", str(input_path),
            "-t", str(target_duration),
            "-vf", filter_complex,
            "-an",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "ultrafast",
            str(output_path)
        ]
        VideoProcessorFFmpeg.run_cmd_with_progress(cmd, target_duration, progress_callback, base_progress, weight)

    @staticmethod
    def merge_audio_video(video_path: Path, audio_path: Path, output_path: Path, audio_delay: float = 4.0, bg_music_path: Path = None, bg_fade_out: float = 3.0, progress_callback=None, base_progress=0, weight=10.0):
        video_duration = VideoProcessorFFmpeg.get_duration(video_path)
        delay_ms = int(audio_delay * 1000)
        inputs = ["-i", str(video_path), "-i", str(audio_path)]
        filter_complex = f"[1:a]adelay={delay_ms}|{delay_ms}[delayed_voice];"
        
        if bg_music_path and bg_music_path.exists():
            inputs.extend(["-stream_loop", "-1", "-i", str(bg_music_path)])
            fade_start = max(0, video_duration - bg_fade_out)
            bg_filter = f"[2:a]volume=0.15,afade=t=out:st={fade_start}:d={bg_fade_out}[bg_music];"
            filter_complex += f"{bg_filter}[delayed_voice][bg_music]amix=inputs=2:duration=longest:dropout_transition=0[a_out]"
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
            "-shortest", 
            str(output_path)
        ]
        VideoProcessorFFmpeg.run_cmd_with_progress(cmd, video_duration, progress_callback, base_progress, weight)

    @staticmethod
    def apply_vfx(
        input_path: Path, 
        output_path: Path, 
        ass_path: Path, 
        template: dict, 
        base_dir: Path,
        theme_color: str = "#FCC01E",
        progress_callback=None,
        base_progress=0,
        weight=80.0
    ):
        assets_dir = base_dir / "assets"
        intro_path = assets_dir / template['intro']['file']
        outro_path = assets_dir / template['outro']['file']
        logo_path = assets_dir / template['logo']['file']
        gradient_bottom_path = assets_dir / template['gradient']['file']
        gradient_top_path = assets_dir / "overlays/gradient-top.png"
        
        duration = VideoProcessorFFmpeg.get_duration(input_path)
        intro_duration = VideoProcessorFFmpeg.get_duration(intro_path)
        outro_duration = VideoProcessorFFmpeg.get_duration(outro_path)
        
        def esc(p): return str(p).replace("\\", "/").replace(":", "\\:")
        
        logo_width_config = template['logo'].get('width', '30%')
        if isinstance(logo_width_config, str) and logo_width_config.endswith('%'):
            multiplier = float(logo_width_config.strip('%')) / 100.0
            target_logo_w = int(1080 * multiplier)
        else:
            try:
                target_logo_w = int(logo_width_config)
            except:
                target_logo_w = 324 
        
        fonts_dir = assets_dir / "fonts"
        intro_end = intro_duration
        outro_start = max(0, duration - outro_duration)
        fade_dur = 1.0
        fade_start_t = max(0, duration - 4.0)

        filter_complex = (
            f"[0:v]format=rgba[v0];"
            f"[v0]ass='{esc(ass_path)}':fontsdir='{esc(fonts_dir)}'[v_sub];"
            f"[v_sub]drawbox=x=0:y=0:w=iw:h=ih:color={theme_color}@0.08:t=fill[v_tint];"
            f"[v_tint]fade=t=out:st={fade_start_t}:d=4:color=black[v_faded];"
            f"[1:v]format=rgba,colorkey=0x000000:0.1:0.1[intro_src];"
            f"[2:v]format=rgba,colorkey=0x000000:0.1:0.1[outro_src];"
            f"[v_faded][intro_src]overlay=0:0:enable='between(t,0,{intro_end})'[v_intro];"
            f"[v_intro][outro_src]overlay=0:0:enable='between(t,{outro_start},{duration})'[v_outro];"
            f"[v_outro][3:v]overlay=0:H-h[v_grad_b];"
            f"[v_grad_b][4:v]overlay=W-w:0[v_grad_t];"
            f"[5:v]loop=loop=-1:size=1:start=0,scale={target_logo_w}:-1,format=rgba,"
            f"fade=in:st=5.0:d={fade_dur}:alpha=1,"
            f"fade=out:st={duration - 5.0}:d={fade_dur}:alpha=1[logo_s];"
            f"[v_grad_t][logo_s]overlay=W-w-60:60:shortest=1[v_final]"
        )
        
        cmd = [
            "ffmpeg", "-y", 
            "-v", "error", "-stats",
            "-i", str(input_path),
            "-i", str(intro_path),
            "-i", str(outro_path), 
            "-i", str(gradient_bottom_path),
            "-i", str(gradient_top_path),
            "-i", str(logo_path),
            "-filter_complex", filter_complex,
            "-map", "[v_final]",
            "-map", "0:a?",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-preset", "ultrafast",
            "-crf", "23",
            "-c:a", "aac", "-b:a", "192k",
            str(output_path)
        ]
        VideoProcessorFFmpeg.run_cmd_with_progress(cmd, duration, progress_callback, base_progress, weight)

    @staticmethod
    def generate_final_video(
        source_video_path: Path, 
        voice_path: Path, 
        output_path: Path, 
        words: list, 
        template: dict, 
        base_dir: Path, 
        bg_music_path: Path = None,
        theme_color: str = "#FCC01E",
        progress_callback=None
    ):
        """
        Orchestrates the full FFmpeg pipeline:
        1. Generate Subtitles (ASS)
        2. Process Source (Crop/Loop)
        3. Merge Audio (Voice + BG Music)
        4. Apply VFX (Overlays + Subtitles)
        """
        from app.services.stt import WhisperService  # Local import to avoid circular dep risks
        
        outputs_dir = source_video_path.parent
        print(f"🎬 FFmpeg Pipeline Started for: {output_path.name}")

        # 1. Generate ASS Subtitles
        print("   [1/4] Generating subtitles...")
        stt = WhisperService()
        ass_path = outputs_dir / "captions.ass"
        
        font_name = template['text']['typography']['font'].split('.')[0] # Remove .ttf
        font_size = template['text']['typography'].get('size', 110)
        
        stt.generate_ass(
            words=words,
            output_path=ass_path,
            font_name=font_name,
            font_size=font_size,
            time_offset=4.0  # Match voice delay
        )

        # 2. Process Video (Crop/Loop)
        print("   [2/4] Processing source video...")
        voice_duration = VideoProcessorFFmpeg.get_duration(voice_path)
        target_duration = voice_duration + 8.0
        
        processed_source = outputs_dir / "ffmpeg_processed_temp.mp4"
        VideoProcessorFFmpeg.process_source_video(
            source_video_path, processed_source, target_duration,
            progress_callback=progress_callback, base_progress=60, weight=10
        )
        
        # 3. Merge Audio
        print("   [3/4] Merging audio tracks...")
        merged_audio_path = outputs_dir / "ffmpeg_merged_audio_temp.mp4"
        VideoProcessorFFmpeg.merge_audio_video(
            video_path=processed_source,
            audio_path=voice_path,
            output_path=merged_audio_path,
            audio_delay=4.0,
            bg_music_path=bg_music_path,
            progress_callback=progress_callback, base_progress=70, weight=5
        )
        
        # 4. Apply VFX
        print("   [4/4] Applying final VFX...")
        VideoProcessorFFmpeg.apply_vfx(
            input_path=merged_audio_path,
            output_path=output_path,
            ass_path=ass_path,
            template=template,
            base_dir=base_dir,
            theme_color=theme_color,
            progress_callback=progress_callback, base_progress=75, weight=25
        )
        
        # Cleanup temps
        for p in [processed_source, merged_audio_path, ass_path]:
            if p.exists():
                p.unlink()
        
        # Save sample/metadata JSON
        json_path = output_path.with_suffix(".json")
        metadata = {
             "id": output_path.stem,
             "files": {
                 "video": output_path.name,
                 "voice": voice_path.name,
                 "source": source_video_path.name,
                 "music": bg_music_path.name if bg_music_path else None
             },
             "config": template,
             "theme_color": theme_color,
             "duration": target_duration
        }
        with open(json_path, "w") as f:
            json.dump(metadata, f, indent=4)
        print(f"      ✅ Saved metadata to {json_path.name}")
        
        print(f"✅ FFmpeg Pipeline Complete: {output_path}")
