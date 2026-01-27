"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  debounceMs?: number;
}

export function ProjectSearch({ 
  value, 
  onChange, 
  onSearch, 
  isLoading = false,
  debounceMs = 300 
}: ProjectSearchProps) {
  const [internalValue, setInternalValue] = useState(value);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
        onSearch(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [internalValue, debounceMs, onChange, onSearch, value]);

  const handleClear = useCallback(() => {
    setInternalValue("");
    onChange("");
    onSearch("");
  }, [onChange, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      
      <Input
        type="text"
        placeholder="Search projects by title or description..."
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        className="w-full pl-10 pr-20 py-3 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      />

      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isLoading && (
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
        )}
        
        {internalValue && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-500" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default ProjectSearch;
