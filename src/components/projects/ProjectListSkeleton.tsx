"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectListSkeletonProps {
  count?: number;
}

export function ProjectListSkeleton({ count = 6 }: ProjectListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="border border-gray-200 rounded-xl shadow-sm bg-white">
          <CardContent className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Title */}
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-4" />

            {/* Description */}
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-4" />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
                <Skeleton className="h-6 w-18 rounded-full" />
              </div>
            </div>

            {/* Client Info */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default ProjectListSkeleton;
