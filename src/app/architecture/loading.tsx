import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ArchitectureLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <LoadingBar />
      <Navbar />

      <main className="flex-grow">
        <section className="relative pt-44 md:pt-48 pb-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
            <Skeleton className="h-[clamp(3rem,10vw,7.75rem)] w-2/3 rounded-2xl mb-6" />
            <Skeleton className="h-8 w-48 rounded-full mb-8" />
            <Skeleton className="h-16 w-3/4 rounded-xl mb-3" />
            <Skeleton className="h-16 w-2/3 rounded-xl mb-8" />
            <Skeleton className="h-5 w-2/3 mb-2" />
            <Skeleton className="h-5 w-1/2 mb-12" />
            <Skeleton className="w-full max-w-3xl rounded-[2rem] h-64" />
          </div>
        </section>

        <section className="px-6 py-24 bg-transparent">
          <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="rounded-[2.5rem] h-96" />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
