#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  @org/brand Generator
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  Generates:
 *    - src/tokens.ts (parsed from theme.css)
 *    - assets/ (favicon, logos, icons)
 * 
 *  Usage: node packages/brand/scripts/generate.js
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const BRAND_DIR = path.join(__dirname, '..');
const THEME_CSS = path.join(BRAND_DIR, 'theme.css');
const TOKENS_OUTPUT = path.join(BRAND_DIR, 'src/tokens.ts');
const ASSETS_DIR = path.join(BRAND_DIR, 'assets');

// Icon paths (GraduationCap from Lucide)
const ICON_PATHS = [
  "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
  "M22 10v6",
  "M6 12.5V16a6 3 0 0 0 12 0v-3.5"
];

// ═══════════════════════════════════════════════════════════════════════════
//  PARSE THEME CSS
// ═══════════════════════════════════════════════════════════════════════════

function parseThemeCSS() {
  if (!fs.existsSync(THEME_CSS)) {
    console.error('❌ theme.css not found at:', THEME_CSS);
    process.exit(1);
  }

  const css = fs.readFileSync(THEME_CSS, 'utf-8');

  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  const darkMatch = css.match(/\.dark\s*\{([^}]+)\}/);

  if (!rootMatch) {
    console.error('❌ Could not find :root block in theme.css');
    process.exit(1);
  }

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

  return { lightVars, darkVars };
}

// ═══════════════════════════════════════════════════════════════════════════
//  GENERATE TOKENS.TS
// ═══════════════════════════════════════════════════════════════════════════

function generateTokensTS(lightVars, darkVars) {
  console.log('\n📦 Generating tokens.ts...');

  // Map CSS variable names to camelCase token names
  const varToToken = (name) => {
    return name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  };

  // Color tokens we care about
  const colorVars = [
    'background', 'foreground',
    'card', 'card-foreground',
    'popover', 'popover-foreground',
    'primary', 'primary-foreground',
    'secondary', 'secondary-foreground',
    'muted', 'muted-foreground',
    'accent', 'accent-foreground',
    'destructive',
    'border', 'input', 'ring',
    'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
    'sidebar', 'sidebar-foreground',
    'sidebar-primary', 'sidebar-primary-foreground',
    'sidebar-accent', 'sidebar-accent-foreground',
    'sidebar-border', 'sidebar-ring'
  ];

  const colorEntries = colorVars.map(v => {
    const tokenName = varToToken(v);
    const light = lightVars[v] || 'oklch(0 0 0)';
    const dark = darkVars[v] || light;
    return `    '${tokenName}': { light: '${light}', dark: '${dark}' }`;
  }).join(',\n');

  const radius = lightVars['radius'] || '0.625rem';

  const content = `/**
 * Design Tokens - Semantic color and spacing tokens
 * 
 * AUTO-GENERATED from theme.css - DO NOT EDIT MANUALLY
 * Generated: ${new Date().toISOString()}
 * 
 * To update: Edit theme.css and run: pnpm generate
 */

export interface ColorToken {
  light: string;
  dark: string;
}

export interface Tokens {
  colors: Record<string, ColorToken>;
  radius: string;
}

/**
 * Design tokens parsed from theme.css
 */
export const tokens: Tokens = {
  colors: {
${colorEntries}
  },
  radius: '${radius}',
};

/**
 * Get all color token names
 */
export const getColorNames = (): string[] => Object.keys(tokens.colors);

/**
 * Get a specific color token
 */
export const getColor = (name: string, mode: 'light' | 'dark' = 'light'): string =>
  tokens.colors[name]?.[mode] ?? tokens.colors[name]?.light ?? '';
`;

  fs.writeFileSync(TOKENS_OUTPUT, content);
  console.log('   ✅ tokens.ts generated');
}

// ═══════════════════════════════════════════════════════════════════════════
//  GENERATE ASSETS
// ═══════════════════════════════════════════════════════════════════════════

