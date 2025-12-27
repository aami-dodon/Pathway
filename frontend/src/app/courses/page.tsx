import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Users, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Course, CoachProfile, PaginatedResponse, API_BASE_URL, CoursesPageData, api } from "@/lib/api";
import { SidebarFilter } from "@/components/filters/SidebarFilter";
import { MobileFilterDrawer } from "@/components/filters/MobileFilterDrawer";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

async function getCoursesPageData(): Promise<CoursesPageData | null> {
    try {
        return await api.getGlobal<CoursesPageData>('courses-page', { cache: 'no-store' });
    } catch (error) {
        console.error("Failed to fetch courses page data:", error);
        return null;
    }
}



async function getCourses(searchParams: { [key: string]: string | string[] | undefined }): Promise<Course[]> {
    try {
        const queryString = new URLSearchParams();
        queryString.set('limit', '20');
        queryString.set('depth', '2');
        queryString.set('where[isPublished][equals]', 'true');

        if (searchParams.search) {
            try {
                const searchRes = await fetch(
                    `${API_BASE_URL}/api/search?q=${encodeURIComponent(searchParams.search as string)}&index=courses&limit=50`,
                    { next: { revalidate: 0 } }
                );

                if (searchRes.ok) {
                    const searchData = await searchRes.json();
                    const ids = searchData.hits?.map((hit: any) => hit.id) || [];

                    if (ids.length === 0) return [];

                    queryString.set('where[id][in]', ids.join(','));
                }
            } catch (err) {
                console.error("Meilisearch lookup failed, falling back to Payload:", err);
                queryString.set('where[title][like]', searchParams.search as string);
            }
        }

        if (searchParams.category) {
            queryString.set('where[category][in]', searchParams.category as string);
        }

        if (searchParams.difficulty) {
            queryString.set('where[difficulty][in]', searchParams.difficulty as string);
        }

        const response = await fetch(
            `${API_BASE_URL}/api/courses?${queryString.toString()}`,
            {
                next: { revalidate: 0 },
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch courses:", response.status);
            return [];
        }

        const data: PaginatedResponse<Course> = await response.json();
        return data.docs;
    } catch (error) {
        console.error("Failed to fetch courses:", error);
        return [];
    }
}

function CourseCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <CardContent className="p-6">
                <div className="flex gap-2 mb-3">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0">
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    );
}





export default async function CoursesPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const pageData = await getCoursesPageData();
    const courses = await getCourses(searchParams);
    const categoriesRes = await api.getCategories();

    // Fallback data
    const data = pageData || {
        hero: {
            badge: 'Courses',
            title: 'Learn New Skills',
            description: 'Explore our catalog of expert-led courses designed to help you grow professionally and personally.',
        },
    };
    return (
        <div className="min-h-screen">
            <PageHeader
                badge={data.hero.badge}
                title={data.hero.title}
                description={data.hero.description}
            />

            {/* Main Content */}
            <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filters */}
                    <div className="lg:hidden mb-6">
                        <MobileFilterDrawer>
                            <CourseFilters categories={categoriesRes.docs} />
                        </MobileFilterDrawer>
                    </div>

                    {/* Desktop Sidebar */}
                    <SidebarFilter>
                        <CourseFilters categories={categoriesRes.docs} />
                    </SidebarFilter>


                    {/* Content Grid */}
                    <div className="flex-1">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {courses.length > 0 ? (
                                courses.map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                                    <div className="rounded-2xl bg-muted/50 p-8">
                                        <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold">No courses found</h3>
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
