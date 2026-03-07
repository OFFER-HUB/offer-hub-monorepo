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

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16 animate-fadeInUp">
          <p
            className="text-xs font-medium uppercase tracking-[0.4em] mb-4"
            style={{ color: "#149A9B" }}
          >
            How it works
          </p>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight"
            style={{ color: "#19213D" }}
          >
            Up and running in three steps
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line — desktop only */}
          <div
            className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px"
            style={{ background: "linear-gradient(to right, transparent, #d1d5db, transparent)" }}
          />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center gap-6"
            >
              <div
                className="w-24 h-24 rounded-full shadow-raised flex items-center justify-center flex-shrink-0 relative z-10"
                style={{ background: "#F1F3F7" }}
              >
                <span
                  className="text-2xl font-black"
                  style={{ color: i === 1 ? "#149A9B" : "#19213D" }}
                >
                  {step.number}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xl font-bold" style={{ color: "#19213D" }}>
                  {step.title}
                </h3>
                <p
                  className="text-sm font-light leading-relaxed max-w-xs mx-auto"
                  style={{ color: "#6D758F" }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
