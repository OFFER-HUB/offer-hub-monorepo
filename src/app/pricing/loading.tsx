import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function PricingCardSkeleton() {
  return (
    <div className="rounded-[2.5rem] p-8 md:p-10 bg-bg-elevated shadow-neu-raised animate-pulse">
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-bg-base shadow-neu-raised-sm mb-6" />

      {/* Name + Price */}
      <div className="h-6 w-28 rounded bg-bg-base mb-2" />
      <div className="h-10 w-36 rounded bg-bg-base mb-4" />

      {/* Description */}
      <div className="space-y-2 mb-8">
        <div className="h-4 w-full rounded bg-bg-base" />
        <div className="h-4 w-5/6 rounded bg-bg-base" />
      </div>

      {/* Features */}
      <div className="space-y-3 mb-8">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-bg-base shrink-0" />
            <div className="h-4 w-4/5 rounded bg-bg-base" />
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div className="h-12 w-full rounded-xl bg-bg-base" />
    </div>
  );
}

export default function PricingLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-grow pt-32 pb-24 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-20">
            <div className="h-3 w-20 rounded mx-auto bg-bg-elevated shadow-neu-raised-sm mb-4 animate-pulse" />
            <div className="h-12 md:h-14 w-1/2 mx-auto rounded bg-bg-elevated shadow-neu-raised mb-6 animate-pulse" />
            <div className="h-5 w-3/4 md:w-1/2 mx-auto rounded bg-bg-elevated shadow-neu-raised-sm animate-pulse" />
          </header>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PricingCardSkeleton />
            <PricingCardSkeleton />
            <PricingCardSkeleton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
