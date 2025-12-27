"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FilterOption {
    label: string;
    value: string;
    count?: number;
}

interface CheckboxFilterProps {
    filterKey: string;
    options: FilterOption[];
}

export function CheckboxFilter({ filterKey, options }: CheckboxFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current values from URL (comma separated)
    const currentValues = React.useMemo(() => {
        const param = searchParams.get(filterKey);
        if (!param) return [];
        // Return unique, non-empty values
        return Array.from(new Set(param.split(",").filter(v => v.trim() !== "")));
    }, [searchParams, filterKey]);

    // Local state for immediate UI feedback
    const [localValues, setLocalValues] = React.useState<string[]>(currentValues);

    // Sync local state when URL changes (e.g., back/forward navigation)
    // Only update if the values are actually different to prevent unnecessary re-renders
    React.useEffect(() => {
        const currentSorted = [...currentValues].sort().join(",");
        const localSorted = [...localValues].sort().join(",");
        if (currentSorted !== localSorted) {
            setLocalValues(currentValues);
        }
    }, [currentValues, localValues]);

    // Use transition to keep UI responsive while navigation happens
    const [isPending, startTransition] = React.useTransition();

    const handleCheckChange = (checked: boolean, value: string) => {
        const newValuesSet = new Set(localValues);

        if (checked) {
            newValuesSet.add(value);
        } else {
            newValuesSet.delete(value);
        }

        const newValues = Array.from(newValuesSet);
        setLocalValues(newValues);

        const params = new URLSearchParams(searchParams.toString());

        // Check if values actually changed compared to URL
        const currentSorted = [...currentValues].sort().join(",");
        const newSorted = [...newValues].sort().join(",");
        if (currentSorted === newSorted) return;

        if (newValues.length > 0) {
            params.set(filterKey, newValues.join(","));
        } else {
            params.delete(filterKey);
        }

        // Reset page on filter change
        params.delete("page");

        // Use transition for the navigation to prevent blocking the UI
        startTransition(() => {
            router.push(`?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className={cn("space-y-3", isPending && "opacity-70")}>
            {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 group">
                    <Checkbox
                        id={`${filterKey}-${option.value}`}
                        checked={localValues.includes(option.value)}
                        onCheckedChange={(checked) =>
                            handleCheckChange(checked as boolean, option.value)
                        }
                    />
                    <Label
                        htmlFor={`${filterKey}-${option.value}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer group-hover:text-primary transition-colors"
                    >
                        {option.label}
                        {option.count !== undefined && (
                            <span className="ml-2 text-xs text-muted-foreground">
                                ({option.count})
                            </span>
                        )}
                    </Label>
                </div>
            ))}
        </div>
    );
}
