import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

function HeroRepoStatsSkeleton() {
  return (
    <section id="hero-repo-stats" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="rounded-3xl bg-[#e5e7eb] p-8 shadow-raised md:p-10 lg:col-span-7 animate-pulse">
            <div className="mb-4 h-3 w-32 bg-gray-300 rounded"></div>
            <div className="h-12 w-3/4 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:col-span-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-[#e5e7eb] p-6 shadow-raised animate-pulse"
              >
                <div className="h-3 w-16 bg-gray-300 rounded mb-3"></div>
                <div className="h-8 w-20 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContributorsSkeleton() {
  return (
    <section id="contributors" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-3 w-24 bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-10 w-64 bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 w-96 bg-[#e5e7eb] rounded mx-auto animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#e5e7eb] p-6 shadow-raised animate-pulse"
            >
              <div className="w-12 h-12 rounded-full bg-gray-300"></div>
              <div className="mt-4 h-5 w-32 bg-gray-300 rounded"></div>
              <div className="mt-2 h-3 w-24 bg-gray-300 rounded"></div>
              <div className="mt-4 h-4 w-20 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RecentPRsSkeleton() {
  return (
    <section id="recent-prs" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-3 w-32 bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-10 w-80 bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 w-96 bg-[#e5e7eb] rounded mx-auto animate-pulse"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-2xl bg-[#e5e7eb] p-6 shadow-raised sm:flex-row sm:items-center sm:justify-between animate-pulse"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className="w-5 h-5 bg-gray-300 rounded mt-1"></div>
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpenIssuesSkeleton() {
  return (
    <section id="open-issues" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-3 w-24 bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-10 w-96 bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 w-80 bg-[#e5e7eb] rounded mx-auto animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl bg-[#e5e7eb] p-6 shadow-raised animate-pulse"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="h-5 w-3/4 bg-gray-300 rounded"></div>
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="h-3 w-20 bg-gray-300 rounded"></div>
                <div className="h-3 w-16 bg-gray-300 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CommunityLoading() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <HeroRepoStatsSkeleton />
        <ContributorsSkeleton />
        <RecentPRsSkeleton />
        <OpenIssuesSkeleton />
      </main>
      <Footer />
    </>
  );
}
