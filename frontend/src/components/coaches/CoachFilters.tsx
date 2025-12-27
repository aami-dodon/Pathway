"use client";

import { SearchInput } from "../filters/SearchInput";
import { FilterSection } from "../filters/FilterSection";
import { CheckboxFilter } from "../filters/CheckboxFilter";

const EXPERTISE_OPTIONS = [
    { label: "Leadership Development", value: "Leadership Development" },
    { label: "Executive Coaching", value: "Executive Coaching" },
    { label: "Team Building", value: "Team Building" },
    { label: "Strategic Planning", value: "Strategic Planning" },
    { label: "Career Transition", value: "Career Transition" },
    { label: "Tech Leadership", value: "Tech Leadership" },
    { label: "Interview Preparation", value: "Interview Preparation" },
    { label: "Mindfulness", value: "Mindfulness" },
    { label: "Stress Management", value: "Stress Management" },
    { label: "Work-Life Balance", value: "Work-Life Balance" },
    { label: "Entrepreneurship", value: "Entrepreneurship" },
    { label: "Business Strategy", value: "Business Strategy" },
    { label: "Fundraising", value: "Fundraising" },
    { label: "Public Speaking", value: "Public Speaking" },
    { label: "Communication Skills", value: "Communication Skills" },
];

export function CoachFilters() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Search
                </h3>
                <SearchInput placeholder="Search coaches..." />
            </div>

            <FilterSection title="Expertise">
                <CheckboxFilter
                    filterKey="expertise"
                    options={EXPERTISE_OPTIONS}
                />
            </FilterSection>
        </div>
    );
}
