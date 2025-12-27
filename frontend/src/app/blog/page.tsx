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
        const params: any = {
            limit: 12,
            where: {
                isPublished: { equals: true },
            },
        };

        // Handle Search
        if (searchParams.search) {
            params.where.title = { like: searchParams.search };
        }

        // Handle Category (support multiple)
        if (searchParams.category) {
            const categories = (searchParams.category as string).split(',');
            params.where.category = { in: categories };
        }

        // Handle Tags (support multiple)
        if (searchParams.tags) {
            const tags = (searchParams.tags as string).split(',');
            params.where.tags = { in: tags };
        }

        const queryString = new URLSearchParams();
        if (params.limit) queryString.set('limit', params.limit.toString());

        // Construct 'where' query manually for nested objects if needed, 
        // or rely on a query builder. standard Payload query params structure:
        // where[field][operator]=value

        if (searchParams.search) {
            queryString.set('where[title][like]', searchParams.search as string);
        }

        if (searchParams.category) {
            // "in" operator expects comma separated values
            queryString.set('where[category][in]', searchParams.category as string);
        }

        if (searchParams.tags) {
            queryString.set('where[tags][in]', searchParams.tags as string);
        }

        queryString.set('where[isPublished][equals]', 'true');

        const response = await fetch(
            `${API_BASE_URL}/api/posts?${queryString.toString()}`,
            {
                next: { revalidate: 0 }, // Disable cache for filtering
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
