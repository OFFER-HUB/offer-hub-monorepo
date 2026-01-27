"use client";

import { Project } from "@/types/project.types";
import { ProjectMarketplaceCard } from "./ProjectMarketplaceCard";
import { ProjectListSkeleton } from "./ProjectListSkeleton";
import { EmptyProjectsState } from "./EmptyProjectsState";

interface ProjectGridViewProps {
  projects: Project[];
  isLoading?: boolean;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function ProjectGridView({ 
  projects, 
  isLoading = false,
  hasFilters = false,
  onClearFilters
}: ProjectGridViewProps) {
  // Loading state
  if (isLoading) {
    return <ProjectListSkeleton count={6} />;
  }

  // Empty state
  if (projects.length === 0) {
    return (
      <EmptyProjectsState 
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  // Projects grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {projects.map((project) => (
        <ProjectMarketplaceCard key={project.id} project={project} />
      ))}
    </div>
  );
}

export default ProjectGridView;
