"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
    placeholder?: string;
    className?: string;
}

export function SearchInput({ placeholder = "Search...", className }: SearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [text, setText] = React.useState(searchParams.get("search") || "");

    const debouncedUpdateUrl = useDebouncedCallback((val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val) {
            params.set("search", val);
        } else {
            params.delete("search");
        }
        params.delete("page");
        router.push(`?${params.toString()}`, { scroll: false });
    }, 500);

    // Sync state with URL changes (from other instances)
    React.useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        if (urlSearch !== text) {
            setText(urlSearch);
        }
    }, [searchParams, text]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setText(val);
        debouncedUpdateUrl(val);
    };

    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={text}
                onChange={handleChange}
                placeholder={placeholder}
                className="pl-9"
            />
        </div>
    );
}
