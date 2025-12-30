import subprocess
import json
from pathlib import Path
import logging
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from moviepy import (
    VideoFileClip, AudioFileClip, ImageClip, ColorClip, 
    CompositeVideoClip, CompositeAudioClip, vfx
)
import moviepy.audio.fx as afx

logger = logging.getLogger(__name__)

class VideoProcessor:
    @staticmethod
    def create_text_image(text: str, font_path: Path, font_size: int, color: str, stroke_width: int = 4, scale: float = 1.0):
        """Renders text to a transparent PNG using Pillow."""
        try:
            font = ImageFont.truetype(str(font_path), int(font_size * scale))
        except:
            font = ImageFont.load_default()
            
        left, top, right, bottom = font.getbbox(text)
        w, h = right - left, bottom - top
        
        pad = int(font_size * 0.5)
        img = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        draw.text((pad - left, pad - top), text, font=font, fill=color, 
                  stroke_width=stroke_width, stroke_fill="black")
        
        return np.array(img)

    @staticmethod
    def generate_subtitle_clips(words: list, font_path: Path, font_size: int = 140, time_offset: float = 4.0):
        """Generates a list of MoviePy ImageClips for large, impactful subtitles."""
        clips = []
        words_per_screen = 3
        
        for i in range(0, len(words), words_per_screen):
            chunk = words[i:i + words_per_screen]
            if not chunk: continue
            
            for j, active_word in enumerate(chunk):
                word_start = active_word["start"] + time_offset
                word_end = active_word["end"] + time_offset
                
                # Larger canvas for big, impactful text
                canvas_w, canvas_h = 1080, 600
                canvas = Image.new("RGBA", (canvas_w, canvas_h), (0, 0, 0, 0))
                
                total_w = 0
                word_imgs = []
                for k, w in enumerate(chunk):
                    w_text = w['word'].upper()
                    is_active = (k == j)
                    # More pronounced scaling for active word
                    w_scale = 1.4 if is_active else 1.0
                    w_color = "#FCC01E" if is_active else "white"
                    
                    w_np = VideoProcessor.create_text_image(w_text, font_path, font_size, w_color, stroke_width=6, scale=w_scale)
                    w_img = Image.fromarray(w_np)
                    word_imgs.append(w_img)
                    total_w += w_img.width + 30  # More spacing between words
                
                current_x = (canvas_w - total_w) // 2
                for w_img in word_imgs:
                    y_pos = (canvas_h - w_img.height) // 2
                    canvas.paste(w_img, (current_x, y_pos), w_img)
                    current_x += w_img.width + 30
                
                clip = ImageClip(np.array(canvas)).with_start(word_start).with_end(word_end).with_duration(word_end - word_start)
                # Center the subtitles vertically in the lower-middle area of the screen
                clip = clip.with_position(("center", 900))
                clips.append(clip)
                
        return clips

    @staticmethod
    def generate_final_video(
        source_video_path: Path, 
        voice_path: Path, 
        output_path: Path, 
        words: list, 
        template: dict, 
        base_dir: Path,
        bg_music_path: Path = None
    ):
        """One-pass MoviePy rendering for maximum speed."""
        assets_dir = base_dir / "assets"
        print(f"\n   🎬 MoviePy (Single Pass Rendering)...")
        
        voice = AudioFileClip(str(voice_path)).with_start(4.0)
        target_duration = voice.duration + 8.0
        
        with VideoFileClip(str(source_video_path)) as source:
            w, h = source.size
            if w/h > 9/16:
                source_port = source.resized(height=1920)
                x1 = (source_port.w - 1080) // 2
                source_final = source_port.cropped(x1=x1, y1=0, width=1080, height=1920)
            else:
                source_port = source.resized(width=1080)
                y1 = (source_port.h - 1920) // 2
                source_final = source_port.cropped(x1=0, y1=y1, width=1080, height=1920)
            
            video = source_final.without_audio().with_effects([vfx.Loop(duration=target_duration)])
            
            audio_inputs = [voice]
            if bg_music_path and bg_music_path.exists():
                bg = AudioFileClip(str(bg_music_path)).with_effects([afx.MultiplyVolume(0.15)])
                bg_looped = bg.with_effects([afx.AudioLoop(duration=target_duration)])
                bg_final = bg_looped.with_effects([afx.AudioFadeOut(3.0)])
                audio_inputs.append(bg_final)
            
            final_audio = CompositeAudioClip(audio_inputs)
            video = video.with_audio(final_audio)

            tint = ColorClip(size=video.size, color=(252, 192, 30)).with_opacity(0.08).with_duration(target_duration)
            
            font_path = assets_dir / template['text']['typography']['font']
            font_size = template['text']['typography'].get('size', 100)
            sub_clips = VideoProcessor.generate_subtitle_clips(words, font_path, font_size=font_size, time_offset=4.0)
            
            intro = VideoFileClip(str(assets_dir / template['intro']['file']), has_mask=True).with_start(0)
            outro_start = target_duration - 4.0
            outro = VideoFileClip(str(assets_dir / template['outro']['file']), has_mask=True).with_start(outro_start)
            
            logo_img_path = assets_dir / template['logo']['file']
            logo_w_config = template['logo'].get('width', '30%')
            logo_w = int(video.w * 0.3) if '%' in str(logo_w_config) else int(logo_w_config)
            
            logo = (ImageClip(str(logo_img_path))
                    .resized(width=logo_w)
                    .with_start(4.0)
                    .with_end(target_duration - 4.0)
                    .with_position(("right", "top"))
                    .with_effects([
                        vfx.FadeIn(1.0), 
                        vfx.FadeOut(1.0),
                        vfx.Margin(top=60, right=60, opacity=0)
                    ]))
            
            grad_b = ImageClip(str(assets_dir / template['gradient']['file'])).with_duration(target_duration).with_position(("center", "bottom"))
            grad_t = ImageClip(str(assets_dir / "overlays/gradient-top.png")).with_duration(target_duration).with_position(("center", "top"))
            
            final_video = CompositeVideoClip([
                video, 
                tint, 
                grad_b, 
                grad_t, 
                *sub_clips, 
                logo, 
                intro, 
                outro
            ])
            
            print(f"      🚀 Starting HIGH-SPEED render (THREADS=12, PRESET=ULTRAFAST)...")
            final_video.write_videofile(
                str(output_path), 
                fps=24, 
                codec="libx264", 
                audio_codec="aac", 
                logger='bar',
                threads=12,
                preset='ultrafast'
            )
            
            final_video.close()
            intro.close()
            outro.close()
            voice.close()
