import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";

function PricingCardSkeleton() {
  return (
    <div className="rounded-[2.5rem] p-10 flex flex-col space-y-5">
      <Skeleton className="w-16 h-16 rounded-2xl" />
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-3 w-24" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      <ul className="space-y-3 flex-grow">
        {[1, 2, 3, 4].map((i) => (
          <li key={i} className="flex items-start gap-2">
            <Skeleton className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" />
            <Skeleton className="h-4 w-full" />
          </li>
        ))}
      </ul>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

export default function PricingLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <TopProgressBar mode="scroll-progress" />
      <Navbar />

      <main className="flex-grow pt-28 pb-20">
        <section className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center space-y-3">
            <Skeleton className="h-8 w-28 rounded-full mb-5" />
            <Skeleton className="h-14 w-3/4 rounded-xl" />
            <Skeleton className="h-14 w-2/3 rounded-xl" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-5 w-4/6" />
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <PricingCardSkeleton key={i} />
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Skeleton className="h-4 w-80" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
