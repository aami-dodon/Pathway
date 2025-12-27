"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ArrowLeft } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

const routeTitleMap: Record<string, string> = {
    blog: "Blog",
    courses: "Courses",
    coaches: "Coaches",
    profile: "Profile",
    "my-courses": "My Courses",
    login: "Login",
    register: "Register",
    "forgot-password": "Forgot Password",
};

function formatSegment(segment: string) {
    if (routeTitleMap[segment]) return routeTitleMap[segment];
    return segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function Breadcrumbs() {
    const pathname = usePathname();
    if (pathname === "/") return null;

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        return {
            title: formatSegment(segment),
            href,
            current: index === segments.length - 1,
        };
    });

    // Mobile: Show "Back to [Parent]" or just "Back to Home" if only one segment
    const parentSegment = breadcrumbs[breadcrumbs.length - 2];
    const backHref = parentSegment ? parentSegment.href : "/";
    const backLabel = parentSegment ? parentSegment.title : "Home";

    return (
        <div className="relative z-10 w-full bg-transparent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 -mb-14">
                {/* Mobile View */}
                <div className="md:hidden">
                    <Link
                        href={backHref}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to {backLabel}
                    </Link>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">Home</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            {breadcrumbs.map((breadcrumb, index) => (
                                <React.Fragment key={breadcrumb.href}>
                                    <BreadcrumbItem>
                                        {breadcrumb.current ? (
                                            <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink asChild>
                                                <Link href={breadcrumb.href}>{breadcrumb.title}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {index < breadcrumbs.length - 1 && (
                                        <BreadcrumbSeparator />
                                    )}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>
        </div>
    );
}

