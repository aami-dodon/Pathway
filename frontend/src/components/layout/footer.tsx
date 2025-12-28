"use client";

import Link from "next/link";
import { useState } from "react";
import { Github, Twitter, Linkedin, Send } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface FooterProps {
    footerData?: {
        description: string;
        companyLinks: { name: string; href: string }[];
        legalLinks: { name: string; href: string }[];
        socialLinks: {
            twitter?: string;
            github?: string;
            linkedin?: string;
        };
    };
}

export function Footer({ footerData }: FooterProps) {
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
        socialLinks: {
            twitter: 'https://twitter.com',
            github: 'https://github.com',
            linkedin: 'https://linkedin.com',
        },
    };
    return (
        <footer className="border-t border-border/40 bg-muted/30">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Logo size="sm" />
                        <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                            {data.description}
                        </p>
                        <div className="mt-6 flex gap-4">
                            <a
                                href={data.socialLinks.twitter || 'https://twitter.com'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </a>
                            <a
                                href={data.socialLinks.github || 'https://github.com'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </a>
                            <a
                                href={data.socialLinks.linkedin || 'https://linkedin.com'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
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

                <div className="mt-12 border-t border-border/40 pt-8">
                    <p className="text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Pathway. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