async function generateAssets(lightVars, brandName) {
  console.log('\n📦 Generating assets...');

  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // Get primary color for icons
  const primaryColor = oklchToHex(lightVars['primary']) || '#1a1a1a';
  const primaryForeground = oklchToHex(lightVars['primary-foreground']) || '#ffffff';

  // Generate SVG helper
  const generateIconSvg = (size, backgroundColor, strokeColor) => {
    const padding = size / 8;
    const iconSize = size - padding * 2;
    const radius = size / 4;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${backgroundColor}"/>
  <g transform="translate(${padding}, ${padding})">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${ICON_PATHS.map(p => `<path d="${p}"/>`).join('\n      ')}
    </svg>
  </g>
</svg>`;
  };

  // Generate logo SVG
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
      ${ICON_PATHS.map(p => `<path d="${p}"/>`).join('\n      ')}
    </svg>
  </g>
  <text x="${iconSize + gap}" y="${iconSize / 2 + 10}" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="${textColor}">${brandName}</text>
</svg>`;
  };

  // Generate SVG files
  const sizes = [16, 32, 48, 64, 128, 192, 256, 512];

  // Favicon
  fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.svg'), generateIconSvg(32, primaryColor, primaryForeground));
  console.log('   ✅ favicon.svg');

  // Icon sizes
  sizes.forEach(size => {
    fs.writeFileSync(path.join(ASSETS_DIR, `icon-${size}.svg`), generateIconSvg(size, primaryColor, primaryForeground));
  });
  console.log(`   ✅ icon-{${sizes.join(',')}}.svg`);

  // Logos
  fs.writeFileSync(path.join(ASSETS_DIR, 'logo-icon.svg'), generateIconSvg(64, primaryColor, primaryForeground));
  fs.writeFileSync(path.join(ASSETS_DIR, 'logo-full-light.svg'), generateLogoSvg('#1a1a1a', primaryColor, primaryForeground));
  fs.writeFileSync(path.join(ASSETS_DIR, 'logo-full-dark.svg'), generateLogoSvg('#ffffff', primaryColor, primaryForeground));
  console.log('   ✅ logo-icon.svg, logo-full-light.svg, logo-full-dark.svg');

  // Apple touch icon
  fs.writeFileSync(path.join(ASSETS_DIR, 'apple-touch-icon.svg'), generateIconSvg(180, primaryColor, primaryForeground));
  console.log('   ✅ apple-touch-icon.svg');

  // Generate PNG versions with sharp
  try {
    const sharp = (await import('sharp')).default;

    // Favicon ICO
    const ico16 = await sharp(Buffer.from(generateIconSvg(16, primaryColor, primaryForeground))).resize(16, 16).png().toBuffer();
    const ico32 = await sharp(Buffer.from(generateIconSvg(32, primaryColor, primaryForeground))).resize(32, 32).png().toBuffer();
    const ico48 = await sharp(Buffer.from(generateIconSvg(48, primaryColor, primaryForeground))).resize(48, 48).png().toBuffer();

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

    // Generate PNGs
    for (const size of sizes) {
      const pngBuffer = await sharp(Buffer.from(generateIconSvg(size, primaryColor, primaryForeground)))
        .resize(size, size)
        .png()
        .toBuffer();
      fs.writeFileSync(path.join(ASSETS_DIR, `icon-${size}.png`), pngBuffer);
    }
    console.log(`   ✅ icon-{${sizes.join(',')}}.png`);

    // Logo PNGs
    const logoIconPng = await sharp(Buffer.from(generateIconSvg(64, primaryColor, primaryForeground)))
      .resize(64, 64)
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(ASSETS_DIR, 'logo-icon.png'), logoIconPng);

    const logoHeight = 48;
    const logoWidth = 240;

    const logoLightPng = await sharp(Buffer.from(generateLogoSvg('#1a1a1a', primaryColor, primaryForeground)))
      .resize(logoWidth, logoHeight)
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(ASSETS_DIR, 'logo-full-light.png'), logoLightPng);

    const logoDarkPng = await sharp(Buffer.from(generateLogoSvg('#ffffff', primaryColor, primaryForeground)))
      .resize(logoWidth, logoHeight)
      .png()
      .toBuffer();
    fs.writeFileSync(path.join(ASSETS_DIR, 'logo-full-dark.png'), logoDarkPng);

    console.log('   ✅ logo-icon.png, logo-full-light.png, logo-full-dark.png');

    // OG Image
    console.log('   Generating OG Image...');
    const ogWidth = 1200;
    const ogHeight = 630;

    // Parse brand metadata for SEO
    const metadataPath = path.join(BRAND_DIR, 'src/metadata.ts');
    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');

    const escapeXml = (unsafe) => unsafe.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
      }
    });

    const titleMatch = metadataContent.match(/title:\s*'([^']+)'/);
    const descMatch = metadataContent.match(/description:\s*'([^']+)'/);
    const nameMatch = metadataContent.match(/name:\s*'([^']+)'/);

    const title = escapeXml(titleMatch ? titleMatch[1] : 'Pathway');
    const desc = escapeXml(descMatch ? descMatch[1] : 'Empower your learning journey with Pathway.');
    const brandName = nameMatch ? nameMatch[1] : 'Pathway';

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

    const descLines = wrapText(desc, 50).slice(0, 3);

    const ogSvg = `<svg width="${ogWidth}" height="${ogHeight}" viewBox="0 0 ${ogWidth} ${ogHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f0f0f0;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#grad)"/>
      <rect width="1200" height="20" fill="${primaryColor}"/>

      <g transform="translate(100, 100)">
        <rect width="120" height="120" rx="30" fill="${primaryColor}"/>
        <g transform="translate(15, 15)">
          <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="${primaryForeground}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${ICON_PATHS.map(p => `<path d="${p}"/>`).join('\n')}
          </svg>
        </g>
        <text x="140" y="80" font-family="sans-serif" font-weight="bold" font-size="80" fill="#1a1a1a">${title}</text>
      </g>

      <g transform="translate(100, 320)">
        ${descLines.map((line, i) => `<text x="0" y="${i * 60}" font-family="sans-serif" font-size="40" fill="#4a4a4a">${line}</text>`).join('\n')}
      </g>

      <g transform="translate(850, 480)">
        <rect width="250" height="80" rx="40" fill="${primaryColor}"/>
        <text x="125" y="52" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="30" fill="${primaryForeground}">Know More →</text>
      </g>
    </svg>`;

    const ogImageBuffer = await sharp(Buffer.from(ogSvg))
      .png()
      .toBuffer();

    fs.writeFileSync(path.join(ASSETS_DIR, 'og-image.png'), ogImageBuffer);
    console.log('   ✅ og-image.png (1200x630)');

  } catch (e) {
    console.log('   ⚠️  sharp not available - skipping PNG/ICO generation');
    console.log('   Error:', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════

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
  console.log('  @org/brand Generator');
  console.log('═══════════════════════════════════════════════════════════════');

  const { lightVars, darkVars } = parseThemeCSS();

  console.log(`\n📖 Parsed ${Object.keys(lightVars).length} light vars, ${Object.keys(darkVars).length} dark vars`);

  const metadataPath = path.join(BRAND_DIR, 'src/metadata.ts');
  const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
  const nameMatch = metadataContent.match(/name:\s*'([^']+)'/);
  const brandName = nameMatch ? nameMatch[1] : 'Pathway';

  generateTokensTS(lightVars, darkVars);
  await generateAssets(lightVars, brandName);

  console.log('\n✅ Generation complete!');
}

main().catch(console.error);
