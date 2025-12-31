/**
 * Utility functions for brand package
 */

/**
 * Convert OKLCH color string to Hex string
 * format: oklch(L C H)
 */
export function oklchToHex(oklch: string): string | null {
    if (!oklch) return null;
    if (oklch.startsWith('#')) return oklch;

    // Handle alpha channel if present
    const cleanOklch = oklch.split('/')[0].trim();
    const match = cleanOklch.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
    if (!match) return null;

    const L = parseFloat(match[1]);
    const C = parseFloat(match[2]);
    const H = parseFloat(match[3]);

    const h = H * Math.PI / 180;
    const a = C * Math.cos(h);
    const b = C * Math.sin(h);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    const l = l_ ** 3;
    const m = m_ ** 3;
    const s = s_ ** 3;

    let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    const gamma = (x: number) => x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    r = Math.round(Math.max(0, Math.min(1, gamma(r))) * 255);
    g = Math.round(Math.max(0, Math.min(1, gamma(g))) * 255);
    bl = Math.round(Math.max(0, Math.min(1, gamma(bl))) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}
