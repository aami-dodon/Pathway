#!/usr/bin/env python3
"""
MoviePy Video Renderer
======================
Regenerates the final video using MoviePy (single-pass, optimized).
Uses existing assets from outputs/ directory.
"""

import yaml
import json
from pathlib import Path
from app.services.video_processor_moviepy import VideoProcessor


def main():
    BASE_DIR = Path(__file__).resolve().parent
    OUTPUTS_DIR = BASE_DIR / "outputs"
    
    processor = VideoProcessor()
    
    # 1. Load configuration
    template_path = BASE_DIR / "templates" / "default.yaml"
    voice_path = OUTPUTS_DIR / "voice.mp3"
    words_json = OUTPUTS_DIR / "words.json"
    
    # Find source video
    source_path = OUTPUTS_DIR / "source_1080p.mp4"
    if not source_path.exists():
        for p in OUTPUTS_DIR.glob("source_*.mp4"):
            source_path = p
            break
    
    # Validate required files
    missing = []
    if not source_path.exists():
        missing.append("source video (source_*.mp4)")
    if not voice_path.exists():
        missing.append("voice.mp3")
    if not words_json.exists():
        missing.append("words.json")
        
    if missing:
        print(f"❌ Missing required files in outputs/:")
        for m in missing:
            print(f"   - {m}")
        print("\n💡 Run the main workflow first to generate these assets.")
        return
    
    print(f"🎬 MoviePy Video Renderer")
    print(f"   Source: {source_path.name}")
    
    # 2. Load words data
    with open(words_json, 'r') as f:
        words = json.load(f)
    print(f"   ✅ Loaded {len(words)} words from words.json")
    
    # 3. Load template
    with open(template_path, "r") as f:
        template = yaml.safe_load(f)
    
    bg_music_path = BASE_DIR / "assets" / template['music']['file']
    
    # 4. Render with MoviePy (single-pass, optimized)
    print("\n   🎬 Starting MoviePy Single-Pass Render...")
    final_path = OUTPUTS_DIR / "final_moviepy.mp4"
    
    processor.generate_final_video(
        source_video_path=source_path,
        voice_path=voice_path,
        output_path=final_path,
        words=words,
        template=template,
        base_dir=BASE_DIR,
        bg_music_path=bg_music_path
    )
    
    print(f"\n✅ SUCCESS! MoviePy video generated: {final_path}")


if __name__ == "__main__":
    main()
