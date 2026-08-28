import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TopProgressBar } from "@/components/ui/TopProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ChangelogLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <TopProgressBar mode="scroll-progress" />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-16 space-y-4">
            <Skeleton className="h-3 w-24 mx-auto" />
            <Skeleton className="h-12 md:h-14 w-2/3 mx-auto" />
            <Skeleton className="h-5 w-1/2 mx-auto" />
          </header>

          <div className="space-y-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-[2.5rem] p-8 space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
