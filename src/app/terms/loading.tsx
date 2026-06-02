import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

function HeaderSkeleton() {
  return (
    <header className="text-center mb-20">
      <div className="h-3 w-24 bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></div>
      <div className="h-10 w-60 bg-[#e5e7eb] rounded mx-auto mb-6 animate-pulse"></div>
      <div className="h-4 w-full bg-[#e5e7eb] rounded mx-auto mb-8 animate-pulse"></div>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e5e7eb] text-xs font-bold text-content-secondary animate-pulse">
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
      </div>
    </header>
  );
}

function SectionSkeleton() {
  return (
    <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#e5e7eb] shadow-raised animate-pulse">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#e5e7eb] shadow-raised"></div>
        <div className="h-8 w-48 bg-gray-300 rounded"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 w-full bg-gray-300 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
        <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
        <div className="h-4 w-full bg-gray-300 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

function DisclaimerSkeleton() {
  return (
    <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#e5e7eb] shadow-raised animate-pulse">
      <div className="h-3 w-full bg-gray-300 rounded mb-4"></div>
      <div className="h-3 w-3/4 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 w-full bg-gray-300 rounded"></div>
    </div>
  );
}

export default function TermsLoading() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <HeaderSkeleton />
          <div className="space-y-12">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
            <DisclaimerSkeleton />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}