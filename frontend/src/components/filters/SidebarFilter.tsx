"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarFilterProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function SidebarFilter({ children, className, ...props }: SidebarFilterProps) {
    return (
        <aside
            className={cn(
                "hidden lg:block w-64 shrink-0 pr-8 border-r border-border/40",
                className
            )}
            {...props}
        >
            <div className="sticky top-24 space-y-8">
                {children}
            </div>
        </aside>
    );
}
