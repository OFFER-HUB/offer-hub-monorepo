import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import LoadingBar from "@/components/ui/LoadingBar";
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

export default function PrivacyLoading() {
  return (
    <div className="min-h-screen flex flex-col">
      <LoadingBar />
      <Navbar />

      <main className="flex-grow pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-24">
        <div className="text-center mb-20 md:mb-28 space-y-4">
          <Skeleton className="h-3 w-24 mx-auto" />
          <Skeleton className="h-12 md:h-16 w-2/3 mx-auto" />
          <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
          <Skeleton className="h-5 w-4/5 max-w-xl mx-auto" />
          <Skeleton className="h-8 w-48 rounded-full mx-auto mt-4" />
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <LegalSectionSkeleton key={i} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
