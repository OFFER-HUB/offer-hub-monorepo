import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent animate-pulse">
      <div className="h-16 w-full border-b border-[color-mix(in_srgb,var(--color-border)_20%,transparent)]" />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-10 w-96 rounded-2xl" />
          <Skeleton className="h-4 w-72 rounded-xl" />
        </div>
        <div className="flex justify-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </main>
    </div>
  );
}
