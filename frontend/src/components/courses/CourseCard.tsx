import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Users, GraduationCap, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course, CoachProfile } from "@/lib/api";

function formatDuration(duration?: { hours?: number; minutes?: number }): string {
    if (!duration) return "Self-paced";
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;
    if (hours === 0 && minutes === 0) return "Self-paced";
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} hr`;
    return `${hours}h ${minutes}m`;
}

export function CourseCard({ course }: { course: Course }) {
    const instructor = course.instructor as CoachProfile | undefined;
    const instructorName = instructor?.displayName || "Unknown Instructor";

    const difficultyColors = {
        beginner: "bg-chart-2/10 text-chart-2 border-chart-2/20",
        intermediate: "bg-chart-4/10 text-chart-4 border-chart-4/20",
        advanced: "bg-destructive/10 text-destructive border-destructive/20",
        "all-levels": "bg-primary/10 text-primary border-primary/20",
    };

    const moduleCount = Array.isArray(course.modules) ? course.modules.length : 0;

    return (
        <Link href={`/courses/${course.slug}`} className="group block">
            <Card className="h-full overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    {course.thumbnail ? (
                        <img
                            src={course.thumbnail.url}
                            alt={course.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <GraduationCap className="h-12 w-12 text-primary/30" />
                        </div>
                    )}
                    {course.enrollment?.isOpen === false && (
                        <Badge className="absolute left-3 top-3 bg-destructive hover:bg-destructive/90">
                            Enrollment Closed
                        </Badge>
                    )}
                </div>

                <CardContent className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {course.difficulty && (
                            <Badge variant="outline" className={difficultyColors[course.difficulty]}>
                                {course.difficulty === "all-levels" ? "All Levels" : course.difficulty}
                            </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDuration(course.duration)}
                        </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="line-clamp-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {course.title}
                    </h3>

                    {/* Description */}
                    {course.shortDescription && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {course.shortDescription}
                        </p>
                    )}

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {instructorName}
                        </span>
                        {moduleCount > 0 && (
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                {moduleCount} {moduleCount === 1 ? "module" : "modules"}
                            </span>
                        )}
                    </div>

                    {/* Learning Outcomes Preview */}
                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                        <div className="mt-4 space-y-1">
                            {course.learningOutcomes.slice(0, 2).map((outcome, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 text-xs text-muted-foreground"
                                >
                                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                                    <span className="line-clamp-1">{outcome.outcome}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        {course.enrollment?.isOpen !== false ? "Enroll Now" : "View Details"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </CardFooter>
            </Card>
        </Link>
    );
}
