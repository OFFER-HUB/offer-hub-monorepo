"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectFilters } from "@/components/projects/ProjectFilters";
import { ProjectSearch } from "@/components/projects/ProjectSearch";
import { ProjectGridView } from "@/components/projects/ProjectGridView";
import { ProjectErrorState } from "@/components/projects/ProjectErrorState";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectFilters as ProjectFiltersType } from "@/types/project.types";
// For testing: Use mock data. Change to useProjects for production
import { useProjectsMock as useProjects } from "@/hooks/use-projects-mock";
// import { useProjects } from "@/hooks/use-projects";

export default function ProjectsMarketplacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize filters from URL params
  const [filters, setFilters] = useState<ProjectFiltersType>(() => {
    const initialFilters: ProjectFiltersType = {
      status: ['open', 'published'], // Only show open projects
      page: 1,
      limit: 12
    };

    // Parse URL params
    const category = searchParams.getAll('category');
    const experienceLevel = searchParams.getAll('experience_level');
    const projectType = searchParams.getAll('project_type');
    const budgetType = searchParams.getAll('budget_type');
    const budgetMin = searchParams.get('budget_min');
    const budgetMax = searchParams.get('budget_max');
    const search = searchParams.get('search');
    const page = searchParams.get('page');

    if (category.length > 0) initialFilters.category = category;
    if (experienceLevel.length > 0) initialFilters.experience_level = experienceLevel as any;
    if (projectType.length > 0) initialFilters.project_type = projectType as any;
    if (budgetType.length > 0) initialFilters.budget_type = budgetType as any;
    if (budgetMin) initialFilters.budget_min = Number(budgetMin);
    if (budgetMax) initialFilters.budget_max = Number(budgetMax);
    if (search) initialFilters.search = search;
    if (page) initialFilters.page = Number(page);

    return initialFilters;
  });

  const [searchQuery, setSearchQuery] = useState(filters.search || "");

  // Use the projects hook
  const {
    projects,
    loading,
    error,
    pagination,
    getProjects,
    searchProjects,
    clearError
  } = useProjects({
    autoFetch: true,
    filters,
    pagination: { page: filters.page || 1, limit: filters.limit || 12 }
  });

  // Update URL params when filters change
  const updateUrlParams = useCallback((newFilters: ProjectFiltersType) => {
    const params = new URLSearchParams();
    
    // Add filters to URL
    if (newFilters.category?.length) {
      newFilters.category.forEach(c => params.append('category', c));
    }
    if (newFilters.experience_level?.length) {
      newFilters.experience_level.forEach(l => params.append('experience_level', l));
    }
    if (newFilters.project_type?.length) {
      newFilters.project_type.forEach(t => params.append('project_type', t));
    }
    if (newFilters.budget_type?.length) {
      newFilters.budget_type.forEach(t => params.append('budget_type', t));
    }
    if (newFilters.budget_min !== undefined) {
      params.set('budget_min', newFilters.budget_min.toString());
    }
    if (newFilters.budget_max !== undefined) {
      params.set('budget_max', newFilters.budget_max.toString());
    }
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    if (newFilters.page && newFilters.page > 1) {
      params.set('page', newFilters.page.toString());
    }

    router.push(`/projects?${params.toString()}`, { scroll: false });
  }, [router]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: ProjectFiltersType) => {
    const updatedFilters = {
      ...newFilters,
      status: ['open', 'published'], // Always filter for open projects
      page: 1 // Reset to first page when filters change
    };
    setFilters(updatedFilters);
    updateUrlParams(updatedFilters);
  }, [updateUrlParams]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    const clearedFilters: ProjectFiltersType = {
      status: ['open', 'published'],
      page: 1,
      limit: 12
    };
    setFilters(clearedFilters);
    setSearchQuery("");
    router.push('/projects');
  }, [router]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    const updatedFilters = {
      ...filters,
      search: query || undefined,
      page: 1
    };
    setFilters(updatedFilters);
    updateUrlParams(updatedFilters);

    if (query) {
      searchProjects({ query, filters: updatedFilters });
    } else {
      getProjects(updatedFilters);
    }
  }, [filters, updateUrlParams, searchProjects, getProjects]);

  // Handle pagination
  const handlePageChange = useCallback((newPage: number) => {
    const updatedFilters = {
      ...filters,
      page: newPage
    };
    setFilters(updatedFilters);
    updateUrlParams(updatedFilters);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filters, updateUrlParams]);

  // Handle retry
  const handleRetry = useCallback(() => {
    clearError();
    getProjects(filters);
  }, [clearError, getProjects, filters]);

  // Check if there are active filters
  const hasActiveFilters = 
    (filters.category && filters.category.length > 0) ||
    (filters.experience_level && filters.experience_level.length > 0) ||
    (filters.project_type && filters.project_type.length > 0) ||
    (filters.budget_type && filters.budget_type.length > 0) ||
    filters.budget_min !== undefined ||
    filters.budget_max !== undefined ||
    !!filters.search;

  // Error state
  if (error && projects.length === 0) {
    return (
      <div className="max-w-[1600px] mx-auto p-4 md:p-8">
        <ProjectErrorState error={error} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Projects
        </h1>
        <p className="text-gray-600">
          Discover exciting opportunities and find your next project.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <ProjectSearch
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          isLoading={loading.searching}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <ProjectFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Projects Grid */}
        <main className="lg:col-span-3">
          {/* Results Info */}
          {!loading.fetching && pagination && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} projects
              </p>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Projects Grid */}
          <ProjectGridView
            projects={projects}
            isLoading={loading.fetching}
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />

          {/* Pagination */}
          {!loading.fetching && pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === pagination.page;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={isActive ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {pagination.totalPages > 5 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.totalPages)}
                    >
                      {pagination.totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
