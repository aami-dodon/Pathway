
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    GraduationCap,
    BookOpen,
    PlayCircle,
    CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, Course, PaginatedResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getMyCourses() {
    try {
        const headersList = await headers();
        const cookie = headersList.get('cookie');

        if (!cookie) return null;

        const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            cache: 'no-store',
        });

        if (!userRes.ok) return null;
        const userData = await userRes.json();
        const user = userData.user;

        if (!user) return null;

        // Get Subscriber ID
        const profileRes = await fetch(`${API_BASE_URL}/api/subscriber-profiles?where[user][equals]=${user.id}`, {
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            cache: 'no-store'
        });

        if (!profileRes.ok) return { user, courses: [] };

        const profileData = await profileRes.json();
        const subscriberId = profileData.docs?.[0]?.id;

        if (!subscriberId) return { user, courses: [] };

        // Get Enrollments
        const enrollmentRes = await fetch(`${API_BASE_URL}/api/enrollments?where[subscriber][equals]=${subscriberId}&where[status][in]=active,completed&depth=2&sort=-enrolledAt`, {
            headers: { 'Content-Type': 'application/json', Cookie: cookie },
            cache: 'no-store'
        });

        const enrollmentData = await enrollmentRes.json();

        // Enrich with progress (optional: doing N+1 fetch here might be slow, for V1 we skip exact progress %)
        // For a true "My Courses" page you'd want progress bars. 
        // Let's implement a basic fetch for progress count if feasible, or just show "In Progress".

        return {
            user,
            enrollments: enrollmentData.docs || []
        };

    } catch (error) {
        console.error("Failed to fetch my courses:", error);
        return null;
    }
}

export default async function MyCoursesPage() {
    const data = await getMyCourses();

    if (!data || !data.user) {
        redirect("/login?redirect=/my-courses");
    }

    const { enrollments } = data;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                        <p className="text-muted-foreground mt-2">
                            Pick up where you left off
                        </p>
                    </div>
                </div>

                {enrollments.length === 0 ? (
                    <div className="text-center py-20 bg-muted/30 rounded-lg border border-border border-dashed">
                        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No enrollments yet</h3>
                        <p className="text-muted-foreground mb-6">You haven't enrolled in any courses yet.</p>
                        <Button asChild>
                            <Link href="/courses">Browse Courses</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* In Progress Section */}
                        {enrollments.filter((e: any) => e.status !== 'completed').length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-8 w-1 bg-primary rounded-full" />
                                    <h2 className="text-xl font-semibold">In Progress</h2>
                                    <Badge variant="secondary" className="ml-2">
                                        {enrollments.filter((e: any) => e.status !== 'completed').length}
                                    </Badge>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {enrollments
                                        .filter((e: any) => e.status !== 'completed')
                                        .map((enrollment: any) => (
                                            <CourseCard key={enrollment.id} enrollment={enrollment} />
                                        ))}
                                </div>
                            </section>
                        )}

                        {/* Completed Section */}
                        {enrollments.filter((e: any) => e.status === 'completed').length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-8 w-1 bg-primary/70 rounded-full" />
                                    <h2 className="text-xl font-semibold">Completed</h2>
                                    <Badge variant="secondary" className="ml-2">
                                        {enrollments.filter((e: any) => e.status === 'completed').length}
                                    </Badge>
                                </div>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {enrollments
                                        .filter((e: any) => e.status === 'completed')
                                        .map((enrollment: any) => (
                                            <CourseCard key={enrollment.id} enrollment={enrollment} />
                                        ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function CourseCard({ enrollment }: { enrollment: any }) {
    const course = enrollment.course as Course;
    return (
        <Card key={enrollment.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
            <div className="aspect-video bg-muted relative">
                {course.thumbnail ? (
                    <img
                        src={course.thumbnail.url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <GraduationCap className="h-10 w-10 text-primary/20" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge
                        variant={enrollment.status === 'completed' ? "secondary" : "default"}
                        className={cn(
                            enrollment.status === 'completed'
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-primary text-primary-foreground"
                        )}
                    >
                        {enrollment.status === 'completed' ? (
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Completed
                            </span>
                        ) : 'In Progress'}
                    </Badge>
                </div>
            </div>
            <CardHeader className="pb-4">
                <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                {course.shortDescription && (
                    <CardDescription className="line-clamp-2">
                        {course.shortDescription}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="flex-1">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold uppercase tracking-wider">
                            <span className="text-muted-foreground">Course Progress</span>
                            <span className="text-primary">
                                {enrollment.progress?.percentComplete || 0}%
                            </span>
                        </div>
                        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/5">
                            <div
                                className="h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                style={{ width: `${enrollment.progress?.percentComplete || 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span>{(course.modules as any[])?.length || 0} Modules</span>
                        </div>
                        {enrollment.status === 'completed' && (
                            <div className="flex items-center gap-1.5 text-primary">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Certificate Issued</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button asChild className="w-full h-11 rounded-lg font-semibold transition-all active:scale-[0.98]" variant={enrollment.status === 'completed' ? "outline" : "default"}>
                    <Link href={`/courses/${course.slug}/learn`}>
                        {enrollment.status === 'completed' ? (
                            <>
                                <PlayCircle className="mr-2 h-4 w-4" /> Review Lessons
                            </>
                        ) : (
                            <>
                                <PlayCircle className="mr-2 h-4 w-4" /> Continue Learning
                            </>
                        )}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
