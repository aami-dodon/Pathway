import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
    badge: string;
    title: string;
    description?: string;
}

export function PageHeader({ badge, title, description }: PageHeaderProps) {
    return (
        <section className="border-b border-border/40 bg-gradient-to-b from-muted/50 to-background flex flex-col justify-center min-h-[320px] sm:min-h-[400px]">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <Badge variant="secondary" className="mb-4">
                        {badge}
                    </Badge>
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                        {title}
                    </h1>
                    {description && (
                        <p className="mt-4 text-lg text-muted-foreground line-clamp-2 sm:line-clamp-none">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
