#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  @org/ui Build Script
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  Generates brand.css from @org/brand/theme.css
 * 
 *  Usage: node packages/ui/scripts/build.js
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UI_DIR = path.join(__dirname, '..');
const BRAND_THEME = path.join(UI_DIR, '../brand/theme.css');
const OUTPUT_CSS = path.join(UI_DIR, 'brand.css');

function buildBrandCSS() {
    console.log('\n📦 Building brand.css from @org/brand/theme.css...');

    if (!fs.existsSync(BRAND_THEME)) {
        console.error('❌ @org/brand/theme.css not found');
        console.log('   Run packages/brand generate first');
        process.exit(1);
    }

    const themeCSS = fs.readFileSync(BRAND_THEME, 'utf-8');

    // Extract :root and .dark blocks
    const rootMatch = themeCSS.match(/:root\s*\{([^}]+)\}/);
    const darkMatch = themeCSS.match(/\.dark\s*\{([^}]+)\}/);
    if (!rootMatch) {
        console.error('❌ Could not parse :root from theme.css');
        process.exit(1);
    }

    const header = `/**
 * @org/ui Brand CSS
 * 
 * AUTO-GENERATED from @org/brand/theme.css
 * Generated: ${new Date().toISOString()}
 * 
 * To update: Edit packages/brand/theme.css and run: pnpm generate
 */

`;

    const brandCSS = header + `@layer base {
  :root {${rootMatch[1]}  }
${darkMatch ? `
  .dark {${darkMatch[1]}  }` : ''}
}
`;

    fs.writeFileSync(OUTPUT_CSS, brandCSS);
    console.log('   ✅ brand.css generated');
}

buildBrandCSS();
