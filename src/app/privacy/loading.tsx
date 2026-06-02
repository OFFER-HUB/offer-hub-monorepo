import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

function HeaderSkeleton() {
  return (
    <div className="text-center mb-20">
      <div className="h-3 w-24 bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></div>
      <div className="h-10 w-60 bg-[#e5e7eb] rounded mx-auto mb-6 animate-pulse"></div>
      <div className="h-4 w-full bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></div>
      <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e5e7eb] text-xs font-bold text-content-secondary animate-pulse">
        <div className="h-3 w-16 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
}

function FeatureSkeleton() {
  return (
    <div className="p-10 rounded-[2.5rem] bg-[#e5e7eb] shadow-raised flex flex-col gap-6 animate-pulse">
      <div className="w-14 h-14 rounded-2xl shadow-raised flex items-center justify-center shrink-0 bg-[#e5e7eb]"></div>
      <div>
        <h3 className="h-6 w-24 bg-gray-300 rounded mb-4"></h3>
        <p className="h-3 w-full bg-gray-300 rounded"></p>
      </div>
    </div>
  );
}

function ProcessorSkeleton() {
  return (
    <div className="p-8 rounded-[2rem] bg-[#e5e7eb] shadow-raised flex flex-col gap-4 border animate-pulse">
      <div className="flex items-center justify-between">
        <h3 className="h-5 w-20 bg-gray-300 rounded"></h3>
        <a className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1">
          <div className="h-3 w-16 bg-gray-300 rounded"></div>
        </a>
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-content-secondary block mb-1"></span>
          <p className="h-3 w-full bg-gray-300 rounded"></p>
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-content-secondary block mb-1"></span>
          <p className="h-3 w-full bg-gray-300 rounded"></p>
        </div>
      </div>
    </div>
  );
}

function ContactCardSkeleton() {
  return (
    <div className="p-8 sm:p-12 md:p-14 rounded-[3rem] shadow-raised flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-14 mt-16 bg-[#e5e7eb]">
      <div className="flex flex-col gap-6 md:max-w-md">
        <div className="w-14 h-14 rounded-2xl shadow-raised flex items-center justify-center shrink-0 bg-[#e5e7eb]"></div>
        <div>
          <h2 className="h-8 w-32 bg-gray-300 rounded mb-4 animate-pulse"></h2>
          <p className="h-3 w-full bg-gray-300 rounded animate-pulse"></p>
        </div>
      </div>
      <div className="flex flex-col gap-5 w-full md:w-auto md:shrink-0 md:min-w-[280px]">
        <a className="flex flex-col gap-1 rounded-2xl px-6 py-5 transition-all duration-300 shadow-raised bg-[#e5e7eb] hover:shadow-raised group">
          <span className="text-[10px] font-black uppercase tracking-widest text-content-secondary"></span>
          <span className="text-base font-bold text-theme-primary group-hover:text-content-primary transition-colors"></span>
        </a>
        <a className="flex flex-col gap-1 rounded-2xl px-6 py-5 transition-all duration-300 shadow-raised bg-[#e5e7eb] hover:shadow-raised group">
          <span className="text-[10px] font-black uppercase tracking-widest text-content-secondary"></span>
          <span className="text-base font-bold text-theme-primary group-hover:text-content-primary transition-colors"></span>
        </a>
        <div className="rounded-2xl px-6 py-5 shadow-raised bg-[#e5e7eb]">
          <p className="text-xs leading-relaxed font-medium text-content-secondary">
            Offer Hub Inc.
            <br />
            123 Market Street, Suite 400
            <br />
            San Francisco, CA 94105, USA
          </p>
        </div>
      </div>
    </div>
  );
}

function DataRightsSkeleton() {
  return (
    <div className="mt-16">
      <div className="text-center mb-10">
        <div className="h-3 w-16 bg-[#e5e7eb] rounded mx-auto mb-3 animate-pulse"></div>
        <h2 className="h-8 w-32 bg-[#e5e7eb] rounded mx-auto mb-4 animate-pulse"></h2>
        <p className="h-3 w-full bg-gray-300 rounded mx-auto max-w-xl animate-pulse"></p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#e5e7eb] shadow-raised flex flex-col gap-6 animate-pulse">
          <div className="w-14 h-14 rounded-2xl shadow-raised flex items-center justify-center shrink-0 bg-[#e5e7eb]"></div>
          <div>
            <h3 className="h-5 w-24 bg-gray-300 rounded mb-2"></h3>
            <p className="h-3 w-full bg-gray-300 rounded"></p>
          </div>
          <div className="h-10 w-full bg-gray-300 rounded"></div>
          <div className="h-10 w-full bg-gray-300 rounded"></div>
        </div>
        <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#e5e7eb] shadow-raised flex flex-col gap-6 animate-pulse">
          <div className="w-14 h-14 rounded-2xl shadow-raised flex items-center justify-center shrink-0 bg-[#e5e7eb]"></div>
          <div>
            <h3 className="h-5 w-24 bg-gray-300 rounded mb-2"></h3>
            <p className="h-3 w-full bg-gray-300 rounded"></p>
          </div>
          <div className="h-10 w-full bg-gray-300 rounded"></div>
          <div className="h-10 w-full bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyLoading() {
  return (
    <>
      <Navbar />
      <main className="flex-grow pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-8 md:px-12 lg:px-24">
        <HeaderSkeleton />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-5">
          <FeatureSkeleton />
          <FeatureSkeleton />
          <FeatureSkeleton />
        </div>

        <div className="mt-24 mb-24">
          <div className="flex flex-col gap-6 mb-12">
            <h2 className="h-6 w-40 bg-gray-300 rounded mb-4 animate-pulse"></h2>
            <p className="h-3 w-full bg-gray-300 rounded animate-pulse"></p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProcessorSkeleton />
            <ProcessorSkeleton />
            <ProcessorSkeleton />
            <ProcessorSkeleton />
            <ProcessorSkeleton />
          </div>
        </div>

        <ContactCardSkeleton />

        <DataRightsSkeleton />
      </main>
      <Footer />
    </>
  );
}