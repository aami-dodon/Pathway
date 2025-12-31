import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Page, PaginatedResponse, API_BASE_URL } from "@/lib/api";
import { RichTextContent } from "@/components/RichTextContent";

export const dynamic = "force-dynamic";

interface StaticPageProps {
    params: Promise<{ slug: string }>;
}

import { ContactForm } from "@/components/home/ContactForm";

async function getPageBySlug(slug: string): Promise<Page | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}&where[isPublished][equals]=true&depth=2`,
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
            ...(page.seo?.ogImage ? { images: [{ url: page.seo.ogImage.url }] } : {}),
        },
    };
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
