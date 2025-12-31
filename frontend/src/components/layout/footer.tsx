"use client";

import Link from "next/link";
import { useState } from "react";
import {
    Github,
    Twitter,
    Linkedin,
    Send,
    Instagram,
    Facebook,
    Youtube,
    MessageCircle,
    Music2,
    AtSign,
    Disc
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, SiteSettingsData } from "@/lib/api";
import { toast } from "sonner";

interface FooterProps {
    footerData?: {
        description: string;
        companyLinks: { name: string; href: string }[];
        legalLinks: { name: string; href: string }[];
    };
    socialLinks?: SiteSettingsData["socialLinks"];
}

const SOCIAL_PLATFORMS = [
    { key: 'facebook', icon: Facebook, label: 'Facebook' },
    { key: 'instagram', icon: Instagram, label: 'Instagram' },
    { key: 'twitter', icon: Twitter, label: 'X (Twitter)' },
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
    { key: 'youtube', icon: Youtube, label: 'YouTube' },
    { key: 'tiktok', icon: Music2, label: 'TikTok' },
    { key: 'threads', icon: AtSign, label: 'Threads' },
    { key: 'github', icon: Github, label: 'GitHub' },
    { key: 'discord', icon: Disc, label: 'Discord' },
    { key: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
    { key: 'telegram', icon: Send, label: 'Telegram' },
] as const;

export function Footer({ footerData, socialLinks }: FooterProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        try {
            await api.subscribeToNewsletter(email);
            toast.success("Successfully subscribed to newsletter!");
            setEmail("");
        } catch (error: any) {
            console.error("Newsletter subscription error:", error);
            toast.error(error.message || "Failed to subscribe. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const data = footerData || {
        description: 'Learn from expert coaches and accelerate your personal and professional growth.',
        companyLinks: [
            { name: "About", href: "/about" },
            { name: "Careers", href: "/careers" },
            { name: "Contact", href: "/contact" },
        ],
        legalLinks: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" },
            { name: "Cookie Policy", href: "/cookies" },
        ],
    };

    return (
        <footer className="border-t border-border/40 bg-muted/30">
            <div className="container mx-auto px-4 pt-12 pb-0 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Logo size="sm" variant="secondary" />
                        <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                            {data.description}
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                            {SOCIAL_PLATFORMS.map((platform) => {
                                const href = socialLinks?.[platform.key as keyof NonNullable<FooterProps["socialLinks"]>];
                                if (!href) return null;

                                const Icon = platform.icon;
                                return (
                                    <a
                                        key={platform.key}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="sr-only">{platform.label}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>




                    {/* Company Links */}
                    <div>
                        <h3 className="text-sm font-semibold">Company</h3>
                        <ul className="mt-4 space-y-3">
                            {data.companyLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-sm font-semibold">Legal</h3>
                        <ul className="mt-4 space-y-3">
                            {data.legalLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <h3 className="text-sm font-semibold text-foreground">Subscribe to our newsletter</h3>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Get the latest updates on courses, coaching, and insights directly in your inbox.
                        </p>
                        <form onSubmit={handleSubscribe} className="mt-6 flex flex-col gap-2">
                            <div className="relative">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background pr-12"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    variant="ghost"
                                    className="absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                                    disabled={isLoading}
                                >
                                    <Send className="h-4 w-4" />
                                    <span className="sr-only">Subscribe</span>
                                </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                By subscribing, you agree to our Terms and Privacy Policy.
                            </p>
                        </form>
                    </div>
                </div>

                <div className="mt-8 border-t border-border/40 py-4">
                    <p className="text-left text-sm text-muted-foreground opacity-70">
                        © {new Date().getFullYear()} Pathway. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
