import { cn } from "@/lib/cn";

const steps = [
  {
    number: "01",
    title: "Connect your marketplace",
    description:
      "Install the SDK or hit the REST API. Point it at your Stellar account and configure your supported assets in minutes.",
  },
  {
    number: "02",
    title: "Configure escrow rules",
    description:
      "Define release conditions — time-based, milestone-based, or dispute-driven. OFFER HUB enforces them automatically on-chain.",
  },
  {
    number: "03",
    title: "Funds flow automatically",
    description:
      "Buyers lock funds in non-custodial escrow. On fulfillment, Stellar settles directly to your merchants in seconds.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-bg-base transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16 animate-fadeInUp">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] mb-4 text-theme-primary">
            How it works
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-content-primary">
            Up and running in three steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-[120px] left-1/4 right-1/4 h-px bg-theme-border opacity-20" />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className={cn(
                "group flex flex-col items-center text-center gap-8 p-10 rounded-3xl",
                "bg-bg-elevated shadow-neu-raised",
                "transition-[box-shadow,transform] duration-500 cubic-bezier(0.4, 0, 0.2, 1)",
                "hover:translate-y-[-12px] hover:shadow-neu-raised-hover",
                "animate-fadeInUp"
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {/* Step number container - uses sunken effect */}
              <div className="w-20 h-20 rounded-2xl bg-bg-sunken shadow-neu-sunken flex items-center justify-center flex-shrink-0 relative z-10 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-[360deg]">
                <span className="text-3xl font-black text-theme-primary drop-shadow-sm">
                  {step.number}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-xl font-bold text-content-primary tracking-tight">
                  {step.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed max-w-xs mx-auto text-content-secondary opacity-90">
                  {step.description}
                </p>
              </div>

              {/* Decorative accent dot that appears on hover */}
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-theme-primary opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-300 scale-0 group-hover:scale-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
