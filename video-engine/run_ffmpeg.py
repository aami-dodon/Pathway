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
    
    words_path = OUTPUTS_DIR / "words.json"
    voice_path = OUTPUTS_DIR / "voice.mp3"
    
    # Find source video
    source_path = next(OUTPUTS_DIR.glob("source_*.mp4"), None)
    
    # Validate required files
    missing = []
    if not source_path:
        missing.append("source video (source_*.mp4)")
    if not voice_path.exists():
        missing.append("voice.mp3")
    if not words_path.exists():
        missing.append("words.json")
        
    if missing:
        print(f"❌ Missing required files in outputs/:")
        for m in missing:
            print(f"   - {m}")
        print("\n💡 Run the main workflow first to generate these assets.")
        return
    
    print(f"🎬 FFmpeg Video Renderer")
    print(f"   Source: {source_path.name}")
    
    with open(words_path, "r") as f:
        words = json.load(f)
    print(f"   ✅ Loaded {len(words)} words from words.json")
    
    stt = WhisperService()
    processor = VideoProcessorFFmpeg()
    
    # 2. Generate ASS Subtitles (FFmpeg-specific)
    print("   ✍️  Generating ASS subtitles...")
    ass_path = OUTPUTS_DIR / "captions.ass"
    stt.generate_ass(
        words=words,
        output_path=ass_path,
        font_name=template['text']['typography']['font'].split('.')[0],  # strip .ttf
        font_size=template['text']['typography'].get('size', 110),
        time_offset=4.0  # Match the voice delay
    )
    
    # 3. Process Video (Crop/Loop)
    print("   🎞️  Processing source video...")
    voice_duration = processor.get_duration(voice_path)
    target_duration = voice_duration + 8.0
    processed_source = OUTPUTS_DIR / "ffmpeg_processed_source.mp4"
    processor.process_source_video(source_path, processed_source, target_duration)
    
    # 4. Merge Audio
    print("   🔊 Merging audio tracks...")
    merged_path = OUTPUTS_DIR / "ffmpeg_merged_audio.mp4"
    bg_music_path = BASE_DIR / "assets" / template['music']['file']
    processor.merge_audio_video(
        video_path=processed_source,
        audio_path=voice_path,
        output_path=merged_path,
        audio_delay=4.0,
        bg_music_path=bg_music_path
    )
    
    # 5. Apply VFX
    print("   🎨 Applying VFX overlays...")
    final_path = OUTPUTS_DIR / "final_ffmpeg.mp4"
    processor.apply_vfx(
        input_path=merged_path,
        output_path=final_path,
        ass_path=ass_path,
        template=template,
        base_dir=BASE_DIR
    )
    
    print(f"\n✅ SUCCESS! FFmpeg video generated: {final_path}")


if __name__ == "__main__":
    main()
