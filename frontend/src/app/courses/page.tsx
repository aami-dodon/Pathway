import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Users, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Course, CoachProfile, PaginatedResponse, API_BASE_URL, CoursesPageData, api } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getCoursesPageData(): Promise<CoursesPageData | null> {
    try {
        return await api.getGlobal<CoursesPageData>('courses-page', { cache: 'no-store' });
    } catch (error) {
        console.error("Failed to fetch courses page data:", error);
        return null;
    }
}



async function getCourses(): Promise<Course[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/courses?where[isPublished][equals]=true&depth=2&limit=20`,
            {
                next: { revalidate: 60 },
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



async function CoursesGrid() {
    const courses = await getCourses();

    if (courses.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div className="rounded-2xl bg-muted/50 p-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No courses available yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Check back soon for new courses from our experts.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </>
    );
}

export default async function CoursesPage() {
    const pageData = await getCoursesPageData();

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
            {/* Hero */}
            <section className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <Badge variant="secondary" className="mb-4">
                            {data.hero.badge}
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            {data.hero.title}
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {data.hero.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        <Suspense
                            fallback={
                                <>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <CourseCardSkeleton key={i} />
                                    ))}
                                </>
                            }
                        >
                            <CoursesGrid />
                        </Suspense>
                    </div>
                </div>
            </section>
        </div>
    );
}
