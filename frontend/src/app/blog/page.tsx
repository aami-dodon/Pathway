import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { PostCard } from "@/components/blog/PostCard";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Post, CoachProfile, PaginatedResponse, API_BASE_URL, BlogPageData, api } from "@/lib/api";
import { SidebarFilter } from "@/components/filters/SidebarFilter";
import { MobileFilterDrawer } from "@/components/filters/MobileFilterDrawer";
import { BlogFilters } from "@/components/blog/BlogFilters";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

async function getBlogPageData(): Promise<BlogPageData | null> {
    try {
        return await api.getGlobal<BlogPageData>('blog-page', { cache: 'no-store' });
    } catch (error) {
        console.error("Failed to fetch blog page data:", error);
        return null;
    }
}

async function getPosts(searchParams: { [key: string]: string | string[] | undefined }): Promise<Post[]> {
    try {
        const queryString = new URLSearchParams();
        queryString.set('where[isPublished][equals]', 'true');
        queryString.set('limit', '12');

        // NEW: Meilisearch-powered search
        if (searchParams.search) {
            try {
                const searchRes = await fetch(
                    `${API_BASE_URL}/api/search?q=${encodeURIComponent(searchParams.search as string)}&index=posts&limit=50`,
                    { next: { revalidate: 0 } }
                );

                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    const ids = searchData.hits?.map((hit: any) => hit.id) || [];

                    if (ids.length === 0) return [];

                    // Filter by IDs in Payload to get full data
                    queryString.set('where[id][in]', ids.join(','));
                }
            } catch (err) {
                console.error("Meilisearch lookup failed, falling back to Payload:", err);
                queryString.set('where[title][like]', searchParams.search as string);
            }
        }

        // Handle Category (support multiple)
        if (searchParams.category) {
            queryString.set('where[category][in]', searchParams.category as string);
        }

        // Handle Tags (support multiple)
        if (searchParams.tags) {
            queryString.set('where[tags][in]', searchParams.tags as string);
        }

        const response = await fetch(
            `${API_BASE_URL}/api/posts?${queryString.toString()}`,
            {
                next: { revalidate: 0 },
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch posts:", response.status);
            return [];
        }

        const data: PaginatedResponse<Post> = await response.json();

        // If we searched via Meilisearch, we should ideally preserve the ranking order
        if (searchParams.search && data.docs) {
            // Mapping docs by ID for quick lookup
            const docsById = data.docs.reduce((acc, doc) => {
                acc[doc.id] = doc;
                return acc;
            }, {} as Record<string, Post>);

            // Re-fetch IDs from Meilisearch if needed or just re-request the hit list
            // For now, let's keep it simple. If we want perfect ranking, we'd re-sort data.docs
            // based on the 'ids' array we got earlier.
        }

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





export default async function BlogPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const pageData = await getBlogPageData();
    const posts = await getPosts(searchParams);

    // Fetch filter data
    const categoriesRes = await api.getCategories();
    const tagsRes = await api.getTags();

    return (
        <div className="min-h-screen">
            <PageHeader
                badge={pageData?.hero?.badge || 'Blog'}
                title={pageData?.hero?.title || 'Insights from Our Experts'}
                description={pageData?.hero?.description || 'Discover articles, tutorials, and thoughts from our community of coaches and creators.'}
            />

            {/* Main Content */}
            <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filters */}
                    <div className="lg:hidden mb-6">
                        <MobileFilterDrawer>
                            <BlogFilters categories={categoriesRes.docs} tags={tagsRes.docs} />
                        </MobileFilterDrawer>
                    </div>

                    {/* Desktop Sidebar */}
                    <SidebarFilter>
                        <BlogFilters categories={categoriesRes.docs} tags={tagsRes.docs} />
                    </SidebarFilter>

                    {/* Content Grid */}
                    <div className="flex-1">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                                    <div className="rounded-2xl bg-muted/50 p-8">
                                        <h3 className="text-lg font-semibold">No posts found</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Try adjusting your filters or search terms.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
