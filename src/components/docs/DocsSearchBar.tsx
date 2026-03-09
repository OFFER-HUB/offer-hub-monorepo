"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, FileText, ChevronRight, X } from "lucide-react";
import Fuse, { type FuseResult, type FuseResultMatch } from "fuse.js";
import { useRouter } from "next/navigation";
import docsIndex from "@/data/docs-index.json";
import { Input } from "@/components/ui/Input";

interface SearchResult {
    id: string;
    title: string;
    section: string;
    content: string;
    link: string;
}

export default function DocsSearchBar() {
    const [query, setQuery] = useState("");
    const [debounceQuery, setDebounceQuery] = useState("");
    const [results, setResults] = useState<FuseResult<SearchResult>[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fuse = useMemo(() => new Fuse(docsIndex as SearchResult[], {
        keys: ["title", "section", "content"],
        threshold: 0.3,
        includeMatches: true,
        minMatchCharLength: 2,
    }), []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (debounceQuery.length > 1) {
            const searchResults = fuse.search(debounceQuery);
            setResults(searchResults.slice(0, 8));
            setIsOpen(true);
            setActiveIndex(-1);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [debounceQuery, fuse]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Enter") {
            if (activeIndex >= 0) {
                router.push(results[activeIndex].item.link);
                setIsOpen(false);
                setQuery("");
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    const highlightMatch = (text: string, matches: readonly FuseResultMatch[] | undefined, key: string) => {
        if (!matches) return text;
        const match = matches.find((m: FuseResultMatch) => m.key === key);
        if (!match) return text;

        const indices = match.indices;
        let lastIndex = 0;
        const parts: React.ReactNode[] = [];

        indices.forEach(([start, end]: [number, number], idx: number) => {
            parts.push(text.slice(lastIndex, start));
            parts.push(
                <span key={idx} className="bg-theme-primary/15 text-theme-primary rounded px-0.5">
                    {text.slice(start, end + 1)}
                </span>
            );
            lastIndex = end + 1;
        });
        parts.push(text.slice(lastIndex));

        return parts;
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
            <div className="relative w-full">
                <Input
                    type="text"
                    placeholder="Ask or search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    icon={<Search size={20} />}
                    iconPosition="left"
                    className="!bg-bg-sunken !shadow-neu-sunken-subtle !text-content-primary !placeholder:text-content-secondary focus:!ring-theme-primary"
                    rightElement={
                        query ? (
                            <button
                                onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
                                className="text-content-secondary hover:text-content-primary transition-colors flex items-center justify-center h-full px-2"
                            >
                                <X size={18} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1.5 pr-2 pointer-events-none text-content-secondary">
                                <kbd className="flex items-center justify-center min-w-[24px] h-[24px] text-[11px] font-sans font-medium rounded-md shadow-neu-raised-sm bg-bg-base text-content-primary">
                                    ⌘
                                </kbd>
                                <kbd className="flex items-center justify-center min-w-[24px] h-[24px] text-[11px] font-sans font-medium rounded-md shadow-neu-raised-sm bg-bg-base text-content-primary">
                                    K
                                </kbd>
                            </div>
                        )
                    }
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-3 w-full rounded-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200 bg-bg-elevated/95 border border-theme-border/40 shadow-neu-raised backdrop-blur-xl">
                    <div className="max-h-[450px] overflow-y-auto">
                        {results.map((result, idx) => (
                            <div
                                key={result.item.id}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => {
                                    router.push(result.item.link);
                                    setIsOpen(false);
                                    setQuery("");
                                }}
                                className="p-4 flex items-start gap-4 cursor-pointer transition-colors"
                                style={{
                                    backgroundColor: activeIndex === idx ? "rgba(20, 154, 155, 0.08)" : "transparent",
                                }}
                            >
                                <div className={`mt-1 p-2 rounded-lg ${activeIndex === idx ? "bg-theme-primary/10 shadow-neu-sunken-subtle" : "bg-bg-base shadow-neu-raised-sm"}`}>
                                    <FileText size={18} className={activeIndex === idx ? "text-theme-primary" : "text-content-secondary"} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-sm font-semibold ${activeIndex === idx ? "text-theme-primary" : "text-content-primary"}`}>
                                            {highlightMatch(result.item.title, result.matches, "title")}
                                        </span>
                                        <ChevronRight size={14} className="text-content-secondary/40" />
                                        <span className="text-sm font-medium text-content-secondary">
                                            {highlightMatch(result.item.section, result.matches, "section")}
                                        </span>
                                    </div>
                                    <p className="text-sm text-content-secondary line-clamp-2 leading-relaxed">
                                        {highlightMatch(result.item.content, result.matches, "content")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 flex justify-between items-center text-[10px] font-bold tracking-wider uppercase bg-bg-sunken/60 text-content-secondary border-t border-theme-border/40">
                        <span>{results.length} results found</span>
                        <div className="flex gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded bg-bg-base border border-theme-border/40 text-content-primary">↑↓</kbd> Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded bg-bg-base border border-theme-border/40 text-content-primary">↵</kbd> Select
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {isOpen && query.length > 1 && results.length === 0 && (
                <div className="absolute top-full mt-3 w-full rounded-2xl p-8 text-center z-[100] animate-in fade-in slide-in-from-top-2 bg-bg-elevated/95 border border-theme-border/40 shadow-neu-raised backdrop-blur-xl">
                    <p className="text-content-secondary">No results found for &quot;<span className="font-semibold text-content-primary">{query}</span>&quot;</p>
                    <p className="text-sm mt-1 text-content-secondary/80">Try a different search term</p>
                </div>
            )}
        </div>
    );
}
