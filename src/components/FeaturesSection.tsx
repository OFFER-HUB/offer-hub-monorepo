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
    gradient: "radial-gradient(ellipse 85% 80% at 8% 15%, rgba(20,154,155,0.15) 0%, rgba(20,154,155,0.05) 45%, transparent 75%), #F1F3F7",
    iconColor: "#149A9B",
  },
  {
    icon: Lock,
    title: "Non-Custodial Escrow",
    description:
      "Stellar-powered escrow that never holds your funds. Every transaction is cryptographically secured on-chain.",
    large: false,
    gradient: "radial-gradient(ellipse 90% 80% at 90% 5%, rgba(27,200,202,0.16) 0%, rgba(27,200,202,0.05) 50%, transparent 75%), #F1F3F7",
    iconColor: "#1bc8ca",
  },
  {
    icon: Coins,
    title: "Multi-Currency",
    description:
      "Accept any asset — fiat, stablecoins, or Stellar tokens. Automatic conversion at settlement.",
    large: false,
    gradient: "radial-gradient(ellipse 85% 90% at 10% 90%, rgba(13,115,119,0.14) 0%, rgba(13,115,119,0.04) 50%, transparent 75%), #F1F3F7",
    iconColor: "#0d7377",
  },
  {
    icon: Code2,
    title: "Developer-First API",
    description:
      "REST endpoints, webhooks, and an SDK built for speed. Integrate in hours, not weeks.",
    large: false,
    gradient: "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(25,33,61,0.08) 0%, rgba(25,33,61,0.02) 55%, transparent 80%), #F1F3F7",
    iconColor: "#149A9B",
  },
  {
    icon: Zap,
    title: "Instant Settlements",
    description:
      "Stellar's 3-5 second finality means your merchants get paid fast, not days later.",
    large: false,
    gradient: "radial-gradient(ellipse 80% 85% at 50% 0%, rgba(34,224,226,0.14) 0%, rgba(34,224,226,0.04) 50%, transparent 75%), #F1F3F7",
    iconColor: "#0d9fa0",
  },
  {
    icon: GitBranch,
    title: "Open Source",
    description:
      "MIT licensed. Audit the code, fork it, extend it. The community drives the roadmap.",
    large: false,
    gradient: "radial-gradient(ellipse 85% 80% at 92% 88%, rgba(10,98,101,0.15) 0%, rgba(10,98,101,0.04) 50%, transparent 75%), #F1F3F7",
    iconColor: "#0d7377",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Ready",
    description:
      "Built-in KYC/AML integration hooks. Plug in your compliance provider without touching core payment logic.",
    large: false,
    gradient: "radial-gradient(ellipse 85% 80% at 12% 80%, rgba(20,154,155,0.13) 0%, rgba(21,148,156,0.04) 50%, transparent 75%), #F1F3F7",
    iconColor: "#15949C",
  },
  {
    icon: Bell,
    title: "Real-Time Webhooks",
    description:
      "Instant event notifications for every state change. Your systems stay in sync with zero polling.",
    large: false,
    gradient: "radial-gradient(ellipse 80% 85% at 85% 50%, rgba(21,148,156,0.15) 0%, rgba(20,154,155,0.04) 50%, transparent 75%), #F1F3F7",
    iconColor: "#149A9B",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16 animate-fadeInUp">
          <p
            className="text-xs font-medium uppercase tracking-[0.4em] mb-4"
            style={{ color: "#149A9B" }}
          >
            Why OFFER HUB
          </p>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight"
            style={{ color: "#19213D" }}
          >
            Built for modern marketplaces
          </h2>
          <p
            className="mt-4 text-lg font-light max-w-xl mx-auto"
            style={{ color: "#6D758F" }}
          >
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
                } p-8 rounded-2xl shadow-raised flex flex-col gap-4`}
                style={{ background: feature.gradient }}
              >
                <div
                  className="w-10 h-10 rounded-xl shadow-raised-sm flex items-center justify-center"
                  style={{ background: "#F1F3F7" }}
                >
                  <Icon size={18} style={{ color: feature.iconColor }} />
                </div>
                <h3
                  className={`font-bold ${feature.large ? "text-2xl" : "text-lg"}`}
                  style={{ color: "#19213D" }}
                >
                  {feature.title}
                </h3>
                <p
                  className={`font-light leading-relaxed ${feature.large ? "text-base" : "text-sm"}`}
                  style={{ color: "#6D758F" }}
                >
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
