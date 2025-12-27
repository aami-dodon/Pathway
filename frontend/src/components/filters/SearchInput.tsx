"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    placeholder?: string;
    className?: string;
    index?: "posts" | "courses" | "coaches";
}

interface SearchHit {
    id: string;
    title?: string;
    displayName?: string;
    slug: string;
    excerpt?: string;
    bio?: string;
    description?: string;
    thumbnailUrl?: string;
    profilePhotoUrl?: string;
}

export function SearchInput({
    placeholder = "Search...",
    className,
    index
}: SearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Initialize from URL only once
    const initialSearch = searchParams.get("search") || "";
    const [text, setText] = React.useState(initialSearch);
    const [results, setResults] = React.useState<SearchHit[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Track if the URL change came from us
    const isInternalUpdate = React.useRef(false);

    // Determine which index to search based on current page if not specified
    const getSearchIndex = React.useCallback((): string | undefined => {
        if (index) return index;
        if (pathname.startsWith("/blog")) return "posts";
        if (pathname.startsWith("/courses")) return "courses";
        if (pathname.startsWith("/coaches")) return "coaches";
        return undefined;
    }, [index, pathname]);

    // Search API call
    const performSearch = React.useCallback(async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        try {
            const searchIndex = getSearchIndex();
            const url = new URL(`${API_BASE_URL}/api/search`);
            url.searchParams.set("q", query);
            if (searchIndex) {
                url.searchParams.set("index", searchIndex);
            }
            url.searchParams.set("limit", "5");

            const response = await fetch(url.toString());
            if (response.ok) {
                const data = await response.json();
                // Handle both single index and multi-index results
                if (data.hits) {
                    setResults(data.hits);
                } else if (data.results) {
                    // Flatten multi-index results
                    const allHits: SearchHit[] = [];
                    Object.values(data.results).forEach((hits: any) => {
                        allHits.push(...hits);
                    });
                    setResults(allHits.slice(0, 5));
                }
                setIsOpen(true);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [getSearchIndex]);

    const debouncedSearch = useDebouncedCallback(performSearch, 300);

    // Update URL with debounce
    const updateUrl = React.useCallback((val: string) => {
        isInternalUpdate.current = true;
        const params = new URLSearchParams(searchParams.toString());
        if (val) {
            params.set("search", val);
        } else {
            params.delete("search");
        }
        params.delete("page");
        router.push(`?${params.toString()}`, { scroll: false });
    }, [router, searchParams]);

    const debouncedUpdateUrl = useDebouncedCallback(updateUrl, 500);

    // Sync state with URL changes (for back/forward navigation)
    React.useEffect(() => {
        const urlSearch = searchParams.get("search") || "";

        // Only sync if this is an external navigation (back/forward)
        if (!isInternalUpdate.current && urlSearch !== text) {
            setText(urlSearch);
            if (urlSearch) {
                performSearch(urlSearch);
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }

        // Reset internal update flag
        isInternalUpdate.current = false;
    }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setText(val);
        debouncedSearch(val);
        debouncedUpdateUrl(val);
    };

    const handleClear = () => {
        setText("");
        setResults([]);
        setIsOpen(false);
        isInternalUpdate.current = true;
        const params = new URLSearchParams(searchParams.toString());
        params.delete("search");
        params.delete("page");
        router.push(`?${params.toString()}`, { scroll: false });
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const getResultLink = (hit: SearchHit): string => {
        const searchIndex = getSearchIndex();
        if (searchIndex === "posts" || hit.title) {
            return `/blog/${hit.slug}`;
        } else if (searchIndex === "courses") {
            return `/courses/${hit.slug}`;
        } else if (searchIndex === "coaches" || hit.displayName) {
            return `/coaches/${hit.slug}`;
        }
        return "#";
    };

    const getResultTitle = (hit: SearchHit): string => {
        return hit.title || hit.displayName || "Untitled";
    };

    const getResultDescription = (hit: SearchHit): string => {
        return hit.excerpt || hit.bio || hit.description || "";
    };

    return (
        <div ref={wrapperRef} className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                ref={inputRef}
                value={text}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="pl-9 pr-9"
                onFocus={() => text && results.length > 0 && setIsOpen(true)}
            />
            {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
            {!isLoading && text && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            {/* Search Results Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                    <ul className="py-2">
                        {results.map((hit) => (
                            <li key={hit.id}>
                                <Link
                                    href={getResultLink(hit)}
                                    className="block px-4 py-3 hover:bg-accent transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <p className="font-medium text-sm truncate">
                                        {getResultTitle(hit)}
                                    </p>
                                    {getResultDescription(hit) && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                            {getResultDescription(hit)}
                                        </p>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-border px-4 py-2">
                        <p className="text-xs text-muted-foreground">
                            Press Enter to see all results
                        </p>
                    </div>
                </div>
            )}

            {/* No Results Message */}
            {isOpen && text && results.length === 0 && !isLoading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 p-4">
                    <p className="text-sm text-muted-foreground text-center">
                        No results found for &quot;{text}&quot;
                    </p>
                </div>
            )}
        </div>
    );
}
