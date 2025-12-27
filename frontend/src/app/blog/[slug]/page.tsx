import { notFound } from "next/navigation";
import { headers } from "next/headers"; // Added import here
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock, Tag, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Post, CoachProfile, Category, Tag as TagType, PaginatedResponse, API_BASE_URL } from "@/lib/api";
import { SocialShare } from "@/components/social-share";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
    params: Promise<{ slug: string }>;
}


async function getPostBySlug(slug: string): Promise<Post | null> {
    try {
        const headersList = await headers();
        const cookie = headersList.get('cookie');

        const response = await fetch(
            `${API_BASE_URL}/api/posts?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`,
            {
                next: { revalidate: 60 },
                headers: {
                    'Content-Type': 'application/json',
                    ...(cookie ? { Cookie: cookie } : {}),
                }
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch post:", response.status);
            return null;
        }

        const data: PaginatedResponse<Post> = await response.json();
        return data.docs[0] || null;
    } catch (error) {
        console.error("Failed to fetch post:", error);
        return null;
    }
}

// Generate static params for static generation (optional)
export async function generateStaticParams() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/posts?where[isPublished][equals]=true&limit=100`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) return [];

        const data: PaginatedResponse<Post> = await response.json();
        return data.docs.map((post) => ({
            slug: post.slug,
        }));
    } catch {
        return [];
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: `${post.title} - Pathway Blog`,
        description: post.excerpt || post.seo?.metaDescription,
        openGraph: {
            title: post.seo?.metaTitle || post.title,
            description: post.seo?.metaDescription || post.excerpt,
            type: "article",
            publishedTime: post.publishedAt,
            images: post.featuredImage ? [{ url: post.featuredImage.url }] : [],
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const author = post.author as CoachProfile | undefined;
    const category = post.category as Category | undefined;
    const tags = (post.tags || []) as TagType[];

    const publishedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : null;

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://pathway.com"}/blog/${post.slug}`;

    return (
        <article className="min-h-screen">
            {/* Hero Section */}
            <section className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                    {/* Back Button */}
                    <Button variant="ghost" asChild className="mb-8 -ml-4">
                        <Link href="/blog">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Link>
                    </Button>

                    <div className="mx-auto max-w-3xl">
                        {/* Category Badge */}
                        {category && (
                            <Badge variant="secondary" className="mb-4">
                                {category.name}
                            </Badge>
                        )}

                        {/* Access Level */}
                        {post.accessLevel === "subscribers" && (
                            <Badge variant="outline" className="mb-4 ml-2 border-primary/30 text-primary">
                                Subscribers Only
                            </Badge>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            {post.title}
                        </h1>

                        {/* Excerpt */}
                        {post.excerpt && (
                            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                                {post.excerpt}
                            </p>
                        )}

                        {/* Meta Info */}
                        <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            {/* Author */}
                            {author && (
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        {author.profilePhoto && (
                                            <AvatarImage src={author.profilePhoto.url} alt={author.displayName} />
                                        )}
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm">
                                            {author.displayName
                                                .split(" ")
                                                .map((n) => n.charAt(0))
                                                .join("")
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-foreground">{author.displayName}</p>
                                        <p className="text-xs">Author</p>
                                    </div>
                                </div>
                            )}

                            {/* Date */}
                            {publishedDate && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {publishedDate}
                                </div>
                            )}

                            {/* Reading Time (estimate) */}
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                5 min read
                            </div>
                        </div>

                        {/* Social Share */}
                        <div className="mt-8">
                            <SocialShare url={shareUrl} title={post.title} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Image */}
            {post.featuredImage && (
                <section className="border-b border-border/40">
                    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl">
                            <img
                                src={post.featuredImage.url}
                                alt={post.title}
                                className="w-full h-auto object-cover aspect-video"
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Content */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl">

                        {(!post.content && post.accessLevel === 'subscribers') ? (
                            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center sm:p-12">
                                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                                    <Lock className="h-8 w-8 text-destructive" />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold">Subscribers Only Content</h2>
                                <p className="mb-8 text-muted-foreground">
                                    This article is exclusive to our subscribers. Sign in or create an account to unlock full access.
                                </p>
                                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                    <Button asChild size="sm">
                                        <Link href="/login">Log in</Link>
                                    </Button>
                                    <Button asChild variant="outline" size="sm">
                                        <Link href="/register">Register</Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <RichTextContent content={post.content} />
                        )}

                        {/* Tags */}
                        {tags.length > 0 && (
                            <>
                                <Separator className="my-8" />
                                <div className="flex flex-wrap items-center gap-2">
                                    <Tag className="h-4 w-4 text-muted-foreground" />
                                    {tags.map((tag) => (
                                        <Badge key={tag.id} variant="outline" className="text-xs">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Author Bio */}
                        {author && (
                            <>
                                <Separator className="my-8" />
                                <div className="rounded-xl bg-muted/50 p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-16 w-16 ring-2 ring-background">
                                            {author.profilePhoto && (
                                                <AvatarImage src={author.profilePhoto.url} alt={author.displayName} />
                                            )}
                                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-lg">
                                                {author.displayName
                                                    .split(" ")
                                                    .map((n) => n.charAt(0))
                                                    .join("")
                                                    .slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{author.displayName}</h3>
                                            {author.bio && (
                                                <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                                                    {author.bio}
                                                </p>
                                            )}
                                            <Button variant="link" size="sm" asChild className="mt-2 h-auto p-0">
                                                <Link href={`/coaches/${author.slug}`}>View Profile →</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </article>
    );
}
