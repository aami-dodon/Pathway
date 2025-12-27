"use client";

import { useEffect } from "react";

export function DynamicFavicon() {
    useEffect(() => {
        // Function to generate favicon from current CSS variables
        const generateFavicon = () => {
            // Get the computed primary color from CSS variables
            const rootStyles = getComputedStyle(document.documentElement);
            const primaryColor = rootStyles.getPropertyValue('--primary').trim();

            // Convert OKLCH to RGB (approximate conversion for the favicon)
            // For simplicity, we'll read the actual computed color from an element
            const tempDiv = document.createElement('div');
            tempDiv.style.color = `oklch(${primaryColor})`;
            document.body.appendChild(tempDiv);
            const computedColor = getComputedStyle(tempDiv).color;
            document.body.removeChild(tempDiv);

            // Convert rgb(r, g, b) to hex
            const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            let hexColor = '#2e1065'; // fallback

            if (rgbMatch) {
                const r = parseInt(rgbMatch[1]);
                const g = parseInt(rgbMatch[2]);
                const b = parseInt(rgbMatch[3]);
                hexColor = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            }

            // Generate SVG with the computed color
            const svg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${hexColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${hexColor};stop-opacity:0.7" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#grad)"/>
  <g transform="translate(8, 8) scale(0.667)">
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22 10v6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

            // Convert SVG to data URL
            const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);

            // Update favicon
            let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = url;
        };

        // Generate favicon on mount
        generateFavicon();

        // Optional: Re-generate if CSS variables change (for theme switching)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    generateFavicon();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    return null;
}
