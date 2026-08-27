import {
  Server,
  Lock,
  Coins,
  Code2,
  Zap,
  GitBranch,
  ShieldCheck,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: Server,
    title: "Self-Hosted",
    description:
      "Deploy on your own infrastructure. Full control over your data, zero vendor lock-in, and complete operational independence.",
    large: true,
  },
  {
    icon: Lock,
    title: "Non-Custodial Escrow",
    description:
      "Stellar-powered escrow that never holds your funds. Every transaction is cryptographically secured on-chain.",
    large: false,
  },
  {
    icon: Coins,
    title: "Multi-Currency",
    description:
      "Accept any asset — fiat, stablecoins, or Stellar tokens. Automatic conversion at settlement.",
    large: false,
  },
  {
    icon: Code2,
    title: "Developer-First API",
    description:
      "REST endpoints, real-time SSE events, and an SDK built for speed. Integrate in hours, not weeks.",
    large: false,
  },
  {
    icon: Zap,
    title: "Instant Settlements",
    description:
      "Stellar's 3-5 second finality means your merchants get paid fast, not days later.",
    large: false,
  },
  {
    icon: GitBranch,
    title: "Open Source",
    description:
      "MIT licensed. Audit the code, fork it, extend it. The community drives the roadmap.",
    large: false,
  },
  {
    icon: ShieldCheck,
    title: "Compliance Ready",
    description:
      "Built-in KYC/AML integration hooks. Plug in your compliance provider without touching core payment logic.",
    large: false,
  },
  {
    icon: Bell,
    title: "Real-Time Events",
    description:
      "Instant SSE event notifications for every state change. Your systems stay in sync with zero polling.",
    large: false,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16 animate-fadeInUp">
          <p className="text-xs font-medium uppercase tracking-[0.4em] mb-4 text-theme-primary">
            Why OFFER HUB
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-content-primary">
            Built for modern marketplaces
          </h2>
          <p className="mt-4 text-lg font-light max-w-xl mx-auto text-content-secondary">
            Everything you need to orchestrate payments — nothing you don&apos;t.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`${
                  feature.large ? "md:col-span-2" : ""
                } relative z-10 p-8 rounded-2xl bg-bg-elevated shadow-neu-raised flex flex-col gap-4 transition-shadow duration-300 hover:shadow-neu-raised-hover`}
              >
                <div className="w-10 h-10 rounded-xl bg-bg-base shadow-neu-sunken-subtle flex items-center justify-center">
                  <Icon size={18} className="text-theme-primary" />
                </div>
                <h3 className={`font-bold text-content-primary ${feature.large ? "text-2xl" : "text-lg"}`}>
                  {feature.title}
                </h3>
                <p className={`font-light leading-relaxed text-content-secondary ${feature.large ? "text-base" : "text-sm"}`}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
