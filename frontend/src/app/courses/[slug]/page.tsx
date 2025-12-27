import { notFound } from "next/navigation";
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

export async function generateStaticParams() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/courses?where[status][equals]=published&limit=100`,
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

function RichTextContent({ content }: { content: unknown }) {
    if (!content) return null;

    if (typeof content === "object" && content !== null && "root" in content) {
        const root = (content as { root: { children: unknown[] } }).root;
        return (
            <div className="prose prose-slate dark:prose-invert max-w-none">
                {renderLexicalNodes(root.children)}
            </div>
        );
    }

    if (typeof content === "string") {
        return <div className="prose prose-slate dark:prose-invert max-w-none">{content}</div>;
    }

    return null;
}

function renderLexicalNodes(nodes: unknown[]): React.ReactNode {
    if (!Array.isArray(nodes)) return null;

    return nodes.map((node, index) => {
        const typedNode = node as {
            type: string;
            text?: string;
            format?: number;
            children?: unknown[];
            tag?: string;
            listType?: string;
            url?: string;
        };

        switch (typedNode.type) {
            case "paragraph":
                return (
                    <p key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </p>
                );
            case "heading": {
                const tag = typedNode.tag || "h2";
                const validTags = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
                const HeadingTag = (validTags.includes(tag as typeof validTags[number]) ? tag : "h2") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
                return (
                    <HeadingTag key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </HeadingTag>
                );
            }
            case "text":
                let text: React.ReactNode = typedNode.text || "";
                const format = typedNode.format || 0;
                if (format & 1) text = <strong key={`bold-${index}`}>{text}</strong>;
                if (format & 2) text = <em key={`italic-${index}`}>{text}</em>;
                return <span key={index}>{text}</span>;
            case "list":
                const ListTag = typedNode.listType === "number" ? "ol" : "ul";
                return (
                    <ListTag key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </ListTag>
                );
            case "listitem":
                return (
                    <li key={index}>
                        {typedNode.children && renderLexicalNodes(typedNode.children)}
                    </li>
                );
            case "linebreak":
                return <br key={index} />;
            default:
                if (typedNode.children) {
                    return <span key={index}>{renderLexicalNodes(typedNode.children)}</span>;
                }
                return null;
        }
    });
}

interface LearningOutcome {
    outcome?: string;
}

function LearningOutcomesSection({ outcomes }: { outcomes: LearningOutcome[] }): React.ReactElement | null {
    if (outcomes.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    What You&apos;ll Learn
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                    {outcomes.map((outcome, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span className="text-sm">{outcome.outcome ?? ""}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default async function CoursePage({ params }: CoursePageProps) {
    const { slug } = await params;
    const course = await getCourseBySlug(slug);

    if (!course) {
        notFound();
    }

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
                    {/* Back Button */}
                    <Button variant="ghost" asChild className="mb-8 -ml-4">
                        <Link href="/courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>

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
                                    <Button
                                        className="w-full h-12 text-base shadow-lg shadow-primary/25"
                                        disabled={course.enrollment?.isOpen === false}
                                    >
                                        {course.enrollment?.isOpen === false
                                            ? "Enrollment Closed"
                                            : "Enroll Now"}
                                    </Button>

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
                    <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Learning Outcomes */}
                            <LearningOutcomesSection outcomes={learningOutcomes} />

                            {/* Course Description */}
                            {!!course.description && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                                    <RichTextContent content={course.description} />
                                </div>
                            )}

                            {/* Course Curriculum */}
                            {modules.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Course Curriculum</h2>
                                    <Accordion type="multiple" className="space-y-4">
                                        {modules
                                            .sort((a, b) => a.order - b.order)
                                            .map((module, moduleIndex) => {
                                                const lessons = (module.lessons || []) as Lesson[];
                                                const moduleDuration = lessons.reduce((acc, lesson) => {
                                                    if (lesson.duration) {
                                                        return acc + (lesson.duration.hours || 0) * 60 + (lesson.duration.minutes || 0);
                                                    }
                                                    return acc;
                                                }, 0);

                                                const moduleKey = module.id || `module-${moduleIndex}`;
                                                return (
                                                    <AccordionItem
                                                        key={moduleKey}
                                                        value={moduleKey}
                                                        className="border border-border/50 rounded-lg px-4 data-[state=open]:bg-muted/30"
                                                    >
                                                        <AccordionTrigger className="hover:no-underline py-4">
                                                            <div className="flex items-center gap-4 text-left">
                                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                                                                    {moduleIndex + 1}
                                                                </span>
                                                                <div>
                                                                    <p className="font-medium">{module.title}</p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
                                                                        {moduleDuration > 0 && ` • ${formatDuration({ hours: Math.floor(moduleDuration / 60), minutes: moduleDuration % 60 })}`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent>
                                                            <div className="space-y-2 pb-4">
                                                                {lessons
                                                                    .sort((a, b) => a.order - b.order)
                                                                    .map((lesson, lessonIndex) => {
                                                                        const LessonIcon = getLessonIcon(lesson.type);
                                                                        const lessonKey = lesson.id || `lesson-${moduleKey}-${lessonIndex}`;
                                                                        return (
                                                                            <div
                                                                                key={lessonKey}
                                                                                className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50 transition-colors"
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <LessonIcon className="h-4 w-4 text-muted-foreground" />
                                                                                    <span className="text-sm">{lesson.title}</span>
                                                                                    {lesson.isFree && (
                                                                                        <Badge variant="outline" className="text-xs">
                                                                                            <Globe className="mr-1 h-3 w-3" />
                                                                                            Free Preview
                                                                                        </Badge>
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                    {lesson.duration && (lesson.duration.hours || lesson.duration.minutes) && (
                                                                                        <span>{formatDuration(lesson.duration)}</span>
                                                                                    )}
                                                                                    {!lesson.isFree && (
                                                                                        <Lock className="h-3 w-3" />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                );
                                            })}
                                    </Accordion>
                                </div>
                            )}

                            {/* Prerequisites */}
                            {course.prerequisites && course.prerequisites.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Prerequisites</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {course.prerequisites.map((prereq, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <span className="text-muted-foreground">•</span>
                                                    {prereq.prerequisite}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Topics */}
                            {course.topics && course.topics.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Topics Covered</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {course.topics.map((topic, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {topic.topic}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Tags */}
                            {tags.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Tags</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <Badge key={tag.id} variant="outline" className="text-xs">
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Instructor Bio */}
                            {instructor && instructor.bio && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">About the Instructor</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-12 w-12">
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
                                                <p className="text-sm text-muted-foreground line-clamp-4 mt-1">
                                                    {instructor.bio}
                                                </p>
                                                <Button variant="link" asChild className="mt-2 h-auto p-0 text-primary">
                                                    <Link href={`/coaches/${instructor.slug}`}>View Profile →</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </section >
        </div >
    );
}
