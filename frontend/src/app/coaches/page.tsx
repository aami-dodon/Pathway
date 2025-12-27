import { Suspense } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Briefcase,
    Globe,
    Linkedin,
    Twitter,
    MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachProfile, PaginatedResponse, API_BASE_URL, CoachesPageData, api } from "@/lib/api";

export const dynamic = "force-dynamic";

async function getCoachesPageData(): Promise<CoachesPageData | null> {
    try {
        return await api.getGlobal<CoachesPageData>('coaches-page', { cache: 'no-store' });
    } catch (error) {
        console.error("Failed to fetch coaches page data:", error);
        return null;
    }
}

async function getCoaches(): Promise<CoachProfile[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/coach-profiles?limit=20`, {
            next: { revalidate: 60 }, // Cache for 60 seconds
        });

        if (!response.ok) {
            console.error("Failed to fetch coaches:", response.status);
            return [];
        }

        const data: PaginatedResponse<CoachProfile> = await response.json();
        return data.docs.filter((coach) => coach.isActive);
    } catch (error) {
        console.error("Failed to fetch coaches:", error);
        return [];
    }
}

function CoachCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-16 w-full mt-4" />
                <div className="flex gap-2 mt-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </CardContent>
        </Card>
    );
}

function CoachCard({ coach }: { coach: CoachProfile }) {
    const expertise = coach.expertise?.slice(0, 3) || [];

    return (
        <Card className="h-full overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group relative">
            <Link href={`/coaches/${coach.slug}`} className="absolute inset-0 z-10">
                <span className="sr-only">View Profile values</span>
            </Link>
            <CardContent className="p-6">
                {/* Profile Header */}
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-background shadow-lg">
                        {coach.profilePhoto ? (
                            <AvatarImage
                                src={coach.profilePhoto.url}
                                alt={coach.displayName}
                            />
                        ) : null}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-lg font-semibold">
                            {coach.displayName
                                .split(" ")
                                .map((n) => n.charAt(0))
                                .join("")
                                .slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate transition-colors group-hover:text-primary">
                            {coach.displayName}
                        </h3>
                        {coach.experience?.yearsOfExperience && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {coach.experience.yearsOfExperience}+ years experience
                            </p>
                        )}
                        {coach.timezone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                {coach.timezone}
                            </p>
                        )}
                    </div>
                </div>

                {/* Bio */}
                {coach.bio && (
                    <p className="mt-4 text-sm text-muted-foreground line-clamp-3">
                        {coach.bio}
                    </p>
                )}

                {/* Expertise Tags */}
                {expertise.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {expertise.map((exp, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs font-normal"
                            >
                                {exp.area}
                            </Badge>
                        ))}
                        {coach.expertise && coach.expertise.length > 3 && (
                            <Badge variant="outline" className="text-xs font-normal">
                                +{coach.expertise.length - 3} more
                            </Badge>
                        )}
                    </div>
                )}

                {/* Social Links & CTA */}
                <div className="mt-6 flex items-center justify-between relative z-20">
                    <div className="flex gap-2">
                        {coach.socialLinks?.website && (
                            <a
                                href={coach.socialLinks.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Globe className="h-4 w-4" />
                            </a>
                        )}
                        {coach.socialLinks?.linkedin && (
                            <a
                                href={coach.socialLinks.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Linkedin className="h-4 w-4" />
                            </a>
                        )}
                        {coach.socialLinks?.twitter && (
                            <a
                                href={coach.socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                        )}
                    </div>

                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                        View Profile
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

async function CoachesGrid() {
    const coaches = await getCoaches();

    if (coaches.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <div className="rounded-2xl bg-muted/50 p-8">
                    <h3 className="text-lg font-semibold">No coaches available yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Check back soon for our expert coaches.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {coaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
            ))}
        </>
    );
}

export default async function CoachesPage() {
    const pageData = await getCoachesPageData();

    // Fallback data
    const data = pageData || {
        hero: {
            badge: 'Our Coaches',
            title: 'Learn from the Best',
            description: 'Connect with experienced professionals ready to guide your journey to success.',
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

            {/* Coaches Grid */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <Suspense
                            fallback={
                                <>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <CoachCardSkeleton key={i} />
                                    ))}
                                </>
                            }
                        >
                            <CoachesGrid />
                        </Suspense>
                    </div>
                </div>
            </section>
        </div>
    );
}
