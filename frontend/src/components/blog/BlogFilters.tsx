"use client";

import { Category, Tag } from "@/lib/api";
import { SearchInput } from "../filters/SearchInput";
import { FilterSection } from "../filters/FilterSection";
import { CheckboxFilter } from "../filters/CheckboxFilter";

interface BlogFiltersProps {
    categories: Category[];
    tags: Tag[];
}

export function BlogFilters({ categories, tags }: BlogFiltersProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Search
                </h3>
                <SearchInput placeholder="Search articles..." />
            </div>

            <FilterSection title="Categories">
                <CheckboxFilter
                    filterKey="category"
                    options={categories.map(c => ({ label: c.name, value: String(c.id) }))}
                />
            </FilterSection>

            <FilterSection title="Tags">
                <CheckboxFilter
                    filterKey="tags"
                    options={tags.map(t => ({ label: t.name, value: String(t.id) }))}
                />
            </FilterSection>
        </div>
    );
}
