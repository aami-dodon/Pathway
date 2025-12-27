import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Page, PaginatedResponse, API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

interface StaticPageProps {
    params: Promise<{ slug: string }>;
}

import { ContactForm } from "@/components/home/ContactForm";

async function getPageBySlug(slug: string): Promise<Page | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[status][equals]=published&depth=2`,
            {
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch page:", response.status);
            return null;
        }

        const data: PaginatedResponse<Page> = await response.json();
        return data.docs[0] || null;
    } catch (error) {
        console.error("Failed to fetch page:", error);
        return null;
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: StaticPageProps) {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page) {
        return {
            title: "Page Not Found",
        };
    }

    return {
        title: page.seo?.metaTitle || `${page.title} - Pathway`,
        description: page.seo?.metaDescription,
        openGraph: {
            title: page.seo?.metaTitle || page.title,
            description: page.seo?.metaDescription,
            type: "website",
            images: page.seo?.ogImage ? [{ url: page.seo.ogImage.url }] : [],
        },
    };
}

// Helper to render rich text content
function RichTextContent({ content }: { content: unknown }) {
    if (!content) return null;

    // Handle Payload's Lexical rich text format
    if (typeof content === "object" && content !== null && "root" in content) {
        const root = (content as { root: { children: unknown[] } }).root;
        return (
            <div className="prose prose-slate dark:prose-invert max-w-none">
                {renderLexicalNodes(root.children)}
            </div>
        );
    }

    // Fallback for simple text
    if (typeof content === "string") {
        return <div className="prose prose-slate dark:prose-invert max-w-none">{content}</div>;
    }

    return null;
}

function renderLexicalNodes(nodes: unknown[]): React.ReactNode {
    if (!Array.isArray(nodes)) return null;

    return nodes.map((node, index) => {
        const typedNode = node as {
            type: string;
            text?: string;
            format?: number;
            children?: unknown[];
            tag?: string;
            listType?: string;
            url?: string;
        };

        switch (typedNode.type) {
            case "paragraph":
                return (
                    <p key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </p>
                );
            case "heading": {
                const tag = typedNode.tag || "h2";
                const validTags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
                const HeadingTag = (validTags.includes(tag as typeof validTags[number]) ? tag : "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
                return (
                    <HeadingTag key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </HeadingTag>
                );
            }
            case "text":
                let text: React.ReactNode = typedNode.text || "";
                const format = typedNode.format || 0;
                if (format & 1) text = <strong key={`bold-${index}`}>{text}</strong>;
                if (format & 2) text = <em key={`italic-${index}`}>{text}</em>;
                if (format & 8) text = <u key={`underline-${index}`}>{text}</u>;
                if (format & 16) text = <code key={`code-${index}`}>{text}</code>;
                return <span key={index}>{text}</span>;
            case "list":
                const ListTag = typedNode.listType === "number" ? "ol" : "ul";
                return (
                    <ListTag key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </ListTag>
                );
            case "listitem":
                return (
                    <li key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </li>
                );
            case "link":
                return (
                    <a key={index} href={typedNode.url} className="text-primary hover:underline">
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </a>
                );
            case "quote":
                return (
                    <blockquote key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </blockquote>
                );
            case "linebreak":
                return <br key={index} />;
            default:
                if (typedNode.children) {
                    return <span key={index}>{renderLexicalNodes(typedNode.children)}</span>;
                }
                return null;
        }
    });
}

export default async function StaticPage({ params }: StaticPageProps) {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page) {
        notFound();
    }

    return (
        <article className="min-h-screen">
            {/* Hero Section */}
            <section className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                    {/* Back Button */}
                    <Button variant="ghost" asChild className="mb-8 -ml-4">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>

                    <div className="mx-auto max-w-3xl">
                        {/* Title */}
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            {page.title}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl">
                        <RichTextContent content={page.content} />

                        {slug === 'contact' && (
                            <div className="mt-12">
                                <ContactForm />
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </article>
    );
}
