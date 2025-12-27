import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface FooterProps {
    footerData?: {
        description: string;
        productLinks: { name: string; href: string }[];
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
    const data = footerData || {
        description: 'Learn from expert coaches and accelerate your personal and professional growth.',
        productLinks: [
            { name: "Courses", href: "/courses" },
            { name: "Blog", href: "/blog" },
            { name: "Coaches", href: "/coaches" },
        ],
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
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
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

                    {/* Product Links */}
                    <div>
                        <h3 className="text-sm font-semibold">Product</h3>
                        <ul className="mt-4 space-y-3">
                            {data.productLinks.map((link) => (
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
