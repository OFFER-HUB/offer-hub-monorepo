/**
 * Mock version of useProjects hook for testing without backend
 * Use this in development when the API is not available
 */

import { useState, useCallback, useEffect } from "react";
import { Project, ProjectFilters, ProjectSearchParams, PaginationInfo } from "@/types/project.types";
import { mockMarketplaceProjects, getMockProjectById, searchMockProjects } from "@/__mocks__/marketplace-projects-mock";

interface UseProjectsMockReturn {
  projects: Project[];
  currentProject: Project | null;
  pagination: PaginationInfo | null;
  loading: {
    fetching: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    searching: boolean;
  };
  error: Error | null;
  getProject: (id: string) => Promise<Project>;
  getProjects: (filters?: ProjectFilters) => Promise<Project[]>;
  searchProjects: (params: ProjectSearchParams) => Promise<Project[]>;
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
}

export function useProjectsMock(): UseProjectsMockReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState({
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
    searching: false
  });
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  // Simulate API delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getProjects = useCallback(async (filters?: ProjectFilters): Promise<Project[]> => {
    setLoading(prev => ({ ...prev, fetching: true }));
    setError(null);

    try {
      await delay(500); // Simulate network delay

      let filteredProjects = [...mockMarketplaceProjects];

      // Apply filters
      if (filters) {
        // Status filter (only show open/published)
        if (filters.status) {
          filteredProjects = filteredProjects.filter(p => 
            filters.status!.includes(p.status)
          );
        }

        // Category filter
        if (filters.category && filters.category.length > 0) {
          filteredProjects = filteredProjects.filter(p =>
            filters.category!.includes(p.category)
          );
        }

        // Budget range filter
        if (filters.budget_min !== undefined) {
          filteredProjects = filteredProjects.filter(p => p.budget >= filters.budget_min!);
        }
        if (filters.budget_max !== undefined) {
          filteredProjects = filteredProjects.filter(p => p.budget <= filters.budget_max!);
        }

        // Budget type filter
        if (filters.budget_type && filters.budget_type.length > 0) {
          filteredProjects = filteredProjects.filter(p =>
            filters.budget_type!.includes(p.budgetType)
          );
        }

        // Experience level filter
        if (filters.experience_level && filters.experience_level.length > 0) {
          filteredProjects = filteredProjects.filter(p =>
            filters.experience_level!.includes(p.experienceLevel)
          );
        }

        // Project type filter
        if (filters.project_type && filters.project_type.length > 0) {
          filteredProjects = filteredProjects.filter(p =>
            filters.project_type!.includes(p.projectType)
          );
        }

        // Search filter
        if (filters.search) {
          const searchResults = searchMockProjects(filters.search);
          filteredProjects = filteredProjects.filter(p =>
            searchResults.some(r => r.id === p.id)
          );
        }
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProjects = filteredProjects.slice(startIndex, endIndex);

      setPagination({
        page,
        limit,
        total: filteredProjects.length,
        totalPages: Math.ceil(filteredProjects.length / limit),
        hasNext: endIndex < filteredProjects.length,
        hasPrev: page > 1
      });

      setProjects(paginatedProjects);
      return paginatedProjects;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch projects');
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, fetching: false }));
    }
  }, []);

  const getProject = useCallback(async (id: string): Promise<Project> => {
    setLoading(prev => ({ ...prev, fetching: true }));
    setError(null);

    try {
      await delay(300);

      const project = getMockProjectById(id);
      if (!project) {
        throw new Error(`Project with id ${id} not found`);
      }

      setCurrentProject(project);
      return project;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch project');
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, fetching: false }));
    }
  }, []);

  const searchProjects = useCallback(async (params: ProjectSearchParams): Promise<Project[]> => {
    setLoading(prev => ({ ...prev, searching: true }));
    setError(null);

    try {
      await delay(400);

      let results: Project[] = [];
      
      if (params.query) {
        results = searchMockProjects(params.query);
      } else {
        results = mockMarketplaceProjects;
      }

      // Apply additional filters if provided
      if (params.filters) {
        // Apply same filtering logic as getProjects
        // (simplified for brevity)
      }

      setProjects(results);
      return results;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Search failed');
      setError(error);
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, searching: false }));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    getProjects({ status: ['open', 'published'], page: 1, limit: 12 });
  }, [getProjects]);

  return {
    projects,
    currentProject,
    pagination,
    loading,
    error,
    getProject,
    getProjects,
    searchProjects,
    setCurrentProject,
    clearError
  };
}
