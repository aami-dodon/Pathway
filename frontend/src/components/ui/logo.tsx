"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
    /**
     * Size variant of the logo
     * - sm: Small (footer size)
     * - md: Medium (header size)
     * - lg: Large
     */
    size?: "sm" | "md" | "lg";
    /**
     * Color variant of the logo
     * - primary: Uses primary color (default)
     * - secondary: Uses secondary variant
     */
    variant?: "primary" | "secondary";
    /**
     * Whether to show the full logo with "Pathway" text (true)
     * or just the icon (false)
     */
    showText?: boolean;
    /**
     * Whether to make the logo a clickable link to home
     */
    asLink?: boolean;
    /**
     * Additional CSS classes
     */
    className?: string;
}

const sizeConfig = {
    sm: {
        height: 24,
    },
    md: {
        height: 32,
    },
    lg: {
        height: 48,
    },
};

export function Logo({
    size = "md",
    showText = true,
    asLink = true,
    className,
}: LogoProps) {
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const config = sizeConfig[size];

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = resolvedTheme || theme;

    // Choose logo based on showText and theme
    let logoSrc = "/logo-icon.svg";
    if (showText) {
        logoSrc = currentTheme === "dark"
            ? "/logo-full-dark.svg"
            : "/logo-full-light.svg";
    }

    const logoContent = (
        <img
            src={mounted ? logoSrc : "/logo-icon.svg"}
            alt="Pathway"
            style={{
                height: `${config.height}px`,
                width: 'auto',
                objectFit: 'contain',
            }}
            className="transition-transform group-hover:scale-105"
        />
    );

    if (asLink) {
        return (
            <Link href="/" className={cn("flex items-center group", className)}>
                {logoContent}
            </Link>
        );
    }

    return <div className={cn("flex items-center", className)}>{logoContent}</div>;
}
