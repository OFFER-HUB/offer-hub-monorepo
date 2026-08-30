import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { Skeleton } from "@/components/ui/Skeleton";

export default function CommunityLoading() {
  return (
    <div className="w-full max-w-full overflow-x-hidden min-w-0">
      <LoadingBar />
      <Navbar />

      <main className="pt-16 w-full max-w-full overflow-x-hidden min-w-0">
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="rounded-3xl p-8 md:p-10 lg:col-span-7 space-y-4">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <div className="grid grid-cols-1 gap-4 lg:col-span-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl p-6 space-y-3">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <Skeleton className="h-3 w-24 mx-auto" />
              <Skeleton className="h-10 w-full max-w-xs mx-auto" />
              <Skeleton className="h-4 w-full max-w-sm mx-auto" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl p-6 space-y-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16 space-y-4">
              <Skeleton className="h-3 w-32 mx-auto" />
              <Skeleton className="h-10 w-full max-w-xs mx-auto" />
              <Skeleton className="h-4 w-full max-w-sm mx-auto" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="w-5 h-5 mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
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
