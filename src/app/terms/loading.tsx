import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";

function LegalSectionSkeleton() {
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

export default function TermsLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      <TopProgressBar mode="scroll-progress" />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-20 space-y-4">
            <Skeleton className="h-3 w-24 mx-auto" />
            <Skeleton className="h-12 w-2/3 mx-auto" />
            <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
            <Skeleton className="h-8 w-48 rounded-full mx-auto mt-4" />
          </header>

          <div className="space-y-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <LegalSectionSkeleton key={i} />
            ))}

            <div className="p-8 md:p-10 rounded-[2.5rem] space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
