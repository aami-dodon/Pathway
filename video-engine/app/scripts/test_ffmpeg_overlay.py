import sys
from pathlib import Path
import subprocess

# Add app directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.services.video_processor_ffmpeg import VideoProcessorFFmpeg
import yaml

def create_dummy_video(output_path, duration=10):
    """Creates a 10s dummy video using FFmpeg"""
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"color=c=blue:s=1080x1920:d={duration}",
        "-f", "lavfi",
        "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-shortest",
        str(output_path)
    ]
    subprocess.run(cmd, check=True)

def main():
    base_dir = Path(__file__).parent.parent.parent
    output_dir = base_dir / "outputs"
    output_dir.mkdir(exist_ok=True)
    
    input_video = output_dir / "test_input.mp4"
    output_video = output_dir / "test_overlay_output.mp4"
    
    print(f"Generating dummy input video at {input_video}...")
    create_dummy_video(input_video)
    
    # Load template
    template_path = base_dir / "templates" / "default.yaml"
    with open(template_path) as f:
        template = yaml.safe_load(f)
        
    print(f"Applying VFX to {output_video}...")
    # Create a dummy ASS file if needed or use an empty one
    # For now, let's create a minimal dummy ASS file
    ass_path = output_dir / "test.ass"
    with open(ass_path, "w") as f:
        f.write("[Script Info]\nScriptType: v4.00+\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\nDialogue: 0,0:00:00.00,0:00:05.00,Default,,0,0,0,,Test Subtitle\n")

    try:
        VideoProcessorFFmpeg.apply_vfx(
            input_path=input_video,
            output_path=output_video,
            ass_path=ass_path,
            template=template,
            base_dir=base_dir
        )
        print("Success! detailed check:")
        print(f"Output saved to: {output_video}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
