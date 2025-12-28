import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import React from "react";
import {
    ArrowLeft,
    Clock,
    Users,
    BookOpen,
    GraduationCap,
    CheckCircle2,
    PlayCircle,
    FileText,
    Headphones,
    MessageSquare,
    Video,
    Download,
    Calendar,
    Lock,
    Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Course,
    CoachProfile,
    Module,
    Lesson,
    Category,
    Tag,
    PaginatedResponse,
    API_BASE_URL,
} from "@/lib/api";
import { SocialShare } from "@/components/social-share";
import { AuthNudge } from "@/components/auth-nudge";
import { EnrollmentAction } from "@/components/courses/EnrollmentAction";
import { CourseMoreDetails } from "@/components/courses/CourseMoreDetails";



export const dynamic = "force-dynamic";

interface CoursePageProps {
    params: Promise<{ slug: string }>;
}

async function getCourseBySlug(slug: string): Promise<Course | null> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/courses?where[slug][equals]=${encodeURIComponent(slug)}&depth=3`,
            {
                next: { revalidate: 60 },
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch course:", response.status);
            return null;
        }

        const data: PaginatedResponse<Course> = await response.json();
        return data.docs[0] || null;
    } catch (error) {
        console.error("Failed to fetch course:", error);
        return null;
    }
}

async function getUserAndEnrollmentStatus(courseId: string) {
    try {
        const headersList = await headers();
        const cookie = headersList.get('cookie');

        if (!cookie) {
            return { user: null, subscriberId: null, isEnrolled: false };
        }

        const userRes = await fetch(`${API_BASE_URL}/api/users/me`, {
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookie,
            },
            cache: 'no-store',
        });

        if (!userRes.ok) {
            return { user: null, subscriberId: null, isEnrolled: false };
        }

        const userData = await userRes.json();
        const user = userData.user;

        if (!user) return { user: null, subscriberId: null, isEnrolled: false };

        // Get Subscriber Profile
        const profileRes = await fetch(`${API_BASE_URL}/api/subscriber-profiles?where[user][equals]=${user.id}`, {
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookie
            },
            cache: 'no-store'
        });

        if (!profileRes.ok) return { user, subscriberId: null, isEnrolled: false };

        const profileData = await profileRes.json();
        const subscriberId = profileData.docs?.[0]?.id;

        if (!subscriberId) return { user, subscriberId: null, isEnrolled: false };

        // Check Enrollment
        const enrollmentRes = await fetch(`${API_BASE_URL}/api/enrollments?where[course][equals]=${courseId}&where[subscriber][equals]=${subscriberId}&where[status][equals]=active`, {
            headers: {
                'Content-Type': 'application/json',
                Cookie: cookie
            },
            cache: 'no-store'
        });

        const enrollmentData = await enrollmentRes.json();
        const isEnrolled = enrollmentData.docs && enrollmentData.docs.length > 0;

        return { user, subscriberId, isEnrolled };

    } catch (error) {
        console.error("Failed to check authentication details:", error);
        return { user: null, subscriberId: null, isEnrolled: false };
    }
}

export async function generateStaticParams() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/courses?where[isPublished][equals]=true&limit=100`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) return [];

        const data: PaginatedResponse<Course> = await response.json();
        return data.docs.map((course) => ({
            slug: course.slug,
        }));
    } catch {
        return [];
    }
}

export async function generateMetadata({ params }: CoursePageProps) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);

    if (!course) {
        return { title: "Course Not Found" };
    }

    return {
        title: `${course.title} - Pathway Courses`,
        description: course.shortDescription || course.seo?.metaDescription,
        openGraph: {
            title: course.seo?.metaTitle || course.title,
            description: course.seo?.metaDescription || course.shortDescription,
            type: "website",
            images: course.thumbnail ? [{ url: course.thumbnail.url }] : [],
        },
    };
}

