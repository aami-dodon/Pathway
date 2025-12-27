import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Briefcase,
    Calendar,
    Clock,
    Globe,
    Linkedin,
    MapPin,
    Star,
    Twitter,
    Award,
    BookOpen,
    Video,
    CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CoachProfile, PaginatedResponse, Course, API_BASE_URL, api } from "@/lib/api";
import BookingCalendar from "./BookingCalendar";



export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function getCoachBySlug(slug: string): Promise<CoachProfile | null> {
    try {
        return await api.getCoachProfileBySlug(slug);
    } catch (error) {
        console.error("Failed to fetch coach by slug:", error);
        return null;
    }
}

async function getCoachCourses(coachId: string): Promise<Course[]> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/courses?where[instructor][equals]=${coachId}&where[isPublished][equals]=true&limit=10`,
            { next: { revalidate: 60 } }
        );

        if (!response.ok) return [];

        const data: PaginatedResponse<Course> = await response.json();
        return data.docs;
    } catch (error) {
        console.error("Failed to fetch coach courses:", error);
        return [];
    }
}

export default async function CoachProfilePage({ params }: PageProps) {
    const { slug } = await params;
    const coach = await getCoachBySlug(slug);

    if (!coach) {
        notFound();
    }

    const courses = await getCoachCourses(coach.id);

    const initials = coach.displayName
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .slice(0, 2);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background">
                <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href="/coaches"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Coaches
                    </Link>

                    {/* Profile Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <Avatar className="h-40 w-40 ring-4 ring-background shadow-xl">
                            {coach.profilePhoto ? (
                                <AvatarImage
                                    src={coach.profilePhoto.url}
                                    alt={coach.displayName}
                                />
                            ) : null}
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-4xl font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    {coach.displayName}
                                </h1>
                                {coach.isActive && (
                                    <Badge
                                        variant="default"
                                        className="bg-green-500/10 text-green-600 border-green-500/20"
                                    >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Available
                                    </Badge>
                                )}
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                                {coach.experience?.yearsOfExperience && (
                                    <span className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {coach.experience.yearsOfExperience}+ years
                                        experience
                                    </span>
                                )}
                                {coach.timezone && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {coach.timezone}
                                    </span>
                                )}
                            </div>

                            {/* Bio */}
                            {coach.bio && (
                                <p className="text-muted-foreground leading-relaxed max-w-2xl">
                                    {coach.bio}
                                </p>
                            )}

                            {/* Social Links */}
                            <div className="flex gap-3 mt-6">
                                {coach.socialLinks?.website && (
                                    <a
                                        href={coach.socialLinks.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                                    >
                                        <Globe className="h-4 w-4" />
                                        Website
                                    </a>
                                )}
                                {coach.socialLinks?.linkedin && (
                                    <a
                                        href={coach.socialLinks.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                                    >
                                        <Linkedin className="h-4 w-4" />
                                        LinkedIn
                                    </a>
                                )}
                                {coach.socialLinks?.twitter && (
                                    <a
                                        href={coach.socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
                                    >
                                        <Twitter className="h-4 w-4" />
                                        Twitter
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Expertise */}
                            {coach.expertise && coach.expertise.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5 text-primary" />
                                            Areas of Expertise
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {coach.expertise.map((exp, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="text-sm py-1.5 px-3"
                                                >
                                                    {exp.area}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Experience & Credentials */}
                            {coach.experience && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-primary" />
                                            Experience & Credentials
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {coach.experience.credentials && (
                                            <div>
                                                <h4 className="font-medium mb-2">
                                                    Certifications & Qualifications
                                                </h4>
                                                <p className="text-muted-foreground whitespace-pre-line">
                                                    {coach.experience.credentials}
                                                </p>
                                            </div>
                                        )}
                                        {coach.experience.previousWork && (
                                            <div>
                                                <h4 className="font-medium mb-2">
                                                    Notable Work & Achievements
                                                </h4>
                                                <p className="text-muted-foreground whitespace-pre-line">
                                                    {coach.experience.previousWork}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Courses by this Coach */}
                            {courses.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5 text-primary" />
                                            Courses by {coach.displayName}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {courses.map((course) => (
                                                <Link
                                                    key={course.id}
                                                    href={`/courses/${course.slug}`}
                                                    className="flex gap-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all group"
                                                >
                                                    {course.thumbnail && (
                                                        <img
                                                            src={course.thumbnail.url}
                                                            alt={course.title}
                                                            className="w-24 h-16 object-cover rounded-md"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium group-hover:text-primary transition-colors truncate">
                                                            {course.title}
                                                        </h4>
                                                        {course.shortDescription && (
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {course.shortDescription}
                                                            </p>
                                                        )}
                                                        {course.difficulty && (
                                                            <Badge
                                                                variant="outline"
                                                                className="mt-2 text-xs capitalize"
                                                            >
                                                                {course.difficulty}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Booking */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <Card className="border-primary/20 shadow-lg">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Video className="h-5 w-5 text-primary" />
                                            Book a Session
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            Schedule a 1-on-1 coaching session with{" "}
                                            {coach.displayName.split(" ")[0]}
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        <Suspense
                                            fallback={
                                                <div className="space-y-4">
                                                    <Skeleton className="h-64 w-full" />
                                                    <Skeleton className="h-10 w-full" />
                                                </div>
                                            }
                                        >
                                            <BookingCalendar
                                                coachId={coach.id}
                                                coachName={coach.displayName}
                                                timezone={coach.timezone}
                                            />
                                        </Suspense>

                                        <Separator className="my-6" />

                                        {/* Session Info */}
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">30 min session</p>
                                                    <p className="text-muted-foreground">
                                                        One-on-one video call
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Video className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Zoom Meeting</p>
                                                    <p className="text-muted-foreground">
                                                        Link sent after confirmation
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">
                                                        {coach.timezone || "UTC"}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        Coach&apos;s timezone
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
