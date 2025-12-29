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

import yaml

def load_template(template_name: str = "default"):
    """
    Loads a YAML template from the templates directory.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    template_path = base_dir / "templates" / f"{template_name}.yaml"
    
    if not template_path.exists():
        logger.warning(f"Template {template_name} not found, falling back to default.")
        template_path = base_dir / "templates" / "default.yaml"
    
    if not template_path.exists():
        return {}
        
    try:
        with open(template_path, "r") as f:
            return yaml.safe_load(f)
    except Exception as e:
        logger.error(f"Failed to load template: {e}")
        return {}

def hex_to_ass_color(hex_color: str, alpha: str = "00") -> str:
    """
    Converts Hex color (#RRGGBB) to ASS color (&HBBGGRR).
    Alpha is hex string (00 = opaque, FF = transparent).
    Result format: &HAABBGGRR
    """
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 6:
        r, g, b = hex_color[0:2], hex_color[2:4], hex_color[4:6]
        return f"&H{alpha}{b}{g}{r}".upper()
    return f"&H{alpha}FFFFFF" # Fallback

def generate_ass_file(text: str, output_path: Path, template: dict):
    """
    Generates an ASS subtitle file based on the template configuration.
    """
    text_config = template.get("text", {})
    typography = text_config.get("typography", {})
    layout = text_config.get("layout", {})
    
    # 1. Typography & Style
    font_file = typography.get("font", "fonts/Roboto-Bold.ttf")
    # Extract font name (ASS needs the family name, but usually filename without ext works if in fontsdir)
    font_name = Path(font_file).stem 
    
    font_size = typography.get("size", 64)
    primary_color = hex_to_ass_color(typography.get("color", "#FFFFFF"))
    
    outline_config = typography.get("outline", {})
    outline_enabled = outline_config.get("enabled", True)
    outline_color = hex_to_ass_color(outline_config.get("color", "#000000"))
    outline_width = outline_config.get("width", 3) if outline_enabled else 0
    
    shadow_config = typography.get("shadow", {})
    shadow_enabled = shadow_config.get("enabled", True)
    shadow_color = hex_to_ass_color(shadow_config.get("color", "#000000"))
    # ASS mostly supports Shadow depth, not complex blur. We map 'y' or 'x' roughly.
    shadow_depth = shadow_config.get("y", 2) if shadow_enabled else 0
    
    # 2. Layout & Alignment
    # Position: top | center | bottom
    pos = layout.get("position", "bottom")
    margin_bottom = layout.get("margin_bottom", 200)
    margin_top = layout.get("margin_top", 60)
    
    # Map to ASS Alignment
    # 2 (Bottom Center), 8 (Top Center), 5 (Center)
    if pos == "top":
        alignment = 8
        margin_v = margin_top
    elif pos == "center":
        alignment = 5
        margin_v = 0 # Center doesn't usually use margin_v
    else: # bottom
        alignment = 2
        margin_v = margin_bottom

    # 3. Text Processing
    clean_text = sanitize_text(text).replace("\r", "")
    max_words = layout.get("max_words_per_line", 4)
    max_lines = layout.get("max_lines", 2)
    
    # Basic wrapping
    wrapped_lines = textwrap.wrap(clean_text, width=max_words * 6) # Approximation: Arg is chars. Assuming avg word=5 chars + space.
    # Better approach might be to wrap by words explicitly, but textwrap.wrap works on chars. 
    # Let's try to fit 'max_words' roughly.
    # If we want strictly max_words, we need a custom wrapper, but textwrap is usually sufficient for visual wrapping.
    # Re-reading: "max_words_per_line" -> explicit count? 
    # Let's implement word-based wrapping if it's strictly "max_words".
    
    words = clean_text.split()
    lines = []
    current_line = []
    
    for word in words:
        current_line.append(word)
        if len(current_line) >= max_words:
            lines.append(" ".join(current_line))
            current_line = []
    if current_line:
        lines.append(" ".join(current_line))
        
    # Enforce max_lines (truncate for now, or just take first N)
    if len(lines) > max_lines:
        lines = lines[:max_lines]

    ass_text = "\\N".join(lines)
    
    # 4. Generate Content
    ass_content = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{font_size},{primary_color},&H000000FF,{outline_color},&H00000000,-1,0,0,0,100,100,0,0,1,{outline_width},{shadow_depth},{alignment},50,50,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:30.00,Default,,0,0,0,,{ass_text}
"""
    try:
        output_path.write_text(ass_content, encoding="utf-8")
    except Exception as e:
        logger.error(f"Failed to write ASS file: {e}")
        raise HTTPException(status_code=500, detail="Subtitle generation failed")

def apply_overlays(input_path: Path, output_path: Path, text: str | None, template_name: str | None):
    """
    Adds text overlay (ASS) and logo overlay (PNG) to the video.
    Order: Video -> Text -> Logo
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    font_dir = base_dir / "assets" / "fonts"
    
    # Load Template
    template_config = load_template(template_name or "default")
    
    # Prepare Inputs
    inputs = ["-i", str(input_path)]
    filter_chains = []
    
    # Chain Construction
    # Pipeline order: [0:v] -> gradient -> text -> logo -> output
    current_stream = "[0:v]"
    
    # 1. Gradient Overlay (pre-rendered PNG for performance)
    gradient_config = template_config.get("gradient", {})
    if gradient_config.get("enabled"):
        gradient_file = gradient_config.get("file")
        if gradient_file:
            gradient_path = base_dir / "assets" / gradient_file
            if gradient_path.exists():
                pos = gradient_config.get("position", "bottom")
                height = gradient_config.get("height", 600)
                
                # Add gradient as input
                gradient_stream_index = len(inputs) // 2
                inputs.extend(["-i", str(gradient_path)])
                
                # Calculate overlay position
                if pos == "bottom":
                    overlay_y = f"H-{height}"
                else:  # top
                    overlay_y = "0"
                
                # Overlay gradient onto video
                filter_chains.append(f"[0:v][{gradient_stream_index}:v]overlay=0:{overlay_y}[v_grad]")
                current_stream = "[v_grad]"
            else:
                logger.warning(f"Gradient file not found at {gradient_path}")
    
    # 2. Text Overlay (ASS)
    ass_file_path = None
    if text and template_config.get("text", {}).get("enabled", True):
        ass_file_path = base_dir / "outputs" / "captions.ass"
        generate_ass_file(text, ass_file_path, template_config)
        
        escaped_ass_path = str(ass_file_path).replace("\\", "/").replace(":", "\\:")
        escaped_fonts_dir = str(font_dir).replace("\\", "/").replace(":", "\\:")
        
        # Apply subtitles to current_stream -> [v_text]
        filter_chains.append(f"{current_stream}ass='{escaped_ass_path}':fontsdir='{escaped_fonts_dir}'[v_text]")
        current_stream = "[v_text]"
    
    # 3. Logo Overlay
    logo_config = template_config.get("logo", {})
    if logo_config.get("enabled"):
        logo_rel_path = logo_config.get("file")
        if logo_rel_path:
            logo_path = base_dir / "assets" / logo_rel_path
            if logo_path.exists():
                # Calculate index based on current number of inputs (each input adds 2 args: -i path)
                logo_stream_index = len(inputs) // 2
                inputs.extend(["-i", str(logo_path)])
                
                # Scale logo
                width = logo_config.get("width", 120)
                # Position logic
                pos = logo_config.get("position", "top-right")
                margin_top = logo_config.get("margin_top", 60)
                margin_right = logo_config.get("margin_right", 60)
                margin_left = logo_config.get("margin_left", 60)
                
                # Basic position logic
                if pos == "top-right":
                    overlay_expr = f"W-w-{margin_right}:{margin_top}"
                elif pos == "top-left":
                    overlay_expr = f"{margin_left}:{margin_top}"
                else:
                    overlay_expr = f"W-w-{margin_right}:{margin_top}"
                
                # Scale logo: [N:v] -> [logo_scaled]
                filter_chains.append(f"[{logo_stream_index}:v]scale={width}:-1[logo_scaled]")
                
                # Overlay: [current_stream][logo_scaled] -> [v_logo]
                filter_chains.append(f"{current_stream}[logo_scaled]overlay={overlay_expr}[v_logo]")
                current_stream = "[v_logo]"
            else:
                 logger.warning(f"Logo file not found at {logo_path}")

    # Final mapping
    # If the current stream is not [v_logo] (e.g. logo disabled), we just map it out, 
    # but filter_complex usually needs explicit chain termination/naming if we use labels.
    # Simpler approach: rename the last output label to [v_out] or just map current_stream.
    
    # Just output the current stream to output_path
    # But subprocess needs valid filter complex.
    
    # If filter_chains is empty, we just copy.
    if not filter_chains:
        # Just copy input to output
        filter_complex_args = []
        mapping_args = ["-c:v", "copy", "-c:a", "copy"] # Fast copy if no filters
    else:
        filter_complex_str = ";".join(filter_chains)
        filter_complex_args = ["-filter_complex", filter_complex_str, "-map", current_stream, "-map", "0:a"]
        mapping_args = ["-c:v", "libx264", "-c:a", "copy", "-pix_fmt", "yuv420p"]

    cmd = [
        "ffmpeg",
        "-y",
        *inputs,
        *filter_complex_args,
        *mapping_args,
        str(output_path)
    ]
    
    logger.info(f"Running FFmpeg Overlay: {' '.join(cmd)}")
    print(f"Running FFmpeg Overlay: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logger.error(f"FFmpeg Overlay failed: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Overlay processing failed: {error_msg}")
    finally:
        # Cleanup ASS file
        if ass_file_path and ass_file_path.exists():
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

    # 3. Apply Overlays (Logo + Text)
    # Even if no text is provided, we might have a logo to apply
    print(f"Applying overlays to {final_file}")
    apply_overlays(cropped_file, final_file, request.text, request.template)
    
    if not final_file.exists():
         raise HTTPException(status_code=500, detail="Final file with overlays was not created")
    
    final_output_path = "outputs/final.mp4"

    return {
        "status": "completed",
        "final_video": final_output_path
    }
