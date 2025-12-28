
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
        const enrollmentRes = await fetch(`${API_BASE_URL}/api/enrollments?where[subscriber][equals]=${subscriberId}&where[status][equals]=active&depth=2`, {
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
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((enrollment: any) => {
                            const course = enrollment.course as Course;
                            // Basic progress calculation could go here if we fetched it
                            // For now, simple card
                            return (
                                <Card key={enrollment.id} className="overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
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
                                            <Badge variant={enrollment.status === 'active' ? "default" : "secondary"}>
                                                {enrollment.status === 'active' ? 'In Progress' : enrollment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                                        {course.shortDescription && (
                                            <CardDescription className="line-clamp-2">
                                                {course.shortDescription}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="h-4 w-4" />
                                                <span>{(course.modules as any[])?.length || 0} Modules</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button asChild className="w-full">
                                            <Link href={`/courses/${course.slug}/learn`}>
                                                <PlayCircle className="mr-2 h-4 w-4" /> Continue Learning
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