function formatDuration(duration?: { hours?: number; minutes?: number }): string {
    if (!duration) return "Self-paced";
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;
    if (hours === 0 && minutes === 0) return "Self-paced";
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hours`;
    return `${hours}h ${minutes}m`;
}

function getLessonIcon(type: Lesson["type"]) {
    const icons = {
        video: Video,
        text: FileText,
        audio: Headphones,
        interactive: MessageSquare,
        assignment: FileText,
        quiz: CheckCircle2,
        live: Calendar,
        download: Download,
    };
    return icons[type] || FileText;
}
import { RichTextContent } from "@/components/RichTextContent";

export default async function CoursePage({ params }: CoursePageProps) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);

    if (!course) {
        notFound();
    }

    const { user, subscriberId, isEnrolled } = await getUserAndEnrollmentStatus(course.id);
    const isAuthenticated = !!user;
    const instructor = course.instructor as CoachProfile | undefined;
    const modules = (course.modules || []) as Module[];
    const category = course.category as Category | undefined;
    const tags = (course.tags || []) as Tag[];
    const learningOutcomes = (course.learningOutcomes || []) as { outcome?: string }[];

    // Calculate total lessons and duration
    let totalLessons = 0;
    let totalMinutes = 0;

    modules.forEach((module) => {
        const lessons = (module.lessons || []) as Lesson[];
        totalLessons += lessons.length;
        lessons.forEach((lesson) => {
            if (lesson.duration) {
                totalMinutes += (lesson.duration.hours || 0) * 60 + (lesson.duration.minutes || 0);
            }
        });
    });

    const courseDuration = course.duration
        ? formatDuration(course.duration)
        : totalMinutes > 0
            ? formatDuration({ hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 })
            : "Self-paced";

    const difficultyLabels = {
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        "all-levels": "All Levels",
    };

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://pathway.com"}/courses/${course.slug}`;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                        {/* Course Info */}
                        <div className="lg:col-span-2">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {category && (
                                    <Badge variant="secondary">{category.name}</Badge>
                                )}
                                {course.difficulty && (
                                    <Badge variant="outline">
                                        {difficultyLabels[course.difficulty]}
                                    </Badge>
                                )}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                                {course.title}
                            </h1>

                            {/* Short Description */}
                            {course.shortDescription && (
                                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                                    {course.shortDescription}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {courseDuration}
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    {modules.length} {modules.length === 1 ? "module" : "modules"}
                                </div>
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4" />
                                    {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                                </div>
                            </div>

                            {/* Instructor */}
                            {instructor && (
                                <div className="mt-8 flex items-center gap-4">
                                    <Avatar className="h-12 w-12 ring-2 ring-background">
                                        {instructor.profilePhoto && (
                                            <AvatarImage
                                                src={instructor.profilePhoto.url}
                                                alt={instructor.displayName}
                                            />
                                        )}
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                            {instructor.displayName
                                                .split(" ")
                                                .map((n) => n.charAt(0))
                                                .join("")
                                                .slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{instructor.displayName}</p>
                                        <p className="text-sm text-muted-foreground">Instructor</p>
                                    </div>
                                </div>
                            )}

                            {/* Social Share */}
                            <div className="mt-8">
                                <SocialShare url={shareUrl} title={course.title} />
                            </div>
                        </div>

                        {/* Enrollment Card */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24 overflow-hidden border-border/50 shadow-lg shadow-primary/5">
                                {/* Course Thumbnail */}
                                {course.coverImage || course.thumbnail ? (
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={(course.coverImage || course.thumbnail)?.url}
                                            alt={course.title}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                        <GraduationCap className="h-16 w-16 text-primary/30" />
                                    </div>
                                )}
                                <CardContent className="p-6">
                                    <EnrollmentAction
                                        courseId={course.id}
                                        courseSlug={course.slug}
                                        isOpen={course.enrollment?.isOpen !== false}
                                        isAuthenticated={isAuthenticated}
                                        isEnrolled={isEnrolled}
                                        subscriberId={subscriberId || undefined}
                                    />

                                    {!isAuthenticated && (
                                        <AuthNudge
                                            title="Login Required to Enroll"
                                            description="Please sign in or create an account to enroll in this course."
                                            redirectUrl={`/courses/${course.slug}`}
                                            className="mt-4"
                                        />
                                    )}

                                    <div className="mt-6 space-y-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Duration</span>
                                            <span className="font-medium">{courseDuration}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Modules</span>
                                            <span className="font-medium">{modules.length}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span className="text-muted-foreground">Lessons</span>
                                            <span className="font-medium">{totalLessons}</span>
                                        </div>
                                        {course.difficulty && (
                                            <>
                                                <Separator />
                                                <div className="flex items-center justify-between">
                                                    <span className="text-muted-foreground">Level</span>
                                                    <span className="font-medium">
                                                        {difficultyLabels[course.difficulty]}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Course Content */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <CourseMoreDetails course={course} />
                </div>
            </section>
        </div >
    );
}
