from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import logging
import subprocess
import yt_dlp

router = APIRouter()
logger = logging.getLogger(__name__)

class SourceModel(BaseModel):
    type: str
    value: str

class AudioModel(BaseModel):
    type: str  # "local_file"
    value: str  # absolute path to MP3

class RenderRequest(BaseModel):
    source: SourceModel
    mode: str | None = None  # "music" for music video mode, None for default
    audio: AudioModel | None = None
    text: str | None = None
    template: str | None = None

def download_video(url: str, output_path: Path):
    """
    Downloads video using yt-dlp CLI to the specified output path.
    Uses subprocess to ensure --remote-components flag works.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    cookies_path = base_dir / "cookies.txt"
    
    cmd = [
        "yt-dlp",
        "--remote-components", "ejs:github",  # Enable JS challenge solving
        "-f", "18/best[ext=mp4]",              # Prefer format 18 (360p mp4 with audio)
        "-o", str(output_path),
        "--no-warnings",
        url
    ]
    
    if cookies_path.exists():
        cmd.extend(["--cookies", str(cookies_path)])
    
    logger.info(f"Running yt-dlp: {' '.join(cmd)}")
    print(f"Running yt-dlp: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logger.error(f"Download failed: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Download failed: {error_msg}")


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

import shutil
import json

def get_media_duration(file_path: Path) -> float:
    """
    Gets the duration of a media file (audio or video) in seconds using ffprobe.
    """
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json",
        str(file_path)
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        data = json.loads(result.stdout)
        return float(data["format"]["duration"])
    except Exception as e:
        logger.error(f"Failed to get duration for {file_path}: {e}")
        return 0.0

def loop_video_to_duration(input_path: Path, output_path: Path, target_duration: float):
    """
    Loops video to match target duration using FFmpeg stream_loop.
    """
    cmd = [
        "ffmpeg",
        "-y",
        "-stream_loop", "-1",  # Infinite loop
        "-i", str(input_path),
        "-t", str(target_duration),  # Trim to exact duration
        "-c:v", "libx264",
        "-an",  # No audio (we'll add voice later)
        "-pix_fmt", "yuv420p",
        str(output_path)
    ]
    
    logger.info(f"Running FFmpeg Loop: {' '.join(cmd)}")
    print(f"Running FFmpeg Loop: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logger.error(f"FFmpeg Loop failed: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Video looping failed: {error_msg}")

def prepend_intro(intro_path: Path, main_video_path: Path, output_path: Path):
    """
    Prepends an intro video to the main video using FFmpeg concat.
    Both videos must have same resolution and frame rate.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    concat_list = base_dir / "outputs" / "concat_list.txt"
    
    # Create concat list file
    with open(concat_list, "w") as f:
        f.write(f"file '{intro_path}'\n")
        f.write(f"file '{main_video_path}'\n")
    
    cmd = [
        "ffmpeg",
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list),
        "-c:v", "libx264",
        "-c:a", "copy",
        "-pix_fmt", "yuv420p",
        str(output_path)
    ]
    
    logger.info(f"Running FFmpeg Concat: {' '.join(cmd)}")
    print(f"Running FFmpeg Concat: {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logger.error(f"FFmpeg Concat failed: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Intro prepend failed: {error_msg}")
    finally:
        if concat_list.exists():
            concat_list.unlink()

def transcribe_audio(audio_path: Path) -> list:
    """
    Transcribes audio using Whisper and returns word-level timestamps.
    Returns list of {"word": str, "start": float, "end": float}
    """
    try:
        import whisper
    except ImportError:
        logger.error("Whisper not installed")
        raise HTTPException(status_code=500, detail="Whisper not installed")
    
    logger.info(f"Transcribing audio: {audio_path}")
    print(f"Transcribing audio: {audio_path}")
    
    # Load model (base is a good balance of speed/accuracy)
    model = whisper.load_model("base")
    
    # Transcribe with word timestamps
    result = model.transcribe(str(audio_path), word_timestamps=True)
    
    words = []
    for segment in result.get("segments", []):
        for word_data in segment.get("words", []):
            words.append({
                "word": word_data["word"].strip(),
                "start": word_data["start"],
                "end": word_data["end"]
            })
    
    logger.info(f"Transcribed {len(words)} words")
    print(f"Transcribed {len(words)} words")
    return words

def generate_word_highlighted_ass(words: list, output_path: Path, template: dict):
    """
    Generates ASS subtitles with word-level highlighting (2025 Instagram style).
    Active word is white, inactive words are dimmed gray.
    """
    text_config = template.get("text", {})
    typography = text_config.get("typography", {})
    layout = text_config.get("layout", {})
    
    font_file = typography.get("font", "fonts/Roboto-Bold.ttf")
    font_name = Path(font_file).stem
    font_size = typography.get("size", 64)
    
    pos = layout.get("position", "bottom")
    margin_bottom = layout.get("margin_bottom", 200)
    margin_top = layout.get("margin_top", 60)
    max_words = layout.get("max_words_per_line", 4)
    max_lines = layout.get("max_lines", 2)
    
    # Alignment
    if pos == "top":
        alignment = 8
        margin_v = margin_top
    elif pos == "center":
        alignment = 5
        margin_v = 0
    else:
        alignment = 2
        margin_v = margin_bottom
    
    # Build dialogue events
    # Group words into chunks (max_words per line, max_lines lines)
    words_per_screen = max_words * max_lines
    events = []
    
    for i in range(0, len(words), words_per_screen):
        chunk = words[i:i + words_per_screen]
        if not chunk:
            continue
        
        chunk_start = chunk[0]["start"]
        chunk_end = chunk[-1]["end"]
        
        # For each word in chunk, create a dialogue event with that word highlighted
        for j, active_word in enumerate(chunk):
            word_start = active_word["start"]
            word_end = active_word["end"]
            
            # Build the styled text with active word white, others dimmed
            styled_parts = []
            for k, w in enumerate(chunk):
                if k == j:
                    # Active word: white, bold
                    styled_parts.append(r"{\c&HFFFFFF&}" + w["word"])
                else:
                    # Inactive: gray/dimmed
                    styled_parts.append(r"{\c&H888888&}" + w["word"])
            
            # Insert line breaks based on max_words
            lines = []
            for idx in range(0, len(styled_parts), max_words):
                line_words = styled_parts[idx:idx + max_words]
                lines.append(" ".join(line_words))
            
            text_content = r"\N".join(lines[:max_lines])
            
            # Format times
            def fmt_time(t):
                h = int(t // 3600)
                m = int((t % 3600) // 60)
                s = t % 60
                return f"{h}:{m:02d}:{s:05.2f}"
            
            events.append(f"Dialogue: 0,{fmt_time(word_start)},{fmt_time(word_end)},Default,,0,0,0,,{text_content}")
    
    # ASS file content
    ass_content = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{font_size},&H00FFFFFF,&H000000FF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,3,2,{alignment},50,50,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ass_content += "\n".join(events)
    
    try:
        output_path.write_text(ass_content, encoding="utf-8")
    except Exception as e:
        logger.error(f"Failed to write word-highlighted ASS: {e}")
        raise HTTPException(status_code=500, detail="Subtitle generation failed")

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
    Downloads, crops, loops to audio, adds overlays, and muxes voice-over.
    Pipeline: download -> crop -> loop (if audio) -> gradient -> subtitles -> logo -> mux audio -> final.mp4
    """
    # check ffmpeg first
    check_ffmpeg()

    # Log the received payload
    logger.info(f"Received render payload: {request.dict()}")
    print(f"Received render payload: {request.dict()}")

    if request.source.type != "url":
        raise HTTPException(status_code=400, detail="Only 'url' source type is supported")

    # Route to music video mode if specified
    if request.mode == "music":
        return await render_music_video(request)

    # Define output directory and files
    base_dir = Path(__file__).resolve().parent.parent.parent
    output_dir = base_dir / "outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    input_file = output_dir / "input.mp4"
    cropped_file = output_dir / "output.mp4"
    looped_file = output_dir / "looped.mp4"
    overlayed_file = output_dir / "overlayed.mp4"
    final_file = output_dir / "final.mp4"
    voice_file = output_dir / "voice.mp3"
    
    print(f"Downloading from {request.source.value} to {input_file}")
    
    # 1. Download video
    download_video(request.source.value, input_file)

    if not input_file.exists():
         raise HTTPException(status_code=500, detail="File was not created after download")
    
    # 2. Crop/Scale video (no duration limit when audio is provided)
    print(f"Processing (cropping) video to {cropped_file}")
    
    if request.audio:
        # Crop without duration limit
        filter_complex = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
        cmd = [
            "ffmpeg", "-y",
            "-i", str(input_file),
            "-vf", filter_complex,
            "-c:v", "libx264",
            "-an",  # Strip audio, we'll use voice-over
            "-r", "30",
            "-pix_fmt", "yuv420p",
            str(cropped_file)
        ]
        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode() if e.stderr else str(e)
            logger.error(f"FFmpeg Crop (audio mode) failed: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Video cropping failed: {error_msg}")
    else:
        process_video(input_file, cropped_file)

    if not cropped_file.exists():
        raise HTTPException(status_code=500, detail="Cropped file was not created")

    # === AUDIO-DRIVEN WORKFLOW ===
    if request.audio and request.audio.type == "local_file":
        audio_source = Path(request.audio.value)
        
        if not audio_source.exists():
            raise HTTPException(status_code=400, detail=f"Audio file not found: {audio_source}")
        
        # Copy audio to outputs
        shutil.copy(audio_source, voice_file)
        print(f"Copied audio to {voice_file}")
        
        # Get durations
        audio_duration = get_media_duration(voice_file)
        video_duration = get_media_duration(cropped_file)
        
        print(f"Audio duration: {audio_duration}s, Video duration: {video_duration}s")
        
        # 3. Loop video to match audio duration
        if video_duration < audio_duration:
            print(f"Looping video to match audio duration ({audio_duration}s)")
            loop_video_to_duration(cropped_file, looped_file, audio_duration)
        else:
            # Trim video to audio duration
            cmd = [
                "ffmpeg", "-y",
                "-i", str(cropped_file),
                "-t", str(audio_duration),
                "-c:v", "copy",
                "-an",
                str(looped_file)
            ]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        
        if not looped_file.exists():
            raise HTTPException(status_code=500, detail="Looped file was not created")
        
        # 4. Transcribe audio with Whisper
        print("Transcribing audio with Whisper...")
        words = transcribe_audio(voice_file)
        
        # 5. Generate word-highlighted ASS subtitles
        template_config = load_template(request.template or "default")
        ass_file = output_dir / "captions.ass"
        generate_word_highlighted_ass(words, ass_file, template_config)
        
        # 6. Apply overlays (gradient -> subtitles -> logo) without audio
        print(f"Applying overlays to {overlayed_file}")
        apply_overlays_audio_mode(looped_file, overlayed_file, ass_file, request.template)
        
        if not overlayed_file.exists():
            raise HTTPException(status_code=500, detail="Overlayed file was not created")
        
        # 7. Mux voice.mp3 as primary audio
        print(f"Muxing audio to {final_file}")
        cmd = [
            "ffmpeg", "-y",
            "-i", str(overlayed_file),
            "-i", str(voice_file),
            "-map", "0:v",  # Video from overlayed
            "-map", "1:a",  # Audio from voice
            "-c:v", "copy",
            "-c:a", "aac",  # Re-encode to AAC for compatibility
            "-shortest",
            str(final_file)
        ]
        
        logger.info(f"Running FFmpeg Mux: {' '.join(cmd)}")
        print(f"Running FFmpeg Mux: {' '.join(cmd)}")
        
        try:
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.decode() if e.stderr else str(e)
            logger.error(f"FFmpeg Mux failed: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Audio muxing failed: {error_msg}")
        
        # Cleanup
        if ass_file.exists():
            ass_file.unlink()
        
    else:
        # === LEGACY TEXT MODE ===
        print(f"Applying overlays to {final_file}")
        apply_overlays(cropped_file, final_file, request.text, request.template)
    
    if not final_file.exists():
         raise HTTPException(status_code=500, detail="Final file was not created")
    
    # 8. Prepend intro animation if enabled
    template_config = load_template(request.template or "default")
    intro_config = template_config.get("intro", {})
    if intro_config.get("enabled"):
        intro_rel_path = intro_config.get("file")
        if intro_rel_path:
            intro_path = base_dir / "assets" / intro_rel_path
            if intro_path.exists():
                print(f"Prepending intro from {intro_path}")
                with_intro_file = output_dir / "with_intro.mp4"
                prepend_intro(intro_path, final_file, with_intro_file)
                
                if with_intro_file.exists():
                    # Replace final with intro version
                    final_file.unlink()
                    with_intro_file.rename(final_file)
                else:
                    logger.warning("Intro prepend failed, using video without intro")
            else:
                logger.warning(f"Intro file not found: {intro_path}")
    
    final_output_path = "outputs/final.mp4"

    return {
        "status": "completed",
        "final_video": final_output_path
    }


def apply_overlays_audio_mode(input_path: Path, output_path: Path, ass_file: Path, template_name: str | None):
    """
    Applies gradient, ASS subtitles, and logo overlays for audio-driven mode.
    No audio mapping in this step.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    font_dir = base_dir / "assets" / "fonts"
    
    template_config = load_template(template_name or "default")
    
    inputs = ["-i", str(input_path)]
    filter_chains = []
    current_stream = "[0:v]"
    
    # 1. Gradient Overlay
    gradient_config = template_config.get("gradient", {})
    if gradient_config.get("enabled"):
        gradient_file = gradient_config.get("file")
        if gradient_file:
            gradient_path = base_dir / "assets" / gradient_file
            if gradient_path.exists():
                pos = gradient_config.get("position", "bottom")
                height = gradient_config.get("height", 600)
                
                gradient_stream_index = len(inputs) // 2
                inputs.extend(["-i", str(gradient_path)])
                
                if pos == "bottom":
                    overlay_y = f"H-{height}"
                else:
                    overlay_y = "0"
                
                filter_chains.append(f"[0:v][{gradient_stream_index}:v]overlay=0:{overlay_y}[v_grad]")
                current_stream = "[v_grad]"
    
    # 2. Text Overlay (ASS from pre-generated file)
    if ass_file.exists():
        escaped_ass_path = str(ass_file).replace("\\", "/").replace(":", "\\:")
        escaped_fonts_dir = str(font_dir).replace("\\", "/").replace(":", "\\:")
        
        filter_chains.append(f"{current_stream}ass='{escaped_ass_path}':fontsdir='{escaped_fonts_dir}'[v_text]")
        current_stream = "[v_text]"
    
    # 3. Logo Overlay
    logo_config = template_config.get("logo", {})
    if logo_config.get("enabled"):
        logo_rel_path = logo_config.get("file")
        if logo_rel_path:
            logo_path = base_dir / "assets" / logo_rel_path
            if logo_path.exists():
                logo_stream_index = len(inputs) // 2
                inputs.extend(["-i", str(logo_path)])
                
                width = logo_config.get("width", 120)
                pos = logo_config.get("position", "top-right")
                margin_top = logo_config.get("margin_top", 60)
                margin_right = logo_config.get("margin_right", 60)
                margin_left = logo_config.get("margin_left", 60)
                
                if pos == "top-right":
                    overlay_expr = f"W-w-{margin_right}:{margin_top}"
                elif pos == "top-left":
                    overlay_expr = f"{margin_left}:{margin_top}"
                else:
                    overlay_expr = f"W-w-{margin_right}:{margin_top}"
                
                filter_chains.append(f"[{logo_stream_index}:v]scale={width}:-1[logo_scaled]")
                filter_chains.append(f"{current_stream}[logo_scaled]overlay={overlay_expr}[v_logo]")
                current_stream = "[v_logo]"
    
    # Build command
    if not filter_chains:
        filter_complex_args = []
        mapping_args = ["-c:v", "copy"]
    else:
        filter_complex_str = ";".join(filter_chains)
        filter_complex_args = ["-filter_complex", filter_complex_str, "-map", current_stream]
        mapping_args = ["-c:v", "libx264", "-pix_fmt", "yuv420p"]
    
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        *filter_complex_args,
        "-an",  # No audio in this step
        *mapping_args,
        str(output_path)
    ]
    
    logger.info(f"Running FFmpeg Overlay (audio mode): {' '.join(cmd)}")
    print(f"Running FFmpeg Overlay (audio mode): {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logger.error(f"FFmpeg Overlay (audio mode) failed: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Overlay processing failed: {error_msg}")


async def render_music_video(request: RenderRequest):
    """
    Music video mode - Complete pipeline:
    1. Download YouTube video → Strip audio
    2. Loop/trim to 60s (match music)
    3. Overlay gradient (bottom dark)
    4. Generate subtitles from voice.mp3 (Whisper)
    5. Overlay subtitles
    6. Overlay intro animation (first 3s)
    7. Overlay outro animation (last 3s)
    8. Overlay logo (top-right)
    9. Mix audio: style.mp3 + voice.mp3 with fade out
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    output_dir = base_dir / "outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    template_config = load_template(request.template or "default")
    music_config = template_config.get("music", {})
    intro_config = template_config.get("intro", {})
    outro_config = template_config.get("outro", {})
    gradient_config = template_config.get("gradient", {})
    logo_config = template_config.get("logo", {})
    
    # File paths
    input_file = output_dir / "input.mp4"
    cropped_file = output_dir / "output.mp4"
    looped_file = output_dir / "looped.mp4"
    with_gradient_file = output_dir / "with_gradient.mp4"
    with_subs_file = output_dir / "with_subs.mp4"
    with_animations_file = output_dir / "with_animations.mp4"
    with_logo_file = output_dir / "with_logo.mp4"
    final_file = output_dir / "final.mp4"
    voice_file = output_dir / "voice.mp3"
    ass_file = output_dir / "captions.ass"
    
    # 1. Handle Audio/Voice input first to determine duration
    if request.audio and request.audio.type == "local_file":
        audio_source = Path(request.audio.value)
        if audio_source.exists():
            shutil.copy(audio_source, voice_file)
            print(f"Copied audio to {voice_file}")
    
    # Determine target duration
    if voice_file.exists():
        target_duration = get_media_duration(voice_file)
        print(f"Using voice.mp3 duration: {target_duration}s")
    else:
        target_duration = music_config.get("duration", 60)
        print(f"Using template music duration: {target_duration}s")

    # Get settings
    music_file = base_dir / "assets" / music_config.get("file", "mp3/style1.mp3")
    fade_out_duration = music_config.get("fade_out", 3)
    
    print(f"=== MUSIC VIDEO MODE ===")
    print(f"Music: {music_file}")
    print(f"Final Target duration: {target_duration}s")
    
    # 2. Download video
    print(f"2. Downloading from {request.source.value}")
    download_video(request.source.value, input_file)
    
    if not input_file.exists():
        raise HTTPException(status_code=500, detail="Download failed")
    
    # 2. Crop to 9:16 (strip audio)
    print(f"2. Cropping to 9:16 (stripping audio)...")
    filter_str = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920"
    cmd = [
        "ffmpeg", "-y",
        "-i", str(input_file),
        "-vf", filter_str,
        "-c:v", "libx264",
        "-an",
        "-r", "30",
        "-pix_fmt", "yuv420p",
        str(cropped_file)
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    
    # 3. Loop video to target duration
    video_duration = get_media_duration(cropped_file)
    print(f"3. Video: {video_duration}s -> Target: {target_duration}s")
    
    if video_duration < target_duration:
        loop_video_to_duration(cropped_file, looped_file, target_duration)
    else:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(cropped_file),
            "-t", str(target_duration),
            "-c:v", "copy", "-an",
            str(looped_file)
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    
    # 4. Overlay gradient (bottom dark)
    print(f"4. Overlaying gradient...")
    gradient_file = gradient_config.get("file")
    if gradient_config.get("enabled") and gradient_file:
        gradient_path = base_dir / "assets" / gradient_file
        if gradient_path.exists():
            height = gradient_config.get("height", 600)
            cmd = [
                "ffmpeg", "-y",
                "-i", str(looped_file),
                "-i", str(gradient_path),
                "-filter_complex", f"[0:v][1:v]overlay=0:H-{height}[v_out]",
                "-map", "[v_out]",
                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                str(with_gradient_file)
            ]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        else:
            shutil.copy(looped_file, with_gradient_file)
    else:
        shutil.copy(looped_file, with_gradient_file)
    
    # 5. Generate subtitles from voice.mp3 (if exists)
    print(f"5. Processing subtitles...")
    if voice_file.exists():
        print(f"   Transcribing voice.mp3...")
        words = transcribe_audio(voice_file)
        generate_word_highlighted_ass(words, ass_file, template_config)
        
        # Burn subtitles
        font_dir = base_dir / "assets" / "fonts"
        escaped_ass = str(ass_file).replace("\\", "/").replace(":", "\\:")
        escaped_fonts = str(font_dir).replace("\\", "/").replace(":", "\\:")
        
        cmd = [
            "ffmpeg", "-y",
            "-i", str(with_gradient_file),
            "-vf", f"ass='{escaped_ass}':fontsdir='{escaped_fonts}'",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            str(with_subs_file)
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    else:
        print(f"   No voice.mp3 found, skipping subtitles")
        shutil.copy(with_gradient_file, with_subs_file)
    
    # 6. Overlay intro/outro animations
    print(f"6. Overlaying intro/outro animations...")
    intro_file = base_dir / "assets" / intro_config.get("file", "animations/intro_overlay.mov")
    outro_file = base_dir / "assets" / outro_config.get("file", "animations/outro_overlay.mov")
    intro_duration = intro_config.get("duration", 3)
    outro_duration = outro_config.get("duration", 3)
    outro_start = target_duration - outro_duration
    
    filter_parts = []
    inputs = ["-i", str(with_subs_file)]
    current = "[0:v]"
    
    if intro_config.get("enabled") and intro_file.exists():
        inputs.extend(["-i", str(intro_file)])
        filter_parts.append(f"{current}[1:v]overlay=0:0:enable='between(t,0,{intro_duration})'[v_intro]")
        current = "[v_intro]"
    
    if outro_config.get("enabled") and outro_file.exists():
        idx = len(inputs) // 2
        inputs.extend(["-i", str(outro_file)])
        filter_parts.append(f"{current}[{idx}:v]overlay=0:0:enable='gte(t,{outro_start})'[v_outro]")
        current = "[v_outro]"
    
    if filter_parts:
        cmd = [
            "ffmpeg", "-y",
            *inputs,
            "-filter_complex", ";".join(filter_parts),
            "-map", current,
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-t", str(target_duration),
            str(with_animations_file)
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    else:
        shutil.copy(with_subs_file, with_animations_file)
    
    # 7. Overlay logo (top-right)
    print(f"7. Overlaying logo...")
    logo_file = logo_config.get("file")
    if logo_config.get("enabled") and logo_file:
        logo_path = base_dir / "assets" / logo_file
        if logo_path.exists():
            width = logo_config.get("width", 360)
            margin_top = logo_config.get("margin_top", 60)
            margin_right = logo_config.get("margin_right", 60)
            
            cmd = [
                "ffmpeg", "-y",
                "-i", str(with_animations_file),
                "-i", str(logo_path),
                "-filter_complex", f"[1:v]scale={width}:-1[logo];[0:v][logo]overlay=W-w-{margin_right}:{margin_top}[v_out]",
                "-map", "[v_out]",
                "-c:v", "libx264", "-pix_fmt", "yuv420p",
                str(with_logo_file)
            ]
            subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
        else:
            shutil.copy(with_animations_file, with_logo_file)
    else:
        shutil.copy(with_animations_file, with_logo_file)
    
    # 8. Mix audio: style.mp3 (background) + voice.mp3 (voice-over) with fade out
    print(f"8. Mixing audio (music + voice) with fade out...")
    fade_start = target_duration - fade_out_duration
    
    if voice_file.exists():
        # Mix both audio tracks, loop music if needed
        cmd = [
            "ffmpeg", "-y",
            "-i", str(with_logo_file),
            "-stream_loop", "-1", "-i", str(music_file),  # Loop background music
            "-i", str(voice_file),
            "-filter_complex",
            f"[1:a]volume=0.3[music];[2:a]volume=1.0[voice];[music][voice]amix=inputs=2:duration=shortest[mixed];[mixed]afade=t=out:st={fade_start}:d={fade_out_duration}[a_out]",
            "-map", "0:v",
            "-map", "[a_out]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-t", str(target_duration),
            str(final_file)
        ]
    else:
        # Just music, loop if needed
        cmd = [
            "ffmpeg", "-y",
            "-i", str(with_logo_file),
            "-stream_loop", "-1", "-i", str(music_file),
            "-filter_complex", f"[1:a]afade=t=out:st={fade_start}:d={fade_out_duration}[a_fade]",
            "-map", "0:v",
            "-map", "[a_fade]",
            "-c:v", "copy",
            "-c:a", "aac",
            "-t", str(target_duration),
            str(final_file)
        ]
    
    print(f"   Running FFmpeg audio mix...")
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    except subprocess.CalledProcessError as e:
        error_msg = e.stderr.decode() if e.stderr else str(e)
        logger.error(f"FFmpeg audio mix failed: {error_msg}")
        raise HTTPException(status_code=500, detail=f"Audio mixing failed: {error_msg}")
    
    # Cleanup ASS file
    if ass_file.exists():
        ass_file.unlink()
    
    if not final_file.exists():
        raise HTTPException(status_code=500, detail="Final file was not created")
    
    print(f"=== MUSIC VIDEO COMPLETE ===")
    
    return {
        "status": "completed",
        "mode": "music",
        "duration": target_duration,
        "has_voice": voice_file.exists(),
        "final_video": "outputs/final.mp4"
    }


def apply_music_video_overlays(input_path: Path, output_path: Path, template_config: dict):
    """
    Applies gradient and logo overlays for music video mode.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    
    inputs = ["-i", str(input_path)]
    filter_chains = []
    current_stream = "[0:v]"
    
    # Gradient overlay
    gradient_config = template_config.get("gradient", {})
    if gradient_config.get("enabled"):
        gradient_file = gradient_config.get("file")
        if gradient_file:
            gradient_path = base_dir / "assets" / gradient_file
            if gradient_path.exists():
                pos = gradient_config.get("position", "bottom")
                height = gradient_config.get("height", 600)
                
                gradient_idx = len(inputs) // 2
                inputs.extend(["-i", str(gradient_path)])
                
                if pos == "bottom":
                    overlay_y = f"H-{height}"
                else:
                    overlay_y = "0"
                
                filter_chains.append(f"[0:v][{gradient_idx}:v]overlay=0:{overlay_y}[v_grad]")
                current_stream = "[v_grad]"
    
    # Logo overlay
    logo_config = template_config.get("logo", {})
    if logo_config.get("enabled"):
        logo_file = logo_config.get("file")
        if logo_file:
            logo_path = base_dir / "assets" / logo_file
            if logo_path.exists():
                logo_idx = len(inputs) // 2
                inputs.extend(["-i", str(logo_path)])
                
                width = logo_config.get("width", 360)
                margin_top = logo_config.get("margin_top", 60)
                margin_right = logo_config.get("margin_right", 60)
                
                filter_chains.append(f"[{logo_idx}:v]scale={width}:-1[logo_scaled]")
                filter_chains.append(f"{current_stream}[logo_scaled]overlay=W-w-{margin_right}:{margin_top}[v_logo]")
                current_stream = "[v_logo]"
    
    if filter_chains:
        filter_complex_str = ";".join(filter_chains)
        cmd = [
            "ffmpeg", "-y",
            *inputs,
            "-filter_complex", filter_complex_str,
            "-map", current_stream,
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            str(output_path)
        ]
    else:
        cmd = [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-c:v", "copy",
            str(output_path)
        ]
    
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
