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
import { AuthNudge } from "@/components/auth-nudge";
import { RichTextContent } from "@/components/RichTextContent";

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
            images: post.featuredImage
                ? [{ url: post.featuredImage.url }]
                : [],
        },
    };
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
        <article className="min-h-screen bg-gradient-to-b from-muted/50 to-background pb-20">
            <div className="container mx-auto px-4 pt-18 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/40 bg-card shadow-sm">
                    {/* Hero Section (Top of Card) */}
                    <div className="relative min-h-[400px] sm:min-h-[500px] flex items-end justify-center text-center">
                        {/* Background Image */}
                        {post.featuredImage && (
                            <>
                                <img
                                    src={post.featuredImage.url}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                            </>
                        )}

                        {/* Fallback gradient if no image */}
                        {!post.featuredImage && (
                            <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
                        )}

                        {/* Hero Content */}
                        <div className="relative z-10 w-full px-6 py-12">
                            {/* Category Badge */}
                            {category && (
                                <Badge variant="secondary" className="mb-4">
                                    {category.name}
                                </Badge>
                            )}

                            {/* Access Level */}
                            {post.isSubscriberOnly && (
                                <Badge variant="outline" className="mb-4 ml-2 border-primary/30 text-primary bg-background/80 backdrop-blur-sm">
                                    Subscribers Only
                                </Badge>
                            )}

                            {/* Title */}
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                {post.title}
                            </h1>

                            {/* Excerpt */}
                            {post.excerpt && (
                                <p className="mt-4 text-lg text-muted-foreground leading-relaxed line-clamp-3">
                                    {post.excerpt}
                                </p>
                            )}

                            {/* Meta Info */}
                            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                                {/* Author */}
                                {author && (
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-background">
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
                                        <div className="text-left font-medium">
                                            <p className="text-foreground">{author.displayName}</p>
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

                                {/* Reading Time */}
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    5 min read
                                </div>
                            </div>

                            {/* Social Share */}
                            <div className="mt-8 flex justify-center">
                                <SocialShare url={shareUrl} title={post.title} />
                            </div>
                        </div>
                    </div>

                    {/* Main Content (Bottom of Card) */}
                    <div className="p-8 sm:p-12">
                        {(!post.content && post.isSubscriberOnly) ? (
                            <div className="mx-auto max-w-lg">
                                <AuthNudge
                                    title="Exclusive Subscriber Content"
                                    description="This article is exclusive to our subscribers. Sign in or create an account to unlock full access to deep dives, frameworks, and actionable growth strategies."
                                    redirectUrl={`/blog/${post.slug}`}
                                    className="p-8 sm:p-10"
                                />
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
                                <div className="rounded-xl bg-muted/30 p-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16 ring-2 ring-background shadow-sm">
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
                                            <h3 className="font-semibold text-lg">{author.displayName}</h3>
                                            {author.bio && (
                                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                                    {author.bio}
                                                </p>
                                            )}
                                            <Button variant="link" size="sm" asChild className="mt-2 h-auto p-0 font-medium">
                                                <Link href={`/coaches/${author.slug}`}>View Profile →</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
