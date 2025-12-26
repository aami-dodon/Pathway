import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Users, BookOpen, GraduationCap, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Course, CoachProfile, PaginatedResponse } from "@/lib/api";

export const dynamic = "force-dynamic";

const API_BASE_URL = (typeof window === 'undefined'
    ? (process.env.INTERNAL_API_URL || 'http://backend:9006')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9006'));

async function getCourses(): Promise<Course[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/courses?where[status][equals]=published&depth=2&limit=20`,
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

function formatDuration(duration?: { hours?: number; minutes?: number }): string {
    if (!duration) return "Self-paced";
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;
    if (hours === 0 && minutes === 0) return "Self-paced";
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours}h ${minutes}m`;
}

function CourseCard({ course }: { course: Course }) {
    const instructor = course.instructor as CoachProfile | undefined;
    const instructorName = instructor?.displayName || "Unknown Instructor";

    const difficultyColors = {
        beginner: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
        intermediate: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
        advanced: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
        "all-levels": "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    };

    const moduleCount = Array.isArray(course.modules) ? course.modules.length : 0;

    return (
        <Link href={`/courses/${course.slug}`} className="group block">
            <Card className="h-full overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail.url}
                            alt={course.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <GraduationCap className="h-12 w-12 text-primary/30" />
                        </div>
                    )}
                    {course.enrollment?.isOpen === false && (
                        <Badge className="absolute left-3 top-3 bg-orange-500 hover:bg-orange-600">
                            Enrollment Closed
                        </Badge>
                    )}
                </div>

                <CardContent className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {course.difficulty && (
                            <Badge variant="outline" className={difficultyColors[course.difficulty]}>
                                {course.difficulty === "all-levels" ? "All Levels" : course.difficulty}
                            </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDuration(course.duration)}
                        </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="line-clamp-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {course.title}
                    </h3>

                    {/* Description */}
                    {course.shortDescription && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {course.shortDescription}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {instructorName}
                        </span>
                        {moduleCount > 0 && (
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {moduleCount} {moduleCount === 1 ? "module" : "modules"}
                            </span>
                        )}
                    </div>

                    {/* Learning Outcomes Preview */}
                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                        <div className="mt-4 space-y-1">
                            {course.learningOutcomes.slice(0, 2).map((outcome, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 text-xs text-muted-foreground"
                                >
                                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                                    <span className="line-clamp-1">{outcome.outcome}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {course.enrollment?.isOpen !== false ? "Enroll Now" : "View Details"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </CardFooter>
            </Card>
        </Link>
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

export default function CoursesPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <Badge variant="secondary" className="mb-4">
                            Courses
                        </Badge>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                            Learn New Skills
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            Explore our catalog of expert-led courses designed to help you
                            grow professionally and personally.
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
