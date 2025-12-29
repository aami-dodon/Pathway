#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  @org/brand Asset Sync
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  Copies essential brand assets to app public folders.
 * 
 *  Usage: node packages/brand/scripts/sync-assets.js
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
const ASSETS_DIR = path.join(BRAND_DIR, 'assets');

// Target directories for asset distribution
const TARGETS = [
    path.join(BRAND_DIR, '../../frontend/public'),
    path.join(BRAND_DIR, '../../backend/public'),
];

// Essential assets to copy (the minimum set for web apps)
const ESSENTIAL_ASSETS = [
    'favicon.ico',
    'apple-touch-icon.svg',
    'icon-192.png',
    'icon-512.png',
    'logo-full-light.png',
    'logo-full-dark.png',
    'logo-icon.png',
    'logo-full-light.svg',
    'logo-full-dark.svg',
    'logo-icon.svg',
    'og-image.png',
];

function syncAssets() {
    console.log('\n📦 Syncing brand assets to apps...');

    if (!fs.existsSync(ASSETS_DIR)) {
        console.error('❌ Assets directory not found:', ASSETS_DIR);
        console.log('   Run generate.js first to create assets');
        return;
    }

    TARGETS.forEach(targetDir => {
        const relativePath = path.relative(path.join(BRAND_DIR, '../..'), targetDir);

        if (!fs.existsSync(targetDir)) {
            console.log(`   ⚠️  Target not found, skipping: ${relativePath}`);
            return;
        }

        // Copy essential assets
        let copied = 0;
        ESSENTIAL_ASSETS.forEach(asset => {
            const src = path.join(ASSETS_DIR, asset);
            const dest = path.join(targetDir, asset);

            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                copied++;
            }
        });

        console.log(`   ✅ Copied ${copied} assets to ${relativePath}`);
    });

    console.log('\n✅ Asset sync complete!');
}

syncAssets();
