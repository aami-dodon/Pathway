import re
import os
import sys
import math
import yaml
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Python Package Imports (Poetry Managed)
import cairosvg
from moviepy import ImageClip
from moviepy.video.fx import FadeIn, FadeOut

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
ROOT_DIR = BASE_DIR.parent
THEME_CSS = ROOT_DIR / "packages" / "brand" / "theme.css"
METADATA_TS = ROOT_DIR / "packages" / "brand" / "src" / "metadata.ts"

ASSETS_DIR = BASE_DIR / "assets"
LOGO_DIR = ASSETS_DIR / "logo"
OVERLAYS_DIR = ASSETS_DIR / "overlays"
ANIM_DIR = ASSETS_DIR / "animations"
FONTS_DIR = ASSETS_DIR / "fonts"
TEMPLATES_DIR = BASE_DIR / "templates"

# Ensure directories exist
for d in [LOGO_DIR, OVERLAYS_DIR, ANIM_DIR, FONTS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

def oklch_to_hex(l, c, h):
    """Converts OKLCH to HEX string for SVG."""
    h_rad = math.radians(h)
    a_lab = c * math.cos(h_rad)
    b_lab = c * math.sin(h_rad)

    l_ = l + 0.3963377774 * a_lab + 0.2158037573 * b_lab
    m_ = l - 0.1055613458 * a_lab - 0.0638541728 * b_lab
    s_ = l - 0.0894841775 * a_lab - 1.2914855480 * b_lab

    l_lms, m_lms, s_lms = l_**3, m_**3, s_**3

    r_lin = +4.0767416621 * l_lms - 3.3077115913 * m_lms + 0.2309699292 * s_lms
    g_lin = -1.2684380046 * l_lms + 2.6097574011 * m_lms - 0.3413193965 * s_lms
    b_lin = -0.0041960863 * l_lms - 0.7034186147 * m_lms + 1.7076147010 * s_lms

    def gamma(x):
        return 12.92 * x if x <= 0.0031308 else 1.055 * (x**(1/2.4)) - 0.055

    r = max(0, min(255, round(gamma(r_lin) * 255)))
    g = max(0, min(255, round(gamma(g_lin) * 255)))
    b = max(0, min(255, round(gamma(b_lin) * 255)))

    return f"#{r:02x}{g:02x}{b:02x}"

def get_brand_data():
    """Extracts theme colors and metadata from packages"""
    data = {
        "primary_hex": "#fdc700",
        "primary_fg_hex": "#733e0a",
        "name": "Pathway",
        "iconPaths": [],
        "fontFamily": "Inter"
    }
    
    if THEME_CSS.exists():
        content = THEME_CSS.read_text()
        root_match = re.search(r":root\s*\{([^}]+)\}", content, re.DOTALL)
        if root_match:
            vars_text = root_match.group(1)
            primary_match = re.search(r"--primary:\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)", vars_text)
            if primary_match:
                l, c, h = map(float, primary_match.groups())
                data["primary_hex"] = oklch_to_hex(l, c, h)
            
            fg_match = re.search(r"--primary-foreground:\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)", vars_text)
            if fg_match:
                l, c, h = map(float, fg_match.groups())
                data["primary_fg_hex"] = oklch_to_hex(l, c, h)

    if METADATA_TS.exists():
        content = METADATA_TS.read_text()
        name_match = re.search(r"name:\s*'([^']+)'", content)
        if name_match: data["name"] = name_match.group(1)
        font_match = re.search(r"fontFamily:\s*'([^']+)'", content)
        if font_match: data["fontFamily"] = font_match.group(1)
        paths_match = re.search(r"export const iconPaths = \[([\s\S]+?)\]", content)
        if paths_match:
            paths_raw = paths_match.group(1)
            data["iconPaths"] = re.findall(r'"([^"]+)"', paths_raw)
            
    return data

def generate_logos(brand_data):
    """
    Generates all branded logos: 
    1. Square Icon (logo.png)
    2. Full Light (Text for light backgrounds)
    3. Full Dark (Text for dark backgrounds)
    """
    print("   🎨 Generating branding assets...")
    
    # Square Icon (logo.png)
    size = 1024
    padding = size / 8
    icon_source_size = 24
    icon_target_size = size - padding * 2
    scale_factor = icon_target_size / icon_source_size
    radius = size / 4
    
    paths_svg = "\n      ".join([f'<path d="{p}"/>' for p in brand_data["iconPaths"]])
    
    icon_svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <rect width="{size}" height="{size}" rx="{radius}" fill="{brand_data['primary_hex']}"/>
  <g transform="translate({padding}, {padding}) scale({scale_factor})">
    <g fill="none" stroke="{brand_data['primary_fg_hex']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      {paths_svg}
    </g>
  </g>
</svg>"""

    icon_path = LOGO_DIR / "logo.png"
    cairosvg.svg2png(bytestring=icon_svg.encode('utf-8'), write_to=str(icon_path))
    print(f"      ✅ Icon generated: logo.png")

    # Full Logos (Icon + Text)
    # Dimensions based on packages/brand/scripts/generate.js (scaled 10x for video)
    scale = 10
    total_h = 48 * scale
    gap = total_h / 4
    font_size = total_h * 0.66
    
    # Measure text width dynamically
    try:
        font_file_path = (FONTS_DIR / f"{brand_data['fontFamily']}-Bold.ttf").resolve()
        pill_font = ImageFont.truetype(str(font_file_path), int(font_size))
        text_bbox = pill_font.getbbox(brand_data['name'])
        text_width = text_bbox[2] - text_bbox[0]
    except Exception as e:
        print(f"      ⚠️  Dynamic measurement fallback: {e}")
        # Rough heuristic: ~0.6 width per character for bold sans-serif
        text_width = len(brand_data['name']) * font_size * 0.6
    
    # DYNAMIC PADDING: Margin at the end equal to the gap
    side_padding = gap
    total_w = total_h + gap + text_width + side_padding
    
    icon_pad = total_h * 0.125 # 6px at 48px
    inner_icon_size = total_h - icon_pad * 2
    inner_scale = inner_icon_size / 24
    
    def get_full_logo_svg(text_color):
        return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{total_w}" height="{total_h}" viewBox="0 0 {total_w} {total_h}">
  <rect width="{total_h}" height="{total_h}" rx="{total_h / 4}" fill="{brand_data['primary_hex']}"/>
  <g transform="translate({icon_pad}, {icon_pad}) scale({inner_scale})">
    <g fill="none" stroke="{brand_data['primary_fg_hex']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      {paths_svg}
    </g>
  </g>
  <text x="{total_h + gap}" y="{total_h / 2 + font_size / 2.5}" font-family="{brand_data['fontFamily']}, sans-serif" font-size="{font_size}" font-weight="700" fill="{text_color}">{brand_data['name']}</text>
</svg>"""

    # Light Version
    cairosvg.svg2png(bytestring=get_full_logo_svg("#1a1a1a").encode('utf-8'), write_to=str(LOGO_DIR / "logo-full-light.png"))
    # Dark Version
    cairosvg.svg2png(bytestring=get_full_logo_svg("#ffffff").encode('utf-8'), write_to=str(LOGO_DIR / "logo-full-dark.png"))
    
    print(f"      ✅ Full logos generated with dynamic width: {int(total_w)}px")
    return icon_path

def generate_gradients():
    """Creates Full HD 9:16 (1080x1920) gradient transparent overlays using Pillow"""
    print("   🎨 Generating portrait-optimized gradients...")
    
    # Bottom Gradient - Heavier for captions (lower 40%)
    bottom_h = 1920
    bottom_grad = Image.new("RGBA", (1080, bottom_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(bottom_grad)
    for y in range(bottom_h):
        # Start gradient at 60% of the screen height
        if y > bottom_h * 0.6:
            progress = (y - bottom_h * 0.6) / (bottom_h * 0.4)
            alpha = int(progress * 240) # Stronger shadows at the very bottom
            draw.line([(0, y), (1080, y)], fill=(0, 0, 0, alpha))
    bottom_grad.save(OVERLAYS_DIR / "gradient-bottom.png")
    
    # Top Gradient - Subtle for headlines (top 25%)
    top_grad = Image.new("RGBA", (1080, bottom_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(top_grad)
    for y in range(int(bottom_h * 0.25)):
        progress = 1 - (y / (bottom_h * 0.25))
        alpha = int(progress * 160)
        draw.line([(0, y), (1080, y)], fill=(0, 0, 0, alpha))
    top_grad.save(OVERLAYS_DIR / "gradient-top.png")
    
    print("   ✅ Portrait gradients generated (1080x1920)")

def generate_animations(brand_data):
    """Creates fancy, modern intro/outro animations using moviepy and brand assets"""
    print("🎬 Generating modern kinetic animations...")
    
    from moviepy import ColorClip, CompositeVideoClip
    
    # Paths
    logo_path = LOGO_DIR / "logo.png"
    full_logo_path = LOGO_DIR / "logo-full-dark.png"
    
    duration = 3
    primary_rgb = tuple(int(brand_data['primary_hex'].lstrip('#')[i:i+2], 16) for i in (0, 2, 4))

    # Load assets
    logo = ImageClip(str(logo_path)).resized(height=300).with_duration(duration)
    full_logo = ImageClip(str(full_logo_path)).resized(width=800).with_duration(duration)

    # --- INTRO: "The Premium Reveal" ---
    # Background: Solid dark with brand-colored flash
    bg = ColorClip(size=(1080, 1920), color=(10, 10, 10)).with_duration(duration)
    
    # Kinetic Logo: Fade and Slight Slide
    animated_logo = (logo
        .with_position(("center", "center"))
        .with_start(0.5)
        .with_effects([FadeIn(0.8)])
    )
    
    # Modern Element: Brand colored accent bar
    accent_bar = ColorClip(size=(300, 6), color=primary_rgb).with_duration(1.5).with_position(("center", 1120))
    accent_bar = accent_bar.with_start(1.0).with_effects([FadeIn(0.5)])
    
    intro_clip = CompositeVideoClip([bg, animated_logo, accent_bar])
    intro_clip.write_videofile(str(ANIM_DIR / "intro_overlay.webm"), fps=24, codec="libvpx-vp9", audio=False, logger=None)

    # --- OUTRO: "Social Identity" ---
    bg_outro = ColorClip(size=(1080, 1920), color=(5, 5, 5)).with_duration(duration)
    
    # Full logo enters with a clean fade
    animated_full_logo = (full_logo
        .with_position(("center", "center"))
        .with_effects([FadeIn(1.0), FadeOut(1.0)])
    )
    
    # Geometric flourish
    flourish = ColorClip(size=(500, 2), color=primary_rgb).with_duration(duration).with_position(("center", 1050))
    
    outro_clip = CompositeVideoClip([bg_outro, animated_full_logo, flourish.with_effects([FadeIn(1.5)])])
    outro_clip.write_videofile(str(ANIM_DIR / "outro_overlay.webm"), fps=24, codec="libvpx-vp9", audio=False, logger=None)
    
    print("   ✅ Premium 9:16 animations generated")

def ensure_fonts(brand_data):
    """Ensures that the required fonts are available"""
    print("🔡 Ensuring fonts...")
    font_name = brand_data["fontFamily"]
    font_file = FONTS_DIR / f"{font_name}-Bold.ttf"
    
    if not font_file.exists():
        font_urls = {
            "Inter": "https://github.com/google/fonts/raw/main/ofl/inter/static/Inter-Bold.ttf",
            "Roboto": "https://github.com/google/fonts/raw/main/apache/roboto/static/Roboto-Bold.ttf"
        }
        url = font_urls.get(font_name, font_urls["Inter"])
        try:
            subprocess.run(["curl", "-L", "-o", str(font_file), url], check=True, capture_output=True)
            print(f"   ✅ Downloaded: {font_file.name}")
        except Exception as e:
            print(f"   ⚠️  Failed to download font: {e}")
    else:
        print(f"   ✅ Font exists: {font_file.name}")
    return font_file

def update_templates(font_path):
    """Updates or creates the default.yaml template with brand-specific asset paths"""
    template_path = TEMPLATES_DIR / "default.yaml"
    
    config = {
        "logo": {"enabled": True, "position": "top-right", "margin_top": 60, "margin_right": 60, "width": 360},
        "intro": {"enabled": True, "duration": 3},
        "outro": {"enabled": True, "duration": 3},
        "music": {"enabled": True, "file": "mp3/style1.mp3", "duration": 60, "fade_out": 3},
        "gradient": {"enabled": True, "position": "bottom", "height": 600},
        "text": {
            "enabled": True,
            "typography": {
                "size": 64, "line_height": 1.2, "letter_spacing": 0, "align": "center", "color": "#FFFFFF",
                "outline": {"enabled": True, "color": "#000000", "width": 3},
                "shadow": {"enabled": True, "x": 0, "y": 4, "blur": 8, "color": "#000000"}
            },
            "layout": {"position": "bottom", "max_words_per_line": 4, "max_lines": 2, "margin_bottom": 200, "margin_top": 0}
        }
    }

    # Load existing if available to preserve custom values like mp3
    if template_path.exists():
        with open(template_path, "r") as f:
            existing = yaml.safe_load(f)
            if existing:
                # Simple merge
                for key in existing:
                    if key in config: config[key].update(existing[key])
                    else: config[key] = existing[key]

    # Update the dynamic asset paths
    config["text"]["typography"]["font"] = f"fonts/{font_path.name}"
    config["logo"]["file"] = "logo/logo.png"
    config["intro"]["file"] = "animations/intro_overlay.webm"
    config["outro"]["file"] = "animations/outro_overlay.webm"
    config["gradient"]["file"] = "overlays/gradient-bottom.png"
    
    with open(template_path, "w") as f:
        yaml.dump(config, f, default_flow_style=False)
    print("   ✅ Template default.yaml updated/created")

def main():
    print("🚀 Video Engine Dynamic Generator (V6 - Final Fixes)")
    print("------------------------------------------------------------")
    brand_data = get_brand_data()
    print(f"🎨 Brand: {brand_data['name']}")
    
    # 1. Ensure fonts FIRST so measurement works
    font_path = ensure_fonts(brand_data)
    
    # 2. Generate logos with dynamic width measurement
    logo_path = generate_logos(brand_data)
    
    # 3. Rest of the VFX
    generate_gradients()
    generate_animations(brand_data)
    update_templates(font_path)
    
    print("------------------------------------------------------------")
    print("✅ Assets generated successfully")

if __name__ == "__main__":
    main()
