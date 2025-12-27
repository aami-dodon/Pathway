"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, GraduationCap, Users, Loader2, X } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchHit {
    id: string;
    title?: string;
    displayName?: string;
    slug: string;
    excerpt?: string;
    bio?: string;
    description?: string;
}

interface GroupedResults {
    posts: SearchHit[];
    courses: SearchHit[];
    coaches: SearchHit[];
    pages: SearchHit[];
}

export function GlobalSearch() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [results, setResults] = React.useState<GroupedResults>({
        posts: [],
        courses: [],
        coaches: [],
        pages: [],
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Flatten results for keyboard navigation
    const flatResults = React.useMemo(() => {
        const items: { type: "posts" | "courses" | "coaches" | "pages"; hit: SearchHit }[] = [];
        results.posts.forEach((hit) => items.push({ type: "posts", hit }));
        results.courses.forEach((hit) => items.push({ type: "courses", hit }));
        results.coaches.forEach((hit) => items.push({ type: "coaches", hit }));
        results.pages.forEach((hit) => items.push({ type: "pages", hit }));
        return items;
    }, [results]);

    // Keyboard shortcut to open search (Cmd/Ctrl + K)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen(true);
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Focus input when dialog opens
    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
        } else {
            setQuery("");
            setResults({ posts: [], courses: [], coaches: [], pages: [] });
            setSelectedIndex(0);
        }
    }, [open]);

    // Search API call
    const performSearch = React.useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults({ posts: [], courses: [], coaches: [], pages: [] });
            return;
        }

        setIsLoading(true);
        try {
            const url = new URL(`${API_BASE_URL}/api/search`);
            url.searchParams.set("q", searchQuery);
            url.searchParams.set("limit", "5");

            const response = await fetch(url.toString());
            if (response.ok) {
                const data = await response.json();
                if (data.results) {
                    setResults({
                        posts: data.results.posts || [],
                        courses: data.results.courses || [],
                        coaches: data.results.coaches || [],
                        pages: data.results.pages || [],
                    });
                }
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const debouncedSearch = useDebouncedCallback(performSearch, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setSelectedIndex(0);
        debouncedSearch(value);
    };

    const navigateToResult = (type: string, slug: string) => {
        let path = "/";
        if (type === "posts") path = `/blog/${slug}`;
        else if (type === "courses") path = `/courses/${slug}`;
        else if (type === "coaches") path = `/coaches/${slug}`;
        else if (type === "pages") path = `/${slug}`;

        setOpen(false);
        router.push(path);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter" && flatResults[selectedIndex]) {
            e.preventDefault();
            const { type, hit } = flatResults[selectedIndex];
            navigateToResult(type, hit.slug);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "posts":
                return <FileText className="h-4 w-4 text-muted-foreground" />;
            case "courses":
                return <GraduationCap className="h-4 w-4 text-muted-foreground" />;
            case "coaches":
                return <Users className="h-4 w-4 text-muted-foreground" />;
            case "pages":
                return <FileText className="h-4 w-4 text-muted-foreground" />;
            default:
                return null;
        }
    };

    const getCategoryLabel = (type: string) => {
        switch (type) {
            case "posts":
                return "Blog Posts";
            case "courses":
                return "Courses";
            case "coaches":
                return "Coaches";
            case "pages":
                return "Pages";
            default:
                return "";
        }
    };

    const hasResults = flatResults.length > 0;
    const showNoResults = query && !isLoading && !hasResults;

    // Track cumulative index for highlighting
    let cumulativeIndex = 0;

    return (
        <>
            {/* Search Trigger Button */}
            <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer"
                onClick={() => setOpen(true)}
                title="Search (⌘K)"
            >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
            </Button>

            {/* Search Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Search</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center border-b px-4 py-4">
                        <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Search posts, courses, coaches, and pages..."
                            className="flex h-10 w-full border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                        {isLoading && (
                            <Loader2 className="ml-2 h-5 w-5 animate-spin text-muted-foreground" />
                        )}
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-2 h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </DialogClose>
                    </div>

                    {/* Results */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {hasResults && (
                            <div className="p-2">
                                {(["posts", "courses", "coaches", "pages"] as const).map((type) => {
                                    const items = results[type];
                                    if (items.length === 0) return null;

                                    const startIndex = cumulativeIndex;
                                    cumulativeIndex += items.length;

                                    return (
                                        <div key={type} className="mb-4 last:mb-0">
                                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                {getCategoryLabel(type)}
                                            </div>
                                            <div className="space-y-1">
                                                {items.map((hit, i) => {
                                                    const globalIndex = startIndex + i;
                                                    const isSelected = globalIndex === selectedIndex;

                                                    return (
                                                        <button
                                                            key={hit.id}
                                                            onClick={() => navigateToResult(type, hit.slug)}
                                                            className={cn(
                                                                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                                                                isSelected
                                                                    ? "bg-accent text-accent-foreground"
                                                                    : "hover:bg-accent/50"
                                                            )}
                                                        >
                                                            {getIcon(type)}
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className="truncate text-sm font-medium">
                                                                    {hit.title || hit.displayName}
                                                                </p>
                                                                {(hit.excerpt || hit.bio || hit.description) && (
                                                                    <p className="truncate text-xs text-muted-foreground">
                                                                        {hit.excerpt || hit.bio || hit.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {showNoResults && (
                            <div className="p-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                    No results found for &quot;{query}&quot;
                                </p>
                            </div>
                        )}

                        {!query && (
                            <div className="p-8 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Start typing to search...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t px-3 py-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
                            <span>Navigate</span>
                            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
                            <span>Select</span>
                            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd>
                            <span>Close</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
