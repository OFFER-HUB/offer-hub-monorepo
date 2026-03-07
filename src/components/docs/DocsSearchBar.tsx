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
                <span key={idx} className="bg-[rgba(20,154,155,0.15)] text-[#149A9B] rounded px-0.5">
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
                    rightElement={
                        query ? (
                            <button
                                onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
                                className="text-[#6D758F] hover:text-[#19213D] transition-colors flex items-center justify-center h-full px-2"
                            >
                                <X size={18} />
                            </button>
                        ) : (
                            <div className="flex items-center gap-1.5 pr-2 pointer-events-none text-[#6D758F]">
                                <kbd className="flex items-center justify-center min-w-[24px] h-[24px] text-[11px] font-sans font-medium rounded-md shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] bg-[#F1F3F7]">
                                    ⌘
                                </kbd>
                                <kbd className="flex items-center justify-center min-w-[24px] h-[24px] text-[11px] font-sans font-medium rounded-md shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] bg-[#F1F3F7]">
                                    K
                                </kbd>
                            </div>
                        )
                    }
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-3 w-full rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200" style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(12px)" }}>
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
                                    color: activeIndex === idx ? "#149A9B" : "#6D758F"
                                }}
                            >
                                <div className="mt-1 p-2 rounded-lg" style={{ background: activeIndex === idx ? "rgba(20, 154, 155, 0.12)" : "rgba(241, 243, 247, 0.8)" }}>
                                    <FileText size={18} style={{ color: activeIndex === idx ? "#149A9B" : "#9CA3AF" }} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {highlightMatch(result.item.title, result.matches, "title")}
                                        </span>
                                        <ChevronRight size={14} className="text-gray-300" />
                                        <span className="text-sm font-medium text-gray-500">
                                            {highlightMatch(result.item.section, result.matches, "section")}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                        {highlightMatch(result.item.content, result.matches, "content")}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 flex justify-between items-center text-[10px] font-bold tracking-wider uppercase" style={{ background: "rgba(241, 243, 247, 0.6)", color: "#9CA3AF", borderTop: "1px solid rgba(209, 213, 219, 0.3)" }}>
                        <span>{results.length} results found</span>
                        <div className="flex gap-3">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded" style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(209, 213, 219, 0.3)" }}>↑↓</kbd> Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded" style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(209, 213, 219, 0.3)" }}>↵</kbd> Select
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {isOpen && query.length > 1 && results.length === 0 && (
                <div className="absolute top-full mt-3 w-full rounded-2xl p-8 text-center z-50 animate-in fade-in slide-in-from-top-2" style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(12px)" }}>
                    <p style={{ color: "#6D758F" }}>No results found for &quot;<span className="font-semibold">{query}</span>&quot;</p>
                    <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>Try a different search term</p>
                </div>
            )}
        </div>
    );
}
