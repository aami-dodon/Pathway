#!/usr/bin/env python3
"""
FFmpeg Video Renderer
=====================
Regenerates the final video using FFmpeg (pipeline approach).
Uses existing assets from outputs/ directory.
"""

import yaml
import json
from pathlib import Path
from app.services.video_processor_ffmpeg import VideoProcessorFFmpeg
from app.services.stt import WhisperService


def main():
    BASE_DIR = Path(__file__).resolve().parent
    OUTPUTS_DIR = BASE_DIR / "outputs"
    
    # 1. Load configuration
    template_path = BASE_DIR / "templates" / "default.yaml"
    with open(template_path, "r") as f:
        template = yaml.safe_load(f)

    # Load dynamic theme color
    from app.utils.theme_parser import get_theme_color
    theme_css_path = BASE_DIR.parent / "packages" / "brand" / "theme.css"
    theme_color = get_theme_color(theme_css_path)
    print(f"🎨 Theme Color: {theme_color}")
    
    words_path = OUTPUTS_DIR / "words.json"
    voice_path = OUTPUTS_DIR / "voice.mp3"
    
    # ... (snipped validation) ...
    
    # 5. Apply VFX
    print("   🎨 Applying VFX overlays...")
    final_path = OUTPUTS_DIR / "final_ffmpeg.mp4"
    processor.apply_vfx(
        input_path=merged_path,
        output_path=final_path,
        ass_path=ass_path,
        template=template,
        base_dir=BASE_DIR,
        theme_color=theme_color
    )
    
    print(f"\n✅ SUCCESS! FFmpeg video generated: {final_path}")


if __name__ == "__main__":
    main()
