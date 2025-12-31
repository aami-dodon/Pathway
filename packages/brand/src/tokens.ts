/**
 * Design Tokens - Semantic color and spacing tokens
 * 
 * AUTO-GENERATED from theme.css - DO NOT EDIT MANUALLY
 * Generated: 2025-12-31T02:21:55.986Z
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
    'background': { light: 'oklch(1 0 0)', dark: 'oklch(0.141 0.005 285.823)' },
    'foreground': { light: 'oklch(0.141 0.005 285.823)', dark: 'oklch(0.985 0 0)' },
    'card': { light: 'oklch(1 0 0)', dark: 'oklch(0.21 0.006 285.885)' },
    'cardForeground': { light: 'oklch(0.141 0.005 285.823)', dark: 'oklch(0.985 0 0)' },
    'popover': { light: 'oklch(1 0 0)', dark: 'oklch(0.21 0.006 285.885)' },
    'popoverForeground': { light: 'oklch(0.141 0.005 285.823)', dark: 'oklch(0.985 0 0)' },
    'primary': { light: 'oklch(0.852 0.199 91.936)', dark: 'oklch(0.795 0.184 86.047)' },
    'primaryForeground': { light: 'oklch(0.421 0.095 57.708)', dark: 'oklch(0.421 0.095 57.708)' },
    'secondary': { light: 'oklch(0.967 0.001 286.375)', dark: 'oklch(0.274 0.006 286.033)' },
    'secondaryForeground': { light: 'oklch(0.21 0.006 285.885)', dark: 'oklch(0.985 0 0)' },
    'muted': { light: 'oklch(0.967 0.001 286.375)', dark: 'oklch(0.274 0.006 286.033)' },
    'mutedForeground': { light: 'oklch(0.552 0.016 285.938)', dark: 'oklch(0.705 0.015 286.067)' },
    'accent': { light: 'oklch(0.967 0.001 286.375)', dark: 'oklch(0.274 0.006 286.033)' },
    'accentForeground': { light: 'oklch(0.21 0.006 285.885)', dark: 'oklch(0.985 0 0)' },
    'destructive': { light: 'oklch(0.577 0.245 27.325)', dark: 'oklch(0.704 0.191 22.216)' },
    'border': { light: 'oklch(0.92 0.004 286.32)', dark: 'oklch(1 0 0 / 10%)' },
    'input': { light: 'oklch(0.92 0.004 286.32)', dark: 'oklch(1 0 0 / 15%)' },
    'ring': { light: 'oklch(0.852 0.199 91.936)', dark: 'oklch(0.421 0.095 57.708)' },
    'chart-1': { light: 'oklch(0.905 0.182 98.111)', dark: 'oklch(0.905 0.182 98.111)' },
    'chart-2': { light: 'oklch(0.795 0.184 86.047)', dark: 'oklch(0.795 0.184 86.047)' },
    'chart-3': { light: 'oklch(0.681 0.162 75.834)', dark: 'oklch(0.681 0.162 75.834)' },
    'chart-4': { light: 'oklch(0.554 0.135 66.442)', dark: 'oklch(0.554 0.135 66.442)' },
    'chart-5': { light: 'oklch(0.476 0.114 61.907)', dark: 'oklch(0.476 0.114 61.907)' },
    'sidebar': { light: 'oklch(0.985 0 0)', dark: 'oklch(0.21 0.006 285.885)' },
    'sidebarForeground': { light: 'oklch(0.141 0.005 285.823)', dark: 'oklch(0.985 0 0)' },
    'sidebarPrimary': { light: 'oklch(0.681 0.162 75.834)', dark: 'oklch(0.795 0.184 86.047)' },
    'sidebarPrimaryForeground': { light: 'oklch(0.987 0.026 102.212)', dark: 'oklch(0.987 0.026 102.212)' },
    'sidebarAccent': { light: 'oklch(0.967 0.001 286.375)', dark: 'oklch(0.274 0.006 286.033)' },
    'sidebarAccentForeground': { light: 'oklch(0.21 0.006 285.885)', dark: 'oklch(0.985 0 0)' },
    'sidebarBorder': { light: 'oklch(0.92 0.004 286.32)', dark: 'oklch(1 0 0 / 10%)' },
    'sidebarRing': { light: 'oklch(0.852 0.199 91.936)', dark: 'oklch(0.421 0.095 57.708)' }
  },
  radius: '0.65rem',
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
