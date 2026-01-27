"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProjectFilters as ProjectFiltersType } from "@/types/project.types";
import { X, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ProjectFiltersProps {
  filters: ProjectFiltersType;
  onFiltersChange: (filters: ProjectFiltersType) => void;
  onClearFilters: () => void;
}

// Categories from the project
const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Design",
  "Writing",
  "Marketing",
  "Data Science",
  "DevOps",
  "Blockchain",
  "AI/ML",
  "Other"
];

const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" }
];

const PROJECT_TYPES = [
  { value: "on-time", label: "One-time Project" },
  { value: "ongoing", label: "Ongoing Work" }
];

const BUDGET_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" }
];

export function ProjectFilters({ filters, onFiltersChange, onClearFilters }: ProjectFiltersProps) {
  const [budgetRange, setBudgetRange] = useState<[number, number]>([
    filters.budget_min || 0,
    filters.budget_max || 10000
  ]);

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.category || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onFiltersChange({ ...filters, category: newCategories });
  };

  const handleExperienceLevelToggle = (level: "entry" | "intermediate" | "expert") => {
    const currentLevels = filters.experience_level || [];
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level];
    
    onFiltersChange({ ...filters, experience_level: newLevels });
  };

  const handleProjectTypeToggle = (type: "on-time" | "ongoing") => {
    const currentTypes = filters.project_type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFiltersChange({ ...filters, project_type: newTypes });
  };

  const handleBudgetTypeToggle = (type: "fixed" | "hourly") => {
    const currentTypes = filters.budget_type || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFiltersChange({ ...filters, budget_type: newTypes });
  };

  const handleBudgetRangeChange = (value: number[]) => {
    setBudgetRange([value[0], value[1]]);
  };

  const handleBudgetRangeCommit = () => {
    onFiltersChange({
      ...filters,
      budget_min: budgetRange[0],
      budget_max: budgetRange[1]
    });
  };

  const hasActiveFilters = 
    (filters.category && filters.category.length > 0) ||
    (filters.experience_level && filters.experience_level.length > 0) ||
    (filters.project_type && filters.project_type.length > 0) ||
    (filters.budget_type && filters.budget_type.length > 0) ||
    filters.budget_min !== undefined ||
    filters.budget_max !== undefined;

  const FiltersContent = () => (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6">
        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}

        {/* Category Filter */}
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Category</h3>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.category?.includes(category) || false}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Budget Range Filter */}
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Budget Range</h3>
          <div className="space-y-4">
            <Slider
              value={budgetRange}
              onValueChange={handleBudgetRangeChange}
              onValueCommit={handleBudgetRangeCommit}
              min={0}
              max={10000}
              step={100}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${budgetRange[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
              <span>${budgetRange[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Budget Type Filter */}
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Budget Type</h3>
          <div className="space-y-2">
            {BUDGET_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`budget-type-${type.value}`}
                  checked={filters.budget_type?.includes(type.value as any) || false}
                  onCheckedChange={() => handleBudgetTypeToggle(type.value as any)}
                />
                <Label
                  htmlFor={`budget-type-${type.value}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Experience Level Filter */}
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Experience Level</h3>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`experience-${level.value}`}
                  checked={filters.experience_level?.includes(level.value as any) || false}
                  onCheckedChange={() => handleExperienceLevelToggle(level.value as any)}
                />
                <Label
                  htmlFor={`experience-${level.value}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Project Type Filter */}
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Project Type</h3>
          <div className="space-y-2">
            {PROJECT_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`project-type-${type.value}`}
                  checked={filters.project_type?.includes(type.value as any) || false}
                  onCheckedChange={() => handleProjectTypeToggle(type.value as any)}
                />
                <Label
                  htmlFor={`project-type-${type.value}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
          </div>
          <FiltersContent />
        </div>
      </div>

      {/* Mobile Sheet */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(filters.category?.length || 0) + 
                   (filters.experience_level?.length || 0) + 
                   (filters.project_type?.length || 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your project search
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export default ProjectFilters;
