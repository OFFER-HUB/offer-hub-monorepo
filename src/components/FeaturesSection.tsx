import { Bell, Code2, Coins, GitBranch, Lock, Server, ShieldCheck, Zap } from "lucide-react";
import { BENTO_CARD_CLASS, BENTO_EYEBROW_CLASS, BENTO_H2_CLASS } from "@/components/HeroSection";
import { cn } from "@/lib/cn";

const features = [
  {
    icon: Server,
    title: "Self-hosted",
    description: "Run it on your own infrastructure. Your data, no vendor lock-in.",
  },
  {
    icon: Lock,
    title: "Non-custodial escrow",
    description: "Stellar-powered escrow that never holds your funds; every step is secured on-chain.",
  },
  {
    icon: Coins,
    title: "Multi-currency",
    description: "Accept fiat, stablecoins, or Stellar assets, with conversion at settlement.",
  },
  {
    icon: Code2,
    title: "Developer-first API",
    description: "REST endpoints, real-time SSE events, and an SDK built for speed.",
  },
  {
    icon: Zap,
    title: "Fast settlement",
    description: "Stellar finality in seconds, so sellers get paid fast, not days later.",
  },
  {
    icon: GitBranch,
    title: "Open source",
    description: "The code is public. Audit it, fork it, extend it.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance ready",
    description: "KYC/AML hooks let you plug in your provider without touching payment logic.",
  },
  {
    icon: Bell,
    title: "Real-time events",
    description: "An SSE notification for every state change, so your systems never poll.",
  },
];

/** Bento row 3: the feature list, condensed into one card. */
export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className={cn(BENTO_CARD_CLASS, "scroll-mt-32 p-6 sm:p-10 lg:col-span-6")}
    >
      <p className={BENTO_EYEBROW_CLASS}>Why OFFER-HUB</p>
      <h2 id="features-title" className={cn(BENTO_H2_CLASS, "mt-2")}>
        Built for modern marketplaces
      </h2>
      <p className="mt-2 text-base text-content-secondary">
        Everything you need to orchestrate payments, nothing you don&apos;t.
      </p>

      <ul role="list" className="mt-8 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <li key={feature.title} className="flex flex-col gap-2">
              <Icon size={20} aria-hidden="true" className="text-action" />
              <h3 className="text-xl font-[650] text-content-primary">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-content-secondary">{feature.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
