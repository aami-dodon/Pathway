import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Post, CoachProfile } from "@/lib/api";

export function PostCard({ post }: { post: Post }) {
    const author = post.author as CoachProfile | undefined;
    const authorName = author?.displayName || "Unknown Author";
    const publishedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
        : null;

    return (
        <Link href={`/blog/${post.slug}`} className="group">
            <Card className="h-full overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-1">
                {/* Featured Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    {post.featuredImage ? (
                        <img
                            src={post.featuredImage.url}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <span className="text-4xl font-bold text-primary/20">
                                {post.title.charAt(0)}
                            </span>
                        </div>
                    )}
                    {post.accessLevel === "subscribers" && (
                        <Badge
                            variant="secondary"
                            className="absolute right-3 top-3 bg-background/80 backdrop-blur-sm"
                        >
                            Subscribers Only
                        </Badge>
                    )}
                </div>

                <CardContent className="p-6">
                    <Badge variant="outline" className="mb-3 text-xs">
                        {post.accessLevel === "public" ? "Free" : "Premium"}
                    </Badge>

                    <h3 className="line-clamp-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-primary">
                        {post.title}
                    </h3>

                    {post.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {post.excerpt}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="flex items-center justify-between px-6 pb-6 pt-0">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {authorName}
                        </span>
                        {publishedDate && (
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {publishedDate}
                            </span>
                        )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </CardFooter>
            </Card>
        </Link>
    );
}
