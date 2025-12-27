"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
        return param ? param.split(",") : [];
    }, [searchParams, filterKey]);

    const handleCheckChange = (checked: boolean, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        let newValues = [...currentValues];

        if (checked) {
            newValues.push(value);
        } else {
            newValues = newValues.filter((v) => v !== value);
        }

        if (newValues.sort().join(",") === currentValues.sort().join(",")) return;

        if (newValues.length > 0) {
            params.set(filterKey, newValues.join(","));
        } else {
            params.delete(filterKey);
        }

        // Reset page on filter change
        params.delete("page");

        router.push(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-3">
            {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                        id={`${filterKey}-${option.value}`}
                        checked={currentValues.includes(option.value)}
                        onCheckedChange={(checked) =>
                            handleCheckChange(checked as boolean, option.value)
                        }
                    />
                    <Label
                        htmlFor={`${filterKey}-${option.value}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
