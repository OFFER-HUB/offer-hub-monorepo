"use client";

import { Button } from "@/components/ui/button";
import { Briefcase, X } from "lucide-react";

interface EmptyProjectsStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyProjectsState({ hasFilters = false, onClearFilters }: EmptyProjectsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <Briefcase className="w-12 h-12 text-gray-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Projects Found
      </h3>
      
      <p className="text-gray-600 text-center max-w-md mb-6">
        {hasFilters 
          ? "No projects match your current filters. Try adjusting your criteria to see more results."
          : "There are no available projects at the moment. Check back soon for new opportunities!"
        }
      </p>

      {hasFilters && onClearFilters && (
        <Button 
          onClick={onClearFilters}
          variant="outline"
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </Button>
      )}

      {!hasFilters && (
        <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-100 max-w-md">
          <h4 className="font-semibold text-indigo-900 mb-2">Popular Categories</h4>
          <div className="flex flex-wrap gap-2">
            {["Web Development", "Design", "Writing", "Marketing"].map((category) => (
              <span 
                key={category}
                className="px-3 py-1 bg-white text-indigo-700 text-sm rounded-full border border-indigo-200"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmptyProjectsState;
