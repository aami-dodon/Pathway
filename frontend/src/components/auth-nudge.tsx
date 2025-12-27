import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthNudgeProps {
    title: string;
    description: string;
    redirectUrl?: string;
    className?: string;
}

export function AuthNudge({ title, description, redirectUrl, className = "" }: AuthNudgeProps) {
    const loginUrl = redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login";
    const registerUrl = redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register";

    return (
        <div className={`rounded-lg border border-destructive/20 bg-destructive/5 p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-3">
                        {title}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                        {description}
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button asChild size="sm" className="flex-1">
                            <Link href={loginUrl}>Log in</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="flex-1">
                            <Link href={registerUrl}>Register</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
