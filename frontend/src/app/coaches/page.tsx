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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CoachProfile, PaginatedResponse, API_BASE_URL, CoachesPageData, api } from "@/lib/api";
import { SidebarFilter } from "@/components/filters/SidebarFilter";
import { MobileFilterDrawer } from "@/components/filters/MobileFilterDrawer";
import { CoachFilters } from "@/components/coaches/CoachFilters";
import { PageHeader } from "@/components/layout/PageHeader";

export const dynamic = "force-dynamic";

async function getCoachesPageData(): Promise<CoachesPageData | null> {
    try {
        return await api.getGlobal<CoachesPageData>('coaches-page', { cache: 'no-store' });
    } catch (error) {
        console.error("Failed to fetch coaches page data:", error);
        return null;
    }
}

async function getCoaches(searchParams: { [key: string]: string | string[] | undefined }): Promise<CoachProfile[]> {
    try {
        const queryString = new URLSearchParams();
        queryString.set('limit', '20');
        queryString.set('where[isActive][equals]', 'true');

        if (searchParams.search) {
            try {
                const searchRes = await fetch(
                    `${API_BASE_URL}/api/search?q=${encodeURIComponent(searchParams.search as string)}&index=coaches&limit=50`,
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
                queryString.set('where[displayName][like]', searchParams.search as string);
            }
        }

        if (searchParams.expertise) {
            queryString.set('where[expertise.area][in]', searchParams.expertise as string);
        }

        const response = await fetch(`${API_BASE_URL}/api/coach-profiles?${queryString.toString()}`, {
            next: { revalidate: 0 },
        });

        if (!response.ok) {
            console.error("Failed to fetch coaches:", response.status);
            return [];
        }

        const data: PaginatedResponse<CoachProfile> = await response.json();
        return data.docs;
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
                <div className="mt-6 flex flex-col gap-4 relative z-20">
                    {/* Social Links */}
                    <div className="flex gap-3">
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Link href={`/coaches/${coach.slug}`} className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                            View Profile
                        </Link>
                        <Button variant="default" size="sm" asChild className="h-8 text-xs font-semibold px-4 cursor-pointer">
                            <Link href={`/coaches/${coach.slug}#booking`}>
                                Book Session
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}



export default async function CoachesPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const pageData = await getCoachesPageData();
    const coaches = await getCoaches(searchParams);

    // Fallback data
    const data = pageData || {
        hero: {
            badge: 'Our Coaches',
            title: 'Book a 1:1 Coaching Session',
            description: 'Connect with industry experts for personalized guidance, technical mentorship, and career advice.',
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
                            <CoachFilters />
                        </MobileFilterDrawer>
                    </div>

                    {/* Desktop Sidebar */}
                    <SidebarFilter>
                        <CoachFilters />
                    </SidebarFilter>

                    {/* Content Grid */}
                    <div className="flex-1">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                            {coaches.length > 0 ? (
                                coaches.map((coach) => (
                                    <CoachCard key={coach.id} coach={coach} />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                                    <div className="rounded-2xl bg-muted/50 p-8">
                                        <h3 className="text-lg font-semibold">No coaches found</h3>
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
