"use client";

import { Category } from "@/lib/api";
import { SearchInput } from "../filters/SearchInput";
import { FilterSection } from "../filters/FilterSection";
import { CheckboxFilter } from "../filters/CheckboxFilter";

interface CourseFiltersProps {
    categories: Category[];
}

const DIFFICULTY_OPTIONS = [
    { label: "Beginner", value: "beginner" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
    { label: "All Levels", value: "all-levels" },
];

export function CourseFilters({ categories }: CourseFiltersProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Search
                </h3>
                <SearchInput placeholder="Search courses..." showDropdown={false} />
            </div>

            <FilterSection title="Categories">
                <CheckboxFilter
                    filterKey="category"
                    options={categories.map(c => ({ label: c.name, value: String(c.id) }))}
                />
            </FilterSection>

            <FilterSection title="Difficulty">
                <CheckboxFilter
                    filterKey="difficulty"
                    options={DIFFICULTY_OPTIONS}
                />
            </FilterSection>
        </div>
    );
}
