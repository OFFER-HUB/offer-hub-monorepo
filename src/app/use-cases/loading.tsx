import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LoadingBar from "@/components/ui/LoadingBar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function UseCasesLoading() {
  return (
    <div className="bg-transparent min-h-[100dvh]">
      <LoadingBar />
      <Navbar />

      <main>
        <section className="pt-28 pb-0 bg-transparent">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap justify-center gap-3">
            {[148, 128, 132, 148, 176].map((w, i) => (
              <Skeleton key={i} className="h-10 rounded-2xl" style={{ width: w }} />
            ))}
          </div>
        </section>

        <section className="py-24 bg-transparent">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-4/5 rounded-xl" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
                <Skeleton className="h-5 w-4/6" />
                <div className="flex gap-4 pt-4">
                  <Skeleton className="h-12 w-40 rounded-xl" />
                  <Skeleton className="h-12 w-36 rounded-xl" />
                </div>
              </div>
              <Skeleton className="rounded-[2rem] h-64 w-full" />
            </div>
          </div>
        </section>

        <section className="py-24 relative bg-transparent">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center text-center p-10 rounded-[2rem] space-y-4">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
