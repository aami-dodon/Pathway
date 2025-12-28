import React from "react";
import Link from "next/link";
import {
    CheckCircle2,
    Video,
    FileText,
    Headphones,
    MessageSquare,
    Calendar,
    Download,
    Globe,
    Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/RichTextContent";
import { Course, CoachProfile, Module, Lesson, Tag } from "@/lib/api";

interface CourseMoreDetailsProps {
    course: Course;
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

export function CourseMoreDetails({ course }: CourseMoreDetailsProps) {
    const instructor = course.instructor as CoachProfile | undefined;
    const modules = (course.modules || []) as Module[];
    const tags = (course.tags || []) as Tag[];
    const learningOutcomes = (course.learningOutcomes || []) as { outcome?: string }[];

    return (
        <div className="grid gap-12 lg:grid-cols-4 lg:gap-16">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
                {/* Learning Outcomes */}
                {learningOutcomes.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                                What You&apos;ll Learn
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {learningOutcomes.map((outcome, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                                        <span className="text-sm">{outcome.outcome ?? ""}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

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
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
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
                                                        .sort((a, b) => (a.order || 0) - (b.order || 0))
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
                {instructor && (instructor.bio || instructor.displayName) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">About the Instructor</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-3">
                                <Avatar className="h-12 w-12 shrink-0">
                                    {instructor.profilePhoto && (
                                        <AvatarImage
                                            src={instructor.profilePhoto.url}
                                            alt={instructor.displayName}
                                        />
                                    )}
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                        {instructor.displayName
                                            ? instructor.displayName
                                                .split(" ")
                                                .map((n) => n.charAt(0))
                                                .join("")
                                                .slice(0, 2)
                                            : "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{instructor.displayName}</p>
                                    {instructor.bio && (
                                        <p className="text-sm text-muted-foreground line-clamp-4 mt-1">
                                            {instructor.bio}
                                        </p>
                                    )}
                                    <Button variant="link" size="sm" asChild className="mt-2 h-auto p-0">
                                        <Link href={`/coaches/${instructor.slug}`}>View Profile →</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
