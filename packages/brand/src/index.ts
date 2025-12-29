/**
 * @org/brand - Brand Design System Package
 * 
 * Single source of truth for:
 * - Design tokens (colors, spacing, radius)
 * - Brand metadata (name, SEO, icons)
 * - Theme CSS (shadcn compatible)
 * 
 * Usage:
 *   import { brand, tokens } from '@org/brand';
 *   import { tokens } from '@org/brand/tokens';
 *   import '@org/brand/theme.css';
 */

// Re-export everything from submodules
export * from './tokens.js';
export * from './metadata.js';

// Named exports for convenience
export { tokens, getColorNames, getColor } from './tokens.js';
export { brand, brandName, iconName, metadata, typography, iconPaths, generateIconSvg } from './metadata.js';
