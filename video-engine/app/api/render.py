from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import logging
import yt_dlp

router = APIRouter()
logger = logging.getLogger(__name__)

class SourceModel(BaseModel):
    type: str
    value: str

class RenderRequest(BaseModel):
    source: SourceModel
    text: str | None = None
    template: str | None = None

def download_video(url: str, output_path: Path):
    """
    Downloads video using yt-dlp to the specified output path.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    cookies_path = base_dir / "cookies.txt"

    ydl_opts = {
        # Select best single file with video and audio to avoid FFmpeg merging
        'format': 'best[ext=mp4]/best',
        'outtmpl': str(output_path),
        'overwrite': True,
        'quiet': True,
    }

    if cookies_path.exists():
        ydl_opts['cookiefile'] = str(cookies_path)
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception as e:
        logger.error(f"Download failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

import subprocess

def check_ffmpeg():
    """
    Checks if FFmpeg is installed and available in the system PATH.
    """
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        logger.error("FFmpeg not found. Please install FFmpeg.")
        raise HTTPException(status_code=500, detail="FFmpeg not configured on server")

import textwrap

def process_video(input_path: Path, output_path: Path):
    """
    Crops video to 9:16 (1080x1920), limits to 30s.
    """
    # scale to fill 1080x1920, then crop to 1080x1920 centered
    filter_complex = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:x=(iw-ow)/2:y=(ih-oh)/2"
    
    cmd = [
        "ffmpeg",
        "-y",               # Overwrite output
        "-i", str(input_path),
        "-t", "30",         # Limit to 30 seconds
        "-vf", filter_complex,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-r", "30",         # FPS 30
        "-pix_fmt", "yuv420p", # Ensure compatibility
        str(output_path)
    ]
    
    logger.info(f"Running FFmpeg Crop: {' '.join(cmd)}")
    print(f"Running FFmpeg Crop: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logger.error(f"FFmpeg Crop failed: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Video cropping failed: {error_msg}")

def escape_ffmpeg_text(text):
    """
    Escapes text for FFmpeg drawtext filter.
    """
    # Escape \ -> \\, ' -> \', : -> \:
    text = text.replace("\\", "\\\\").replace("'", "\\'").replace(":", "\\:")
    return text

def wrap_text(text, width=20):
    """
    Wraps text into multiple lines.
    """
    return "\n".join(textwrap.wrap(text, width=width))

def sanitize_text(text):
    """
    Sanitizes text to remove non-printable characters that might render as squares.
    """
    # Keep only printable characters (this is a simple ascii/printable filter)
    return "".join(c for c in text if c.isprintable())

def generate_ass_file(text: str, output_path: Path, font_dir: Path):
    """
    Generates an ASS subtitle file for Instagram-style captions.
    """
    clean_text = sanitize_text(text).replace("\r", "")
    # Wrap text to ~20 chars per line (adjustment for 80pt font on 1080px width)
    lines = textwrap.wrap(clean_text, width=20)
    # Join with ASS newline code \N
    ass_text = "\\N".join(lines)
    
    # ASS File Content
    # - Alignment 2 = Bottom Center
    # - MarginV 500 = Positioned roughly 30-40% from bottom on 1920 height
    # - Outline 5, Shadow 2 = Strong visibility
    # - Fontname = Roboto-Bold (Matches the font filename without extension usually, or we force it via Style config if we can)
    # Note: FFmpeg's ass filter needs to find the font. We will provide fontsdir.
    
    ass_content = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Roboto-Bold,80,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5,2,2,50,50,500,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:30.00,Default,,0,0,0,,{ass_text}
"""
    try:
        output_path.write_text(ass_content, encoding="utf-8")
    except Exception as e:
        logger.error(f"Failed to write ASS file: {e}")
        raise HTTPException(status_code=500, detail="Subtitle generation failed")

def add_text_overlay(input_path: Path, output_path: Path, text: str):
    """
    Adds text overlay using ASS subtitles (burned in).
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    font_dir = base_dir / "assets" / "fonts"
    ass_file_path = base_dir / "outputs" / "captions.ass"
    
    # Generate the ASS file
    generate_ass_file(text, ass_file_path, font_dir)
    
    # Prepare paths for FFmpeg
    # FFmpeg ass filter requires escaped paths
    escaped_ass_path = str(ass_file_path).replace("\\", "/").replace(":", "\\:")
    escaped_fonts_dir = str(font_dir).replace("\\", "/").replace(":", "\\:")
    
    # "ass=filename.ass:fontsdir=..."
    vf_filter = f"ass='{escaped_ass_path}':fontsdir='{escaped_fonts_dir}'"
    
    cmd = [
        "ffmpeg",
        "-y",
        "-i", str(input_path),
        "-vf", vf_filter,
        "-c:v", "libx264",
        "-c:a", "copy",
        "-pix_fmt", "yuv420p",
        str(output_path)
    ]
    
    logger.info(f"Running FFmpeg ASS: {' '.join(cmd)}")
    print(f"Running FFmpeg ASS: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logger.error(f"FFmpeg ASS failed: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Subtitle overlay failed: {error_msg}")
    finally:
        # Cleanup ASS file
        if ass_file_path.exists():
            ass_file_path.unlink()

@router.post("/render")
async def render_video(request: RenderRequest):
    """
    Downloads, crops, and adds text overlay to a video.
    """
    # check ffmpeg first
    check_ffmpeg()

    # Log the received payload
    logger.info(f"Received render payload: {request.dict()}")
    print(f"Received render payload: {request.dict()}")

    if request.source.type != "url":
        raise HTTPException(status_code=400, detail="Only 'url' source type is supported")

    # Define output directory and file
    base_dir = Path(__file__).resolve().parent.parent.parent
    output_dir = base_dir / "outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    input_file = output_dir / "input.mp4"
    cropped_file = output_dir / "output.mp4"
    final_file = output_dir / "final.mp4"
    
    print(f"Downloading from {request.source.value} to {input_file}")
    
    # 1. Download video
    download_video(request.source.value, input_file)

    if not input_file.exists():
         raise HTTPException(status_code=500, detail="File was not created after download")
    
    # 2. Crop/Scale video
    print(f"Processing (cropping) video to {cropped_file}")
    process_video(input_file, cropped_file)

    if not cropped_file.exists():
        raise HTTPException(status_code=500, detail="Cropped file was not created")

    # 3. Add Text Overlay
    if request.text:
        print(f"Adding text overlay to {final_file}")
        add_text_overlay(cropped_file, final_file, request.text)
        
        if not final_file.exists():
             raise HTTPException(status_code=500, detail="Final file with text was not created")
        
        final_output_path = "outputs/final.mp4"
    else:
        # If no text, final is just the cropped version (shim behavior)
        final_file = cropped_file
        final_output_path = "outputs/output.mp4"

    return {
        "status": "completed",
        "final_video": final_output_path
    }
