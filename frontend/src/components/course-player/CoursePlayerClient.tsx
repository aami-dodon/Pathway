"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from 'react';
import {
    CheckCircle2,
    Circle,
    PlayCircle,
    FileText,
    ChevronLeft,
    ChevronRight,
    Menu,
    Lock,
    Download,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CourseMoreDetails } from "@/components/courses/CourseMoreDetails";
import { api, Course, Module, Lesson, Tag } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { RichTextContent } from "@/components/RichTextContent";
import { Card } from "@/components/ui/card";

interface CoursePlayerProps {
    course: Course;
    enrollmentId: string;
    initialProgress: any[];
}

type CourseLesson = Lesson & { moduleId: string };

export function CoursePlayerClient({
    course,
    enrollmentId,
    initialProgress
}: CoursePlayerProps) {
    const router = useRouter();
    const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null);
    const [progressMap, setProgressMap] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isVideoStarted, setIsVideoStarted] = useState(false);

    useEffect(() => {
        setIsVideoStarted(false);
    }, [activeLesson?.id]);

    // Flatten modules/lessons for easy navigation
    const allLessons = (course.modules as Module[]).flatMap(m =>
        (m.lessons as Lesson[]).map(l => ({ ...l, moduleId: m.id }))
    ) as CourseLesson[];

    useEffect(() => {
        // Initialize progress map
        const map: Record<string, any> = {};
        initialProgress.forEach(p => {
            if (typeof p.lesson === 'string') {
                map[p.lesson] = p;
            } else if (p.lesson?.id) {
                map[p.lesson.id] = p;
            }
        });
        setProgressMap(map);

        // Set initial active lesson (first incomplete or first overall)
        const firstIncomplete = allLessons.find(l => {
            const prog = map[l.id];
            return !prog || prog.status !== 'completed';
        });

        setActiveLesson(firstIncomplete || allLessons[0]);
    }, [initialProgress]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleLessonSelect = (lesson: CourseLesson) => {
        // Optional: Check if locked
        setActiveLesson(lesson);
    };

    const handleMarkComplete = async () => {
        if (!activeLesson) return;

        setIsLoading(true);
        try {
            await api.updateProgress({
                enrollment: enrollmentId,
                lesson: activeLesson.id,
                status: 'completed',
                completedAt: new Date().toISOString()
            });

            // Update local state
            setProgressMap(prev => ({
                ...prev,
                [activeLesson.id]: {
                    enrollment: enrollmentId,
                    lesson: activeLesson.id,
                    status: 'completed'
                }
            }));

            toast.success("Lesson completed!");

            // Auto-advance
            const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
            if (currentIndex < allLessons.length - 1) {
                setActiveLesson(allLessons[currentIndex + 1]);
            } else {
                toast.success("Course Completed! Congratulations!");
            }

        } catch (error) {
            console.error("Failed to update progress", error);
            toast.error("Failed to mark lesson as complete");
        } finally {
            setIsLoading(false);
        }
    };

    const currentProgress = activeLesson ? progressMap[activeLesson.id] : null;
    const isCompleted = currentProgress?.status === 'completed';

    const SidebarContent = () => (
        <div className="h-full flex flex-col overflow-hidden rounded-lg border border-border/50 shadow-lg shadow-primary/5 bg-card">
            <div className="p-4 border-b border-border/50 bg-muted/20 shrink-0">
                <h2 className="font-semibold text-base whitespace-normal leading-snug">{course.title}</h2>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${(Object.values(progressMap).filter(p => p.status === 'completed').length / allLessons.length) * 100}%` }}
                        />
                    </div>
                    <span className="shrink-0">
                        {Math.round((Object.values(progressMap).filter(p => p.status === 'completed').length / allLessons.length) * 100)}%
                    </span>
                </div>
            </div>

            <ScrollArea className="flex-1" type="auto">
                <div className="p-0 w-full overflow-x-hidden">
                    {(course.modules as Module[]).map((module, i) => (
                        <div key={module.id} className="border-b border-border/40 last:border-0">
                            <div className="px-4 py-2 bg-muted/10 font-medium text-xs text-muted-foreground uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                                Module {i + 1}: {module.title}
                            </div>
                            <div>
                                {((module.lessons as Lesson[]) || []).map((lesson, j) => {
                                    const isSelected = activeLesson?.id === lesson.id;
                                    const isLessonCompleted = progressMap[lesson.id]?.status === 'completed';

                                    return (
                                        <button
                                            key={lesson.id}
                                            onClick={() => handleLessonSelect({ ...lesson, moduleId: module.id })}
                                            className={cn(
                                                "w-full px-4 py-3 text-sm flex items-start gap-3 transition-all text-left border-l-2",
                                                isSelected
                                                    ? "bg-primary/5 text-primary border-primary"
                                                    : "hover:bg-muted/40 text-muted-foreground hover:text-foreground border-transparent"
                                            )}
                                        >
                                            <span className="shrink-0 mt-0.5">
                                                {isLessonCompleted ? (
                                                    <CheckCircle2 className={cn("h-4 w-4", isSelected ? "text-primary" : "text-green-500")} />
                                                ) : (
                                                    <div className={cn("h-4 w-4 rounded-full border-2", isSelected ? "border-primary" : "border-muted-foreground/30")} />
                                                )}
                                            </span>

                                            <div className="flex-1 min-w-0">
                                                <span className="line-clamp-2 leading-tight font-medium mb-0.5">
                                                    {lesson.title}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                    {getLessonIcon(lesson.type) && React.createElement(getLessonIcon(lesson.type), { className: "h-3 w-3" })}
                                                    {lesson.duration ? `${lesson.duration.minutes}m` : 'View'}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );

    function getLessonIcon(type: Lesson["type"]) {
        const icons = {
            video: PlayCircle,
            text: FileText,
            audio: FileText,
            quiz: CheckCircle2,
            assignment: FileText,
        };
        // @ts-ignore
        return icons[type] || FileText;
    }


    if (!activeLesson) return <div>Loading...</div>;

    return (
        <div className="min-h-screen">
            {/* Hero Section Wrapper - mimicking Course Page Hero */}
            <section className="bg-gradient-to-b from-muted/50 to-background border-b border-border/40">
                <div className="container mx-auto px-4 py-8 lg:py-12 sm:px-6 lg:px-8">



                    {/* The Player Layout Grid */}
                    <div className="grid gap-4 lg:grid-cols-4 lg:gap-6 h-[calc(100vh-250px)] min-h-[600px]">

                        {/* Main Content Area (Left 3/4) */}
                        <div className="lg:col-span-3 flex flex-col h-full bg-background rounded-xl border border-border/50 shadow-sm overflow-hidden relative">
                            {/* Scrollable Content Container */}
                            <ScrollArea className="flex-1 relative">
                                {/* Video/Media - Full Width at Top */}
                                {activeLesson.type === 'video' && (
                                    <div className="w-full bg-black aspect-video relative shrink-0 group">
                                        {activeLesson.videoContent?.videoUrl ? (
                                            <iframe
                                                src={getEmbedUrl(activeLesson.videoContent.videoUrl, isVideoStarted)}
                                                className="w-full h-full"
                                                allowFullScreen
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        ) : activeLesson.videoContent?.videoFile?.url ? (
                                            <video
                                                controls
                                                autoPlay={isVideoStarted}
                                                className="w-full h-full"
                                                src={activeLesson.videoContent.videoFile.url}
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground/20">
                                                <PlayCircle className="h-16 w-16 mb-2 opacity-10" />
                                            </div>
                                        )}

                                        {/* Video Warning Overlay (Top Right) */}
                                        {!(activeLesson.videoContent?.videoUrl || activeLesson.videoContent?.videoFile?.url) && (
                                            <div className="absolute top-4 right-4 z-40 group/warning">
                                                <AlertTriangle className="h-5 w-5 text-white/30 hover:text-amber-500 transition-colors cursor-help" />
                                                <div className="absolute top-full right-0 mt-2 w-max max-w-[200px] p-2 bg-black/80 backdrop-blur-md text-white text-[11px] rounded-lg shadow-xl border border-white/10 opacity-0 group-hover/warning:opacity-100 transition-opacity pointer-events-none">
                                                    Video content is currently unavailable.
                                                </div>
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        {!isVideoStarted && (
                                            <div className="absolute inset-0 z-10 flex flex-col bg-black/50 backdrop-blur-[2px] p-6 md:p-10 select-none overflow-hidden">
                                                <div className="flex-1 text-left animate-in fade-in slide-in-from-left-4 duration-500">
                                                    <h2 className="text-white text-xl md:text-2xl font-bold mb-2 tracking-tight">
                                                        {activeLesson.title}
                                                    </h2>
                                                    {activeLesson.description && (
                                                        <p className="text-white/70 text-sm md:text-base max-w-xl leading-relaxed line-clamp-3 md:line-clamp-none">
                                                            {activeLesson.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <button
                                                        className="pointer-events-auto group/play transition-all hover:scale-105 active:scale-95"
                                                        onClick={() => setIsVideoStarted(true)}
                                                    >
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-0 group-hover/play:opacity-100 transition-opacity" />
                                                            <PlayCircle
                                                                className="h-12 w-12 md:h-16 md:w-16 text-white/80 transition-colors group-hover/play:text-white relative z-10"
                                                                strokeWidth={1}
                                                            />
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content Body */}
                                <div className="p-6 sm:p-8 max-w-none">
                                    {activeLesson.type !== 'video' && (
                                        <div className="flex items-center justify-between mb-6">
                                            <h1 className="text-2xl font-bold tracking-tight">{activeLesson.title}</h1>
                                        </div>
                                    )}


                                    {/* Text Content */}
                                    {activeLesson.type === 'text' && activeLesson.textContent && (
                                        <div className="prose prose-slate dark:prose-invert max-w-none">
                                            <RichTextContent content={activeLesson.textContent} />
                                        </div>
                                    )}

                                    {/* Audio Player */}
                                    {activeLesson.type === 'audio' && (
                                        <div className="bg-muted/30 p-8 rounded-xl border border-border flex flex-col items-center text-center mb-8">
                                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                                <PlayCircle className="h-10 w-10 text-primary" />
                                            </div>

                                            {activeLesson.audioContent?.audioFile?.url ? (
                                                <audio controls className="w-full max-w-md mt-4" src={activeLesson.audioContent.audioFile.url} />
                                            ) : (
                                                <p className="text-destructive mt-4">Audio file unavailable</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Transcript (for Audio/Video if available) */}
                                    {(activeLesson.type === 'audio' || activeLesson.type === 'video') && activeLesson.audioContent?.transcript && (
                                        <div className="mt-8 border-t pt-8">
                                            <h3 className="text-lg font-semibold mb-4">Transcript</h3>
                                            <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-muted-foreground">
                                                <RichTextContent content={activeLesson.audioContent.transcript} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Description (Fallback) */}
                                    {activeLesson.description && activeLesson.type !== 'text' && activeLesson.type !== 'video' && (
                                        <div className="mt-6 prose prose-slate dark:prose-invert max-w-none">
                                            <p>{activeLesson.description}</p>
                                        </div>
                                    )}

                                    {/* Resources */}
                                    {activeLesson.resources && activeLesson.resources.length > 0 && (
                                        <div className="mt-8">
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                                                <Download className="h-4 w-4" /> Resources
                                            </h3>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {activeLesson.resources.map((resource, idx) => (
                                                    <a
                                                        key={resource.id || idx}
                                                        href={resource.file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-card border border-border/60 rounded-lg hover:border-primary/50 transition-colors group"
                                                    >
                                                        <div className="h-8 w-8 bg-muted rounded flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                                            <FileText className="h-4 w-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-sm truncate">{resource.title}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{resource.description || "Download"}</p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {/* Spacer for bottom bar */}
                                    <div className="h-24"></div>
                                </div>
                            </ScrollArea>

                            {/* Floating Navigation Overlay */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-2 flex items-center gap-2 z-30 min-w-[300px] sm:min-w-[400px] justify-between">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={allLessons.indexOf(activeLesson) === 0}
                                    onClick={() => setActiveLesson(allLessons[allLessons.indexOf(activeLesson) - 1])}
                                    className="rounded-xl h-10 px-3 hover:bg-muted/50"
                                >
                                    <ChevronLeft className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Prev</span>
                                </Button>

                                <Button
                                    onClick={handleMarkComplete}
                                    size="sm"
                                    disabled={isLoading || isCompleted}
                                    variant={isCompleted ? "secondary" : "default"}
                                    className="h-10 px-6 rounded-xl font-medium"
                                >
                                    {isLoading ? "Saving..." : isCompleted ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Completed</span>
                                        </div>
                                    ) : (
                                        "Mark Complete"
                                    )}
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={allLessons.indexOf(activeLesson) === allLessons.length - 1}
                                    onClick={() => setActiveLesson(allLessons[allLessons.indexOf(activeLesson) + 1])}
                                    className="rounded-xl h-10 px-3 hover:bg-muted/50"
                                >
                                    <span className="hidden sm:inline">Next</span> <ChevronRight className="ml-1 h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Sidebar Area (Right 1/3) */}
                        <div className="hidden lg:block h-full">
                            <SidebarContent />
                        </div>

                        {/* Mobile Header (Sheet) */}
                        <div className="lg:hidden col-span-1 border border-border rounded-lg p-4 flex items-center justify-between bg-card text-card-foreground">
                            <span className="font-semibold truncate text-sm flex-1">{activeLesson.title}</span>
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Menu className="h-4 w-4 mr-2" /> Syllabus
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="p-0 w-[300px]">
                                    <div className="h-full pt-10">
                                        <SidebarContent />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>

                    </div>
                </div>
            </section>

            {/* Extended Course Content Section */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <CourseMoreDetails course={course} />
                </div>
            </section>
        </div >
    );
}

function getEmbedUrl(url: string, autoplay: boolean = false): string {
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
}
