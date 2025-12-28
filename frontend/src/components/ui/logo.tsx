import Link from "next/link";
import { GraduationCap } from "lucide-react";
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
     * - secondary: Uses secondary/muted colors
     */
    variant?: "primary" | "secondary";
    /**
     * Whether to show the "Pathway" text next to the icon
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
        container: "h-8 w-8 rounded-lg",
        icon: "h-4 w-4",
        text: "text-lg",
    },
    md: {
        container: "h-9 w-9 rounded-xl",
        icon: "h-5 w-5",
        text: "text-xl",
    },
    lg: {
        container: "h-12 w-12 rounded-xl",
        icon: "h-6 w-6",
        text: "text-2xl",
    },
};

export function Logo({
    size = "md",
    variant = "primary",
    showText = true,
    asLink = true,
    className,
}: LogoProps) {
    const config = sizeConfig[size];

    const variantStyles = {
        primary: {
            container: "bg-gradient-to-br from-primary to-primary/70 shadow-primary/25",
            icon: "text-primary-foreground",
            text: "bg-gradient-to-r from-foreground to-foreground/70",
        },
        secondary: {
            container: "bg-gradient-to-br from-secondary to-secondary/70 shadow-secondary/25 border border-border/50",
            icon: "text-secondary-foreground",
            text: "bg-gradient-to-r from-muted-foreground to-muted-foreground/70",
        },
    };

    const styles = variantStyles[variant];

    const logoContent = (
        <>
            <div
                className={cn(
                    "relative flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
                    styles.container,
                    config.container
                )}
            >
                <GraduationCap className={cn(styles.icon, config.icon)} />
            </div>
            {showText && (
                <span
                    className={cn(
                        "font-bold bg-clip-text text-transparent",
                        styles.text,
                        config.text
                    )}
                >
                    Pathway
                </span>
            )}
        </>
    );

    if (asLink) {
        return (
            <Link href="/" className={cn("flex items-center gap-2 group", className)}>
                {logoContent}
            </Link>
        );
    }

    return <div className={cn("flex items-center gap-2", className)}>{logoContent}</div>;
}
