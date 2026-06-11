import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function HeroSkeleton() {
  return (
    <section className="relative pt-44 md:pt-48 pb-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
        <div className="h-[clamp(3rem,10vw,7.75rem)] w-2/3 rounded-2xl bg-[#e5e7eb] dark:bg-[#1e2a4a] animate-pulse mb-6" />
        <div className="h-8 w-48 rounded-full bg-[#e5e7eb] dark:bg-[#1e2a4a] animate-pulse mb-8" />
        <div className="h-16 w-3/4 rounded-xl bg-[#e5e7eb] dark:bg-[#1e2a4a] animate-pulse mb-3" />
        <div className="h-16 w-2/3 rounded-xl bg-[#e5e7eb] dark:bg-[#1e2a4a] animate-pulse mb-8" />
        <div className="h-5 w-2/3 bg-[#e5e7eb] dark:bg-[#1e2a4a] rounded animate-pulse mb-2" />
        <div className="h-5 w-1/2 bg-[#e5e7eb] dark:bg-[#1e2a4a] rounded animate-pulse mb-12" />
        <div className="w-full max-w-3xl rounded-[2rem] bg-[#e5e7eb] dark:bg-[#1e2a4a] animate-pulse h-48" />
      </div>
    </section>
  );
}

function NavSkeleton() {
  return (
    <div className="sticky top-[80px] z-40 py-6 pointer-events-none">
      <div className="max-w-3xl mx-auto px-6 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1.5 p-2 rounded-2xl bg-[#e5e7eb] dark:bg-[#1e2a4a] animate-pulse">
          {["Overview", "System", "Payment Flow", "Integrations", "Roadmap"].map((label) => (
            <div key={label} className="h-10 w-24 sm:w-28 rounded-xl bg-[#d1d5db] dark:bg-[#3d3d5c]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <section className="px-6 py-24 bg-transparent">
      <div className="mx-auto max-w-7xl">
        <div
          className={`rounded-[2.5rem] bg-[#e5e7eb] dark:bg-[#1e2a4a] animate-pulse p-10 ${tall ? "h-[600px]" : "h-96"}`}
        />
      </div>
    </section>
  );
}

export default function ArchitectureLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-grow">
        <HeroSkeleton />
        <NavSkeleton />
        <SectionSkeleton tall />
        <SectionSkeleton tall />
        <SectionSkeleton />
        <SectionSkeleton />
      </main>
      <Footer />
    </div>
  );
}
