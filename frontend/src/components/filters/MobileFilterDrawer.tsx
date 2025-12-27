"use client";

import * as React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileFilterDrawerProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export function MobileFilterDrawer({
    children,
    title = "Filters",
    description = "Narrow down your search results"
}: MobileFilterDrawerProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                        {description}
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-8rem)] pr-4 mt-6">
                    {children}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
