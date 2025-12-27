import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Post, CoachProfile, PaginatedResponse, API_BASE_URL } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getPosts(): Promise<Post[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/posts?limit=12&where[status][equals]=published`,
            {
                next: { revalidate: 60 }, // Cache for 60 seconds
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch posts:", response.status);
            return [];
        }

        const data: PaginatedResponse<Post> = await response.json();
        return data.docs;
    } catch (error) {
        console.error("Failed to fetch posts:", error);
        return [];
    }
}

function PostCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0">
                <Skeleton className="h-4 w-32" />
            </CardFooter>
        </Card>
    );
}



async function PostsGrid() {
    const posts = await getPosts();

    if (posts.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div className="rounded-2xl bg-muted/50 p-8">
                    <h3 className="text-lg font-semibold">No posts yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Check back soon for new content from our experts.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </>
    );
}

export default function BlogPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <Badge variant="secondary" className="mb-4">
                            Blog
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            Insights from Our Experts
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Discover articles, tutorials, and thoughts from our community of
                            coaches and creators.
                        </p>
                    </div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <Suspense
                            fallback={
                                <>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <PostCardSkeleton key={i} />
                                    ))}
                                </>
                            }
                        >
                            <PostsGrid />
                        </Suspense>
                    </div>
                </div>
            </section>
        </div>
    );
}
