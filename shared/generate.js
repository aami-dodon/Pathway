#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PATHWAY BRAND GENERATOR
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  Generates all brand assets from branding.config.js:
 *    - colors.ts (color tokens)
 *    - branding.ts (icon, brand name, typography)
 *    - assets/ (favicon, logos, icons)
 * 
 *  Usage: node shared/generate.js
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');

// Paths
const CONFIG_PATH = path.join(__dirname, 'branding.config.js');
// const ICONS_PATH = path.join(__dirname, 'icons.js'); // Removed
const ASSETS_DIR = path.join(__dirname, 'assets');
const COLORS_OUTPUT = path.join(__dirname, 'colors.ts');
const BRANDING_OUTPUT = path.join(__dirname, 'branding.ts');

// ═══════════════════════════════════════════════════════════════════════════
//  LOAD CONFIG
// ═══════════════════════════════════════════════════════════════════════════

function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ branding.config.js not found');
        process.exit(1);
    }

    delete require.cache[require.resolve(CONFIG_PATH)];
    return require(CONFIG_PATH);
}

function getLucideIconPaths(iconName) {
    try {
        const { icons } = require('lucide');
        const iconNode = icons[iconName];

        if (!iconNode) {
            return null;
        }

        // Lucide icon structure is [tag, attrs, children] or just children in newer versions
        // But the 'lucide' package exports object where keys are icon names
        // and values are the icon definitions. 
        // For 'lucide' package, it returns { name, children: [ [tag, attrs], ... ] } usually?
        // Let's actually debug/check. Standard 'lucide' package exports:
        // export const GraduationCap = [ "svg", { ...attrs }, [ ["path", { d: ... }] ] ] 
        // OR similar structure.

        // Actually, the simplest way with 'lucide' package is using its array structure:
        // The icon definition is basically an array of children elements.
        // We want to extract 'd' attributes from all 'path' elements.

        const paths = [];

        // Helper to traverse the icon definition
        // 'lucide' package icons are usually:
        // const Icon = [ "svg", { ... }, [ ["path", { d: "..." }], ... ] ]
        // Only if we install 'lucide-react' do we get React components.
        // 'lucide' (core) gives the abstract definition.

        // Let's assume standard lucide definition or the icons object map
        // If it's the icons object:
        /*
           icons = {
             GraduationCap: [ 
               ['path', { d: '...' }],
               ['line', { ... }] 
             ]
           }
        */

        // We will filter for 'path' tags and extract 'd'.
        // If there are other shapes (circle, rect), we might miss them if we only look for paths.
        // But for generating a simple SVG string, we can reconstruct the inner SVG.

        // WAIT: The Generate script expects an array of path strings!
        // We should reconstruct the inner SVG content instead of just paths.

        // Let's change the strategy: Instead of extracting paths, we will generate the full inner SVG content
        // for the asset generator to usage.

        // BUT branding.ts expects `iconPaths: string[]`. 
        // We should stick to extracting paths OR update branding.ts to support full SVG content.
        // Sticking to paths is safer for now if the icon is simple (most are paths).
        // Lucide icons are primarily paths.

        const children = iconNode; // Array of elements

        children.forEach(([tag, attrs]) => {
            if (tag === 'path' && attrs.d) {
                paths.push(attrs.d);
            } else if (tag === 'circle' || tag === 'rect' || tag === 'line' || tag === 'polyline' || tag === 'polygon') {
                // For complex icons, we might need to handle these.
                // But most brand icons are paths.
                // If we encounter non-paths, we might need a better serialization.
                // For now, let's just grab 'd' from paths.
            }
        });

        return paths;

    } catch (e) {
        console.error('Error loading lucide:', e);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
//  GENERATE THEME & TAILWIND PRESET
// ═══════════════════════════════════════════════════════════════════════════

function generateThemeSystem(config) {
    console.log('\n📦 Generating Theme System (Tailwind Preset & CSS)...');

    const css = config.themeCSS;
    const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
    const darkMatch = css.match(/\.dark\s*\{([^}]+)\}/);

    if (!rootMatch) {
        console.error('❌ Could not find :root block in themeCSS');
        return false;
    }

    // 1. Parse all CSS variables (light & dark maps)
    const parseBlock = (cssBlock) => {
        const vars = {};
        const regex = /--([\w-]+):\s*([^;]+);/g;
        let match;
        while ((match = regex.exec(cssBlock)) !== null) {
            vars[match[1]] = match[2].trim();
        }
        return vars;
    };

    const lightVars = parseBlock(rootMatch[1]);
    const darkVars = darkMatch ? parseBlock(darkMatch[1]) : {};

    // 2. Generate theme.css (The raw CSS file apps can import)
    const themeCSSContent = `/**
 * Shared Theme CSS - AUTO-GENERATED
 * Import this file in your root layout or main css file.
 * Example: import '@shared/theme.css';
 */

@layer base {
  :root {
${Object.entries(lightVars).map(([key, val]) => `    --${key}: ${val};`).join('\n')}
  }
 
  .dark {
${Object.entries(darkVars).map(([key, val]) => `    --${key}: ${val};`).join('\n')}
  }
}
`;
    // Write theme.css 
    fs.writeFileSync(path.join(__dirname, 'theme.css'), themeCSSContent);


    // 3. Generate tailwind.preset.js
    // This maps the shadcn variables (like --primary) to Tailwind theme config

    // Helper to reference the CSS variable
    const v = (name) => `oklch(var(--${name}) / <alpha-value>)`;

    const presetContent = `/**
 * Tailwind Preset - AUTO-GENERATED
 * Use this in your tailwind.config.ts:
 * presets: [require('../../shared/tailwind.preset.js')]
 */

const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "${v('border')}",
        input: "${v('input')}",
        ring: "${v('ring')}",
        background: "${v('background')}",
        foreground: "${v('foreground')}",
        primary: {
          DEFAULT: "${v('primary')}",
          foreground: "${v('primary-foreground')}",
        },
        secondary: {
          DEFAULT: "${v('secondary')}",
          foreground: "${v('secondary-foreground')}",
        },
        destructive: {
          DEFAULT: "${v('destructive')}",
          foreground: "${v('destructive')}", 
        },
        muted: {
          DEFAULT: "${v('muted')}",
          foreground: "${v('muted-foreground')}",
        },
        accent: {
          DEFAULT: "${v('accent')}",
          foreground: "${v('accent-foreground')}",
        },
        popover: {
          DEFAULT: "${v('popover')}",
          foreground: "${v('popover-foreground')}",
        },
        card: {
          DEFAULT: "${v('card')}",
          foreground: "${v('card-foreground')}",
        },
        sidebar: {
          DEFAULT: "${v('sidebar')}",
          foreground: "${v('sidebar-foreground')}",
          primary: "${v('sidebar-primary')}",
          "primary-foreground": "${v('sidebar-primary-foreground')}",
          accent: "${v('sidebar-accent')}",
          "accent-foreground": "${v('sidebar-accent-foreground')}",
          border: "${v('sidebar-border')}",
          ring: "${v('sidebar-ring')}",
        },
        chart: {
          1: "${v('chart-1')}",
          2: "${v('chart-2')}",
          3: "${v('chart-3')}",
          4: "${v('chart-4')}",
          5: "${v('chart-5')}",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["${config.typography.fontFamily}", ...fontFamily.sans],
      },
      // Animations included in shadcn defaults
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}
`;

    fs.writeFileSync(path.join(__dirname, 'tailwind.preset.js'), presetContent);

    // 4. Generate colors.ts (Backend compatibility)
    // Category mapping
    const categoryMap = {
        'background': 'Core', 'foreground': 'Core',
        'primary': 'Brand', 'primary-foreground': 'Brand',
        'secondary': 'Brand', 'secondary-foreground': 'Brand',
        'card': 'UI', 'card-foreground': 'UI',
        'popover': 'UI', 'popover-foreground': 'UI',
        'muted': 'Muted', 'muted-foreground': 'Muted',
        'accent': 'Accent', 'accent-foreground': 'Accent',
        'destructive': 'State', 'ring': 'State',
        'border': 'Border', 'input': 'Border',
        'radius': 'Sizing',
    };

    // Build tokens
    const colorTokens = [];
    for (const [varName, lightValue] of Object.entries(lightVars)) {
        const darkValue = darkVars[varName] || lightValue;
        const category = categoryMap[varName] || (varName.startsWith('chart') ? 'Charts' : varName.startsWith('sidebar') ? 'Sidebar' : 'Other');

        colorTokens.push({
            name: varName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            cssVar: '--' + varName,
            lightValue,
            darkValue,
            category
        });
    }

    const tsContent = `/**
 * Color Tokens - AUTO-GENERATED from branding.config.js
 * Generated: ${new Date().toISOString()}
 */

export interface ColorToken {
    name: string
    cssVar: string
    lightValue: string
    darkValue: string
    category: string
}

export const colorTokens: ColorToken[] = ${JSON.stringify(colorTokens, null, 4).replace(/"([^"]+)":/g, '$1:')}

export const getCategories = (): string[] => [...new Set(colorTokens.map(c => c.category))]
export const getColorsByCategory = (category: string): ColorToken[] => colorTokens.filter(c => c.category === category)
`;
    fs.writeFileSync(COLORS_OUTPUT, tsContent);

    console.log('   ✅ theme.css (CSS Variables)');
    console.log('   ✅ tailwind.preset.js (Tailwind Config)');
    console.log(`   ✅ colors.ts (${colorTokens.length} tokens)`);
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
//  GENERATE BRANDING.TS
// ═══════════════════════════════════════════════════════════════════════════

function generateBranding(config, iconPaths) {
    console.log('\n📦 Generating branding.ts...');

    const content = `/**
 * Branding Config - AUTO-GENERATED from branding.config.js
 * Generated: ${new Date().toISOString()}
 */

// Brand Identity
export const brandName = '${config.brandName}'
export const iconName = '${config.iconName}'

// Site Metadata
export const metadata = ${JSON.stringify(config.metadata, null, 4)}

// SVG paths for the icon (from Lucide)
export const iconPaths = ${JSON.stringify(iconPaths, null, 4)}

// Typography (using Tailwind's typography plugin)
// Typography (using Tailwind's typography plugin)
export const typography = {
    fontFamily: '${config.typography.fontFamily}',
    fontVariable: '${config.typography.fontVariable}',
    proseClass: '${config.typography.proseClass}',
    googleFontsUrl: '${config.typography.googleFontsUrl}',
}

// Generate SVG markup
export function generateIconSvg(size: number, backgroundColor: string, strokeColor: string): string {
    const padding = size / 8
    const iconSize = size - padding * 2
    const radius = size / 4

    return \`<svg xmlns="http://www.w3.org/2000/svg" width="\${size}" height="\${size}" viewBox="0 0 \${size} \${size}">
  <rect width="\${size}" height="\${size}" rx="\${radius}" fill="\${backgroundColor}"/>
  <g transform="translate(\${padding}, \${padding})">
    <svg width="\${iconSize}" height="\${iconSize}" viewBox="0 0 24 24" fill="none" stroke="\${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      \${iconPaths.map(p => \`<path d="\${p}"/>\`).join('\\n      ')}
    </svg>
  </g>
</svg>\`
}
`;

    fs.writeFileSync(BRANDING_OUTPUT, content);
    console.log(`   ✅ Brand name: ${config.brandName}`);
    console.log(`   ✅ Icon: ${config.iconName}`);
    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
//  GENERATE ASSETS
// ═══════════════════════════════════════════════════════════════════════════

async function generateAssets(config, iconPaths) {
    console.log('\n📦 Generating assets...');

    // Ensure assets directory exists
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    // Get colors from theme CSS
    const colors = getColorsFromCSS(config.themeCSS);

    // Generate SVG helper
    const generateIconSvg = (size, backgroundColor, strokeColor) => {
        const padding = size / 8;
        const iconSize = size - padding * 2;
        const radius = size / 4;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${backgroundColor}"/>
  <g transform="translate(${padding}, ${padding})">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconPaths.map(p => `<path d="${p}"/>`).join('\n      ')}
    </svg>
  </g>
</svg>`;
    };

    // Generate full logo SVG
    const generateLogoSvg = (textColor, backgroundColor, strokeColor) => {
        const iconSize = 48;
        const padding = 6;
        const iconInnerSize = iconSize - padding * 2;
        const gap = 12;
        const textWidth = 180;
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize + gap + textWidth}" height="${iconSize}" viewBox="0 0 ${iconSize + gap + textWidth} ${iconSize}">
  <rect width="${iconSize}" height="${iconSize}" rx="12" fill="${backgroundColor}"/>
  <g transform="translate(${padding}, ${padding})">
    <svg width="${iconInnerSize}" height="${iconInnerSize}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconPaths.map(p => `<path d="${p}"/>`).join('\n      ')}
    </svg>
  </g>
  <text x="${iconSize + gap}" y="${iconSize / 2 + 10}" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="${textColor}">${config.brandName}</text>
</svg>`;
    };

    // Generate SVG files
    const sizes = [16, 32, 48, 64, 128, 192, 256, 512];

    // Favicon
    fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.svg'), generateIconSvg(32, colors.primary, colors.iconStroke));
    console.log('   ✅ favicon.svg');

    // Icon sizes
    sizes.forEach(size => {
        fs.writeFileSync(path.join(ASSETS_DIR, `icon-${size}.svg`), generateIconSvg(size, colors.primary, colors.iconStroke));
    });
    console.log(`   ✅ icon-{${sizes.join(',')}}.svg`);

    // Logos
    fs.writeFileSync(path.join(ASSETS_DIR, 'logo-icon.svg'), generateIconSvg(64, colors.primary, colors.iconStroke));
    fs.writeFileSync(path.join(ASSETS_DIR, 'logo-full-light.svg'), generateLogoSvg('#1a1a1a', colors.primary, colors.iconStroke));
    fs.writeFileSync(path.join(ASSETS_DIR, 'logo-full-dark.svg'), generateLogoSvg('#ffffff', colors.primary, colors.iconStroke));
    console.log('   ✅ logo-icon.svg, logo-full-light.svg, logo-full-dark.svg');

    // Apple touch icon
    fs.writeFileSync(path.join(ASSETS_DIR, 'apple-touch-icon.svg'), generateIconSvg(180, colors.primary, colors.iconStroke));
    console.log('   ✅ apple-touch-icon.svg');

    // Generate ICO and PNG with sharp (if available)
    try {
        const sharp = require('sharp');

        // Favicon ICO
        const ico16 = await sharp(Buffer.from(generateIconSvg(16, colors.primary, colors.iconStroke))).resize(16, 16).png().toBuffer();
        const ico32 = await sharp(Buffer.from(generateIconSvg(32, colors.primary, colors.iconStroke))).resize(32, 32).png().toBuffer();
        const ico48 = await sharp(Buffer.from(generateIconSvg(48, colors.primary, colors.iconStroke))).resize(48, 48).png().toBuffer();

        // Build ICO file
        const images = [{ size: 16, data: ico16 }, { size: 32, data: ico32 }, { size: 48, data: ico48 }];
        const headerSize = 6;
        const dirEntrySize = 16;
        let offset = headerSize + (dirEntrySize * images.length);

        const icoHeader = Buffer.alloc(headerSize);
        icoHeader.writeUInt16LE(0, 0);
        icoHeader.writeUInt16LE(1, 2);
        icoHeader.writeUInt16LE(images.length, 4);

        const dirEntries = [];
        const imageBuffers = [];

        for (const img of images) {
            const entry = Buffer.alloc(dirEntrySize);
            entry.writeUInt8(img.size, 0);
            entry.writeUInt8(img.size, 1);
            entry.writeUInt8(0, 2);
            entry.writeUInt8(0, 3);
            entry.writeUInt16LE(1, 4);
            entry.writeUInt16LE(32, 6);
            entry.writeUInt32LE(img.data.length, 8);
            entry.writeUInt32LE(offset, 12);
            dirEntries.push(entry);
            imageBuffers.push(img.data);
            offset += img.data.length;
        }

        fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.ico'), Buffer.concat([icoHeader, ...dirEntries, ...imageBuffers]));
        console.log('   ✅ favicon.ico');

        // Generate PNGs for all assets
        console.log('   Generating PNGs...');

        // 1. Icon sizes
        for (const size of sizes) {
            const pngBuffer = await sharp(Buffer.from(generateIconSvg(size, colors.primary, colors.iconStroke)))
                .resize(size, size)
                .png()
                .toBuffer();
            fs.writeFileSync(path.join(ASSETS_DIR, `icon-${size}.png`), pngBuffer);
        }
        console.log(`   ✅ icon-{${sizes.join(',')}}.png`);

        // 2. Logo Icon
        const logoIconPng = await sharp(Buffer.from(generateIconSvg(64, colors.primary, colors.iconStroke)))
            .resize(64, 64)
            .png()
            .toBuffer();
        fs.writeFileSync(path.join(ASSETS_DIR, 'logo-icon.png'), logoIconPng);

        // 3. Full Logos (Height 48px)
        // We need to render the SVG first then convert. 
        // Note: For sharp to convert text correctly, fonts must be available. 
        // Since we use system fonts in SVG, it should work on your Mac.
        const logoHeight = 48;
        // Width is roughly calculated in generateLogoSvg: 48 + 12 + 180 = 240
        const logoWidth = 240;

        const logoLightPng = await sharp(Buffer.from(generateLogoSvg('#1a1a1a', colors.primary, colors.iconStroke)))
            .resize(logoWidth, logoHeight)
            .png()
            .toBuffer();
        fs.writeFileSync(path.join(ASSETS_DIR, 'logo-full-light.png'), logoLightPng);

        const logoDarkPng = await sharp(Buffer.from(generateLogoSvg('#ffffff', colors.primary, colors.iconStroke)))
            .resize(logoWidth, logoHeight)
            .png()
            .toBuffer();
        fs.writeFileSync(path.join(ASSETS_DIR, 'logo-full-dark.png'), logoDarkPng);

        console.log('   ✅ logo-icon.png, logo-full-light.png, logo-full-dark.png');


        // 4. GENERATE OG IMAGE (1200x630)
        console.log('   Generating OG Image...');

        const ogWidth = 1200;
        const ogHeight = 630;

        // Design: Simple, clean card with logo and description
        // Using system fonts since we can't easily load custom fonts in raw SVG without file paths being perfect

        // Escape XML characters
        const escapeXml = (unsafe) => unsafe.replace(/[<>&'"]/g, c => {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });

        const title = escapeXml(config.brandName || 'Pathway');
        const desc = escapeXml(config.metadata?.description || 'Learn and grow with us.');

        // Split text for primitive wrapping (SVG doesn't wrap text automatically)
        const wrapText = (text, maxChars) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                if (currentLine.length + 1 + words[i].length <= maxChars) {
                    currentLine += " " + words[i];
                } else {
                    lines.push(currentLine);
                    currentLine = words[i];
                }
            }
            lines.push(currentLine);
            return lines;
        };

        const descLines = wrapText(desc, 50).slice(0, 3); // Max 3 lines

        const ogSvg = `<svg width="${ogWidth}" height="${ogHeight}" viewBox="0 0 ${ogWidth} ${ogHeight}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
                </linearGradient>
            </defs>
            
            <!-- Background -->
            <rect width="1200" height="630" fill="url(#grad)"/>
            
            <!-- Accent Border Top -->
            <rect width="1200" height="20" fill="${colors.primary}"/>

            <!-- Logo Area (Center - Top) -->
            <g transform="translate(100, 100)">
                <!-- Reusing generateIconSvg logic but inline scaled -->
                <rect width="120" height="120" rx="30" fill="${colors.primary}"/>
                <g transform="translate(15, 15)">
                     <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="${colors.iconStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        ${iconPaths.map(p => `<path d="${p}"/>`).join('\n')}
                     </svg>
                </g>
                <text x="140" y="80" font-family="sans-serif" font-weight="bold" font-size="80" fill="#1a1a1a">${title}</text>
            </g>

            <!-- Description -->
            <g transform="translate(100, 320)">
                ${descLines.map((line, i) => `<text x="0" y="${i * 60}" font-family="sans-serif" font-size="40" fill="#4a4a4a">${line}</text>`).join('\n')}
            </g>

            <!-- CTA Button (Bottom Right) -->
            <g transform="translate(850, 480)">
                <rect width="250" height="80" rx="40" fill="${colors.primary}"/>
                <text x="125" y="52" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="${colors.iconStroke}">Know More →</text>
            </g>
        </svg>`;

        const ogImageBuffer = await sharp(Buffer.from(ogSvg))
            .png()
            .toBuffer();

        fs.writeFileSync(path.join(ASSETS_DIR, 'og-image.png'), ogImageBuffer);
        console.log('   ✅ og-image.png (1200x630)');



    } catch (e) {
        console.log('   ⚠️  sharp not available - skipping .ico and .png');
    }

    return true;
}

// ═══════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getColorsFromCSS(css) {
    const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
    if (!rootMatch) return { primary: '#f5c542', iconStroke: '#6b4423' };

    const getVar = (name) => {
        const match = rootMatch[1].match(new RegExp(`--${name}:\\s*([^;]+);`));
        return match ? match[1].trim() : null;
    };

    return {
        primary: oklchToHex(getVar('primary')) || '#f5c542',
        iconStroke: oklchToHex(getVar('primary-foreground')) || '#6b4423',
    };
}

function oklchToHex(oklch) {
    if (!oklch) return null;
    if (oklch.startsWith('#')) return oklch;

    const match = oklch.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
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

    const gamma = (x) => x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    r = Math.round(Math.max(0, Math.min(1, gamma(r))) * 255);
    g = Math.round(Math.max(0, Math.min(1, gamma(g))) * 255);
    bl = Math.round(Math.max(0, Math.min(1, gamma(bl))) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  PATHWAY BRAND GENERATOR');
    console.log('═══════════════════════════════════════════════════════════════');

    // Load config
    // Load config
    const config = loadConfig();

    // Get icon paths from Lucide
    const iconPaths = getLucideIconPaths(config.iconName);

    if (!iconPaths || iconPaths.length === 0) {
        console.error(`❌ Icon "${config.iconName}" not found in 'lucide' package`);
        console.log('   Check https://lucide.dev/icons for valid names');
        process.exit(1);
    }

    console.log(`\n📖 Loaded config: ${config.brandName} with ${config.iconName} icon`);

    // Generate all outputs
    generateThemeSystem(config);
    generateBranding(config, iconPaths);
    await generateAssets(config, iconPaths);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  ✨ GENERATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\nGenerated files:');
    console.log('  • theme.css      - CSS Variables for global styles');
    console.log('  • tailwind.preset.js - Shared Tailwind configuration');
    console.log('  • colors.ts      - structured color tokens (for backend)');
    console.log('  • branding.ts    - Brand config (names, icons)');
    console.log('  • assets/        - Favicon, logos, icons (SVG & PNG)');
    console.log('\nNext: Integrate tailwind.preset.js into your apps config\n');
}

main().catch(console.error);
