/* eslint-disable */
/**
 * Branding Config - AUTO-GENERATED from branding.config.js
 * Generated: 2025-12-29T02:00:52.253Z
 */

// Brand Identity
export const brandName = 'Pathway'
export const iconName = 'GraduationCap'

// Site Metadata
export const metadata = {
    "title": "Pathway - Learning Management System",
    "description": "Empower your learning journey with Pathway. Access high-quality courses, expert coaching, and a supportive community.",
    "author": "Pathway Team",
    "keywords": "LMS, learning management, online courses, coaching, education",
    "url": "https://pathway.com",
    "ogImage": "/assets/logo-full-light.png"
}

// SVG paths for the icon (from Lucide)
export const iconPaths = [
    "M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",
    "M22 10v6",
    "M6 12.5V16a6 3 0 0 0 12 0v-3.5"
]

// Typography (using Tailwind's typography plugin)
// Typography (using Tailwind's typography plugin)
export const typography = {
    fontFamily: 'Inter',
    fontVariable: '--font-inter',
    proseClass: 'prose dark:prose-invert',
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
}

// Generate SVG markup
export function generateIconSvg(size: number, backgroundColor: string, strokeColor: string): string {
    const padding = size / 8
    const iconSize = size - padding * 2
    const radius = size / 4

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${backgroundColor}"/>
  <g transform="translate(${padding}, ${padding})">
    <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconPaths.map(p => `<path d="${p}"/>`).join('\n      ')}
    </svg>
  </g>
</svg>`
}
