"use client";

import { useEffect } from "react";

export function DynamicFavicon() {
    useEffect(() => {
        // Function to generate favicon from current CSS variables
        const generateFavicon = () => {
            try {
                // Create a canvas to convert any color format to RGB
                const canvas = document.createElement('canvas');
                canvas.width = 1;
                canvas.height = 1;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    console.error('Could not get canvas context');
                    return;
                }

                // Create test element to get computed primary color
                const testDiv = document.createElement('div');
                testDiv.className = 'bg-primary';
                testDiv.style.position = 'absolute';
                testDiv.style.visibility = 'hidden';
                testDiv.style.pointerEvents = 'none';
                document.body.appendChild(testDiv);

                // Get computed color (might be in oklch, rgb, or any format)
                const computedColor = getComputedStyle(testDiv).backgroundColor;
                document.body.removeChild(testDiv);

                console.log('Computed color from CSS:', computedColor);

                // Use canvas to convert any color format to RGB
                ctx.fillStyle = computedColor;
                ctx.fillRect(0, 0, 1, 1);
                const imageData = ctx.getImageData(0, 0, 1, 1).data;

                // Convert to hex
                const r = imageData[0];
                const g = imageData[1];
                const b = imageData[2];
                const primaryHex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

                console.log('Favicon primary color (converted to hex):', primaryHex);

                // Generate SVG with just the icon (no background) using primary color - maximum size
                const svg = `<svg width="32" height="32" viewBox="2 4 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" fill="none" stroke="${primaryHex}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 10v6" fill="none" stroke="${primaryHex}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" fill="none" stroke="${primaryHex}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

                // Convert SVG to data URL
                const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(svgBlob);

                // Remove any existing favicon links
                const existingLinks = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");
                existingLinks.forEach(link => {
                    if (link.getAttribute('href')?.startsWith('blob:')) {
                        URL.revokeObjectURL(link.getAttribute('href')!);
                    }
                    link.remove();
                });

                // Create new favicon link
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/svg+xml';
                link.href = url;
                document.head.appendChild(link);

                console.log('Favicon updated successfully');
            } catch (error) {
                console.error('Failed to generate dynamic favicon:', error);
            }
        };

        // Generate favicon after a delay to ensure styles are loaded
        const timer = setTimeout(generateFavicon, 200);

        // Re-generate if theme class changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setTimeout(generateFavicon, 100);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    return null;
}
