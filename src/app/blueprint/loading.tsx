import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function SectionSkeleton() {
  return (
    <div className="rounded-[2.5rem] p-8 md:p-12 bg-bg-elevated shadow-neu-raised animate-pulse">
      {/* Section header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-bg-base shadow-neu-raised-sm" />
        <div className="h-7 w-48 rounded bg-bg-base" />
      </div>

      {/* Content blocks */}
      <div className="space-y-4">
        <div className="h-4 w-full rounded bg-bg-base" />
        <div className="h-4 w-5/6 rounded bg-bg-base" />
        <div className="h-4 w-4/6 rounded bg-bg-base" />
      </div>

      {/* Sub-cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="rounded-2xl p-6 bg-bg-base shadow-neu-raised-sm"
          >
            <div className="h-5 w-32 rounded bg-bg-elevated mb-3" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-bg-elevated" />
              <div className="h-3 w-3/4 rounded bg-bg-elevated" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlueprintLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Skeleton */}
        <div className="pt-32 pb-16 px-6 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-3 w-24 rounded mx-auto bg-bg-elevated shadow-neu-raised-sm mb-4 animate-pulse" />
            <div className="h-12 md:h-16 w-2/3 mx-auto rounded bg-bg-elevated shadow-neu-raised mb-6 animate-pulse" />
            <div className="h-5 w-5/6 md:w-2/3 mx-auto rounded bg-bg-elevated shadow-neu-raised-sm mb-2 animate-pulse" />
            <div className="h-5 w-4/6 md:w-1/2 mx-auto rounded bg-bg-elevated shadow-neu-raised-sm animate-pulse" />
          </div>
        </div>

        {/* Section Nav Skeleton */}
        <div className="px-6 md:px-8 mb-16">
          <div className="max-w-4xl mx-auto flex justify-center gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-10 w-28 rounded-full bg-bg-elevated shadow-neu-raised-sm animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-6 md:px-8 pb-24">
          <div className="max-w-5xl mx-auto space-y-12">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
