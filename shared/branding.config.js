/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PATHWAY BRANDING CONFIG
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 *  This is the SINGLE SOURCE OF TRUTH for all branding.
 *  Edit this file, then run the generators to create all assets.
 * 
 *  Usage:
 *    npm run generate (from root) 
 *    OR 
 *    node shared/generate.js
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

module.exports = {
    /**
     * Brand Name
     * The text displayed next to the logo icon
     */
    brandName: 'Pathway',

    /**
     * Logo Icon
     * Lucide icon name - find icons at: https://lucide.dev/icons
     */
    iconName: 'GraduationCap',

    /**
     * Site Metadata
     * Used for SEO, OpenGraph, and manifest generation
     */
    metadata: {
        title: 'Pathway - Learning Management System',
        description: 'Empower your learning journey with Pathway. Access high-quality courses, expert coaching, and a supportive community.',
        author: 'Pathway Team',
        keywords: 'LMS, learning management, online courses, coaching, education',
        url: 'https://pathway.com', // Replace with production URL
        ogImage: '/assets/logo-full-light.png', // Relative path in assets
    },

    /**
     * Typography Configuration
     * Fonts and default prose classes for tailwind typography plugin
     */
    typography: {
        fontFamily: 'Inter',
        fontVariable: '--font-inter',
        proseClass: 'prose dark:prose-invert',
        googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },

    /**
     * Theme Colors (from shadcn/ui)
     * Paste your shadcn/ui theme CSS here
     * Go to: https://ui.shadcn.com/themes and copy the :root and .dark blocks
     */
    themeCSS: `
:root {
  --radius: 0.65rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.852 0.199 91.936);
  --primary-foreground: oklch(0.421 0.095 57.708);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.852 0.199 91.936);
  --chart-1: oklch(0.905 0.182 98.111);
  --chart-2: oklch(0.795 0.184 86.047);
  --chart-3: oklch(0.681 0.162 75.834);
  --chart-4: oklch(0.554 0.135 66.442);
  --chart-5: oklch(0.476 0.114 61.907);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.681 0.162 75.834);
  --sidebar-primary-foreground: oklch(0.987 0.026 102.212);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.852 0.199 91.936);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.795 0.184 86.047);
  --primary-foreground: oklch(0.421 0.095 57.708);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.421 0.095 57.708);
  --chart-1: oklch(0.905 0.182 98.111);
  --chart-2: oklch(0.795 0.184 86.047);
  --chart-3: oklch(0.681 0.162 75.834);
  --chart-4: oklch(0.554 0.135 66.442);
  --chart-5: oklch(0.476 0.114 61.907);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.795 0.184 86.047);
  --sidebar-primary-foreground: oklch(0.987 0.026 102.212);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.421 0.095 57.708);
}
`,
};
