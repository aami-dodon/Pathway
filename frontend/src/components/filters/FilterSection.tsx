"use client";

import * as React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface FilterSectionProps {
    title: string;
    children: React.ReactNode;
    value?: string;
}

export function FilterSection({ title, children, value }: FilterSectionProps) {
    // Determine the value for the accordion item (defaults to title lowercased)
    const itemValue = value || title.toLowerCase().replace(/\s+/g, "-");

    return (
        <Accordion type="single" collapsible defaultValue={itemValue} className="w-full">
            <AccordionItem value={itemValue} className="border-none">
                <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
                    {title}
                </AccordionTrigger>
                <AccordionContent>
                    <div className="pt-1 pb-2">
                        {children}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
