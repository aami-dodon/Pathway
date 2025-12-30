
import re

def oklch_to_rgb(l, c, h):
    """
    Approximation of OKLCH to RGB conversion.
    This is complex; for a simple "tint", we can try to approximate or use a library.
    However, without external deps like 'colormath', it's hard to be exact.
    
    Given the constraint of "standardizing on FFmpeg" and minimal deps, 
    we might want to support OKLCH if FFmpeg supports it (newer versions do), 
    or use a robust fallback / simple approximation.
    
    Let's use a known approximation or simplified conversion for the sake of 
    not introducing heavy dependencies like numpy/scipy just for a tint.
    
    Actually, let's look for a simpler approach:
    If the theme is OKLCH, maybe we can just extract the Hue and guess?
    No, that's brittle.
    
    Let's try to find a hex code in the css if available? No, it's all OKLCH.
    
    Let's implement a basic OKLCH -> RGB converter.
    """
    # Convert OKLCH to Linear RGB
    # We will use the OKLCH -> OKLAB -> Linear sRGB pipeline
    # h is likely in degrees in CSS
    
    import math
    h_rad = math.radians(h)
    
    # OKLCH to OKLAB
    L = l
    a = c * math.cos(h_rad)
    b = c * math.sin(h_rad)
    
    # OKLAB to Linear RGB (approximate matrix)
    # https://bottosson.github.io/posts/oklab/
    
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b

    l_ = l_**3
    m_ = m_**3
    s_ = s_**3

    r = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_
    g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_
    bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_
    
    # Clip and sRGB transfer
    def transfer(v):
        v = max(0, min(1, v))
        return 12.92 * v if v <= 0.0031308 else 1.055 * (v ** (1/2.4)) - 0.055

    return (
        int(transfer(r) * 255),
        int(transfer(g) * 255),
        int(transfer(bl) * 255)
    )

def get_theme_colors(theme_path):
    DEFAULTS = {
        "primary": "#FCC01E",
        "secondary": "#10b981",
        "accent": "#8b5cf6"
    }
    
    try:
        if not theme_path.exists():
            return DEFAULTS
            
        content = theme_path.read_text()
        
        colors = {}
        # Find colors in .dark block first
        dark_match = re.search(r'\.dark\s*\{([^}]+)\}', content, re.DOTALL)
        block = dark_match.group(1) if dark_match else content
        
        for name in ["primary", "secondary", "accent", "background"]:
            match = re.search(fr'--{name}:\s*oklch\(([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\)', block)
            if match:
                l, c, h = map(float, match.groups())
                r, g, b = oklch_to_rgb(l, c, h)
                colors[name] = f"#{r:02x}{g:02x}{b:02x}".upper()
            elif name in DEFAULTS:
                colors[name] = DEFAULTS[name]
            else:
                colors[name] = "#000000" # Fallback black for background
        
        return colors
        
    except Exception as e:
        print(f"⚠️ Failed to parse theme colors: {e}")
        return DEFAULTS

def get_theme_color(theme_path):
    """Compatibility shim for single primary color."""
    colors = get_theme_colors(theme_path)
    return colors.get("primary", "#FCC01E")
