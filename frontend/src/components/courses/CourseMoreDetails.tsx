"use client";

import React, { useState } from "react";
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
    PlayCircle,
    X,
    Loader2,
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RichTextContent } from "@/components/RichTextContent";
import { Course, CoachProfile, Module, Lesson, Tag, api } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";

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

    // State for free preview modal
    const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [isVideoStarted, setIsVideoStarted] = useState(false);

    const handleFreePreviewClick = async (lesson: Lesson) => {
        setIsLoadingPreview(true);
        setIsPreviewOpen(true);
        setIsVideoStarted(false);
        try {
            const fullLesson = await api.getFreeLessonPreview(lesson.id);
            setPreviewLesson(fullLesson);
        } catch (error) {
            console.error("Failed to load preview:", error);
            setPreviewLesson(null);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setPreviewLesson(null);
        setIsVideoStarted(false);
    };

    // Helper to get embed URL for videos
    const getEmbedUrl = (url: string, autoplay: boolean = false): string => {
        if (!url) return "";
        const params = autoplay ? "?autoplay=1&mute=0" : "";
        // YouTube
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/)(?:watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})/);
        if (ytMatch) {
            return `https://www.youtube.com/embed/${ytMatch[1]}${params}`;
        }
        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:\w+\/)?|album\/(?:\d+\/)?video\/|)(\d+)(?:$|\/|\?)/);
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}${params}`;
        }
        return url;
    };

    return (
        <>
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
                                                                        className={`flex items-center justify-between rounded-lg p-3 transition-colors ${lesson.isFree
                                                                            ? "hover:bg-primary/5 cursor-pointer group"
                                                                            : "hover:bg-muted/50"
                                                                            }`}
                                                                        onClick={lesson.isFree ? () => handleFreePreviewClick(lesson) : undefined}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <LessonIcon className={`h-4 w-4 ${lesson.isFree ? "text-primary group-hover:text-primary" : "text-muted-foreground"}`} />
                                                                            <span className={`text-sm ${lesson.isFree ? "group-hover:text-primary" : ""}`}>{lesson.title}</span>
                                                                            {lesson.isFree && (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-xs bg-primary/10 border-primary/30 text-primary group-hover:bg-primary/20"
                                                                                >
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
                                                                            {lesson.isFree && (
                                                                                <PlayCircle className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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

            {/* Free Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={closePreview}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-zinc-950 border-white/10">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                                <Globe className="mr-1 h-3 w-3" />
                                Free Preview
                            </Badge>
                            {previewLesson?.title || "Loading..."}
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="max-h-[calc(90vh-100px)]">
                        <div className="p-6 pt-4">
                            {isLoadingPreview ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <span className="ml-3 text-muted-foreground">Loading lesson content...</span>
                                </div>
                            ) : previewLesson ? (
                                <div className="space-y-6">
                                    {/* Video Content */}
                                    {previewLesson.type === 'video' && (
                                        <div className="w-full bg-black aspect-video rounded-lg overflow-hidden relative">
                                            {previewLesson.videoContent?.videoUrl ? (
                                                <>
                                                    {!isVideoStarted ? (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
                                                            <button
                                                                onClick={() => setIsVideoStarted(true)}
                                                                className="group transition-all hover:scale-110"
                                                            >
                                                                <PlayCircle className="h-20 w-20 text-white/80 group-hover:text-white" strokeWidth={1} />
                                                            </button>
                                                            <p className="mt-4 text-white/70 text-sm">Click to play</p>
                                                        </div>
                                                    ) : (
                                                        <iframe
                                                            src={getEmbedUrl(previewLesson.videoContent.videoUrl, true)}
                                                            className="w-full h-full"
                                                            allowFullScreen
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        />
                                                    )}
                                                </>
                                            ) : previewLesson.videoContent?.videoFile?.url ? (
                                                <video
                                                    controls
                                                    className="w-full h-full"
                                                    src={previewLesson.videoContent.videoFile.url}
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                    <Video className="h-16 w-16 mb-2 opacity-30" />
                                                    <p>Video content unavailable</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Audio Content */}
                                    {previewLesson.type === 'audio' && (
                                        <div className="bg-muted/30 p-8 rounded-xl border border-border flex flex-col items-center">
                                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                                <Headphones className="h-10 w-10 text-primary" />
                                            </div>
                                            {previewLesson.audioContent?.audioFile?.url ? (
                                                <audio controls className="w-full max-w-md mt-4" src={previewLesson.audioContent.audioFile.url} />
                                            ) : (
                                                <p className="text-destructive mt-4">Audio file unavailable</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Text Content */}
                                    {previewLesson.type === 'text' && previewLesson.textContent && (
                                        <div className="prose prose-slate dark:prose-invert max-w-none">
                                            <RichTextContent content={previewLesson.textContent} />
                                        </div>
                                    )}

                                    {/* Interactive Content (uses textContent) */}
                                    {previewLesson.type === 'interactive' && (
                                        <div className="space-y-4">
                                            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex items-center gap-3">
                                                <MessageSquare className="h-6 w-6 text-primary" />
                                                <span className="text-sm text-primary font-medium">Interactive Lesson</span>
                                            </div>
                                            {previewLesson.textContent && (
                                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                                    <RichTextContent content={previewLesson.textContent} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Download Content (PDFs, files) */}
                                    {previewLesson.type === 'download' && (
                                        <div className="space-y-4">
                                            <div className="bg-muted/30 p-8 rounded-xl border border-border flex flex-col items-center text-center">
                                                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                                    <Download className="h-10 w-10 text-primary" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-white mb-2">Downloadable Content</h3>
                                                <p className="text-muted-foreground text-sm mb-6">
                                                    This lesson includes downloadable resources.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Assignment Content */}
                                    {previewLesson.type === 'assignment' && (
                                        <div className="space-y-4">
                                            <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20 flex items-center gap-3">
                                                <FileText className="h-6 w-6 text-amber-500" />
                                                <span className="text-sm text-amber-500 font-medium">Assignment</span>
                                            </div>
                                            {previewLesson.assignmentContent?.instructions && (
                                                <div className="prose prose-slate dark:prose-invert max-w-none">
                                                    <RichTextContent content={previewLesson.assignmentContent.instructions} />
                                                </div>
                                            )}
                                            {previewLesson.assignmentContent && (
                                                <div className="grid gap-2 text-sm text-muted-foreground mt-4">
                                                    {previewLesson.assignmentContent.dueInDays && (
                                                        <p>⏱ Due in {previewLesson.assignmentContent.dueInDays} days after starting</p>
                                                    )}
                                                    {previewLesson.assignmentContent.submissionType && (
                                                        <p>📝 Submission type: {previewLesson.assignmentContent.submissionType}</p>
                                                    )}
                                                    {previewLesson.assignmentContent.maxPoints && (
                                                        <p>🏆 Max points: {previewLesson.assignmentContent.maxPoints}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Quiz Content */}
                                    {previewLesson.type === 'quiz' && (
                                        <div className="bg-muted/30 p-8 rounded-xl border border-border flex flex-col items-center text-center">
                                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle2 className="h-10 w-10 text-primary" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-2">Quiz</h3>
                                            <p className="text-muted-foreground text-sm">
                                                This lesson contains a quiz to test your knowledge.
                                            </p>
                                        </div>
                                    )}

                                    {/* Live Session Content */}
                                    {previewLesson.type === 'live' && (
                                        <div className="space-y-4">
                                            <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 flex items-center gap-3">
                                                <Calendar className="h-6 w-6 text-red-500" />
                                                <span className="text-sm text-red-500 font-medium">Live Session</span>
                                            </div>
                                            {previewLesson.liveSession && (
                                                <div className="grid gap-2 text-sm text-muted-foreground">
                                                    {previewLesson.liveSession.scheduledAt && (
                                                        <p>📅 Scheduled: {new Date(previewLesson.liveSession.scheduledAt).toLocaleString()}</p>
                                                    )}
                                                    {previewLesson.liveSession.recordingUrl && (
                                                        <div className="mt-4">
                                                            <p className="mb-2">🎬 Recording available:</p>
                                                            <a
                                                                href={previewLesson.liveSession.recordingUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline"
                                                            >
                                                                Watch Recording →
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Resources/Downloads Section (for any lesson type with resources) */}
                                    {previewLesson.resources && previewLesson.resources.length > 0 && (
                                        <div className="mt-6 border-t border-border pt-6">
                                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                                <Download className="h-5 w-5" />
                                                Downloadable Resources
                                            </h3>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {previewLesson.resources.map((resource, idx) => (
                                                    <a
                                                        key={resource.id || idx}
                                                        href={resource.file?.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-muted/20 border border-border/60 rounded-lg hover:border-primary/50 hover:bg-muted/40 transition-colors group"
                                                    >
                                                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-sm text-white truncate">{resource.title}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{resource.description || "Download file"}</p>
                                                        </div>
                                                        <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {previewLesson.description && !['text', 'interactive'].includes(previewLesson.type) && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold text-white mb-2">About this lesson</h3>
                                            <p className="text-muted-foreground">{previewLesson.description}</p>
                                        </div>
                                    )}

                                    {/* Transcript for audio/video */}
                                    {(previewLesson.type === 'audio' || previewLesson.type === 'video') &&
                                        previewLesson.audioContent?.transcript && (
                                            <div className="mt-6 border-t border-border pt-6">
                                                <h3 className="text-lg font-semibold text-white mb-4">Transcript</h3>
                                                <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-muted-foreground">
                                                    <RichTextContent content={previewLesson.audioContent.transcript} />
                                                </div>
                                            </div>
                                        )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <X className="h-12 w-12 mb-4 opacity-50" />
                                    <p>Failed to load lesson content</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </>
    );
}
