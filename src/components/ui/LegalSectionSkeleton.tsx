import { Skeleton } from "@/components/ui/Skeleton";

/**
 * A pair of placeholder "legal document" sections — two legal loading pages
 * (`terms` and `privacy`) used to inline this exact block. Lifted into a shared
 * primitive so the placeholder markup lives in one place.
 */
export function LegalSectionSkeleton() {
  return (
    <div className="p-8 md:p-12 rounded-[2.5rem] space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
