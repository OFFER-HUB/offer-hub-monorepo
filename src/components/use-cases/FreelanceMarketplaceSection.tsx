import { CheckCircle2, ExternalLink } from "lucide-react";

const freelanceSteps = [
  {
    number: "01",
    title: "Client locks funds in escrow",
    description:
      "The client locks payment in escrow on Stellar. The money stays there until the work is done or both sides agree on an outcome.",
  },
  {
    number: "02",
    title: "Release when work is done",
    description:
      "When the freelancer delivers and the client approves, funds go straight to the freelancer. No platform holds the cash or triggers payouts by hand.",
  },
  {
    number: "03",
    title: "Disputes settled on-chain",
    description:
      "If there's something goes wrong, dispute resolution runs on Stellar. Release, refund, or split: the outcome is recorded on-chain and no single party is the custodian.",
  },
];

const freelanceBenefits = [
  "Escrow is non-custodial. Neither party holds the other's funds.",
  "Funds release automatically when the agreed conditions are met.",
  "Disputes are resolved on-chain with clear, enforceable outcomes.",
  "Runs on Stellar for fast, low-cost settlements worldwide.",
  "OFFER-HUB.org already uses it for live freelance marketplaces.",
];

export default function FreelanceMarketplaceSection() {
  return (
    <section id="freelance" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-14 animate-fadeInUp">
          <p className="text-xs font-medium uppercase tracking-[0.4em] mb-4 text-primary">
            Use case
          </p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-text-primary">
            Freelance Marketplace
          </h2>
          <p className="mt-5 text-base md:text-lg font-light leading-relaxed text-text-secondary">
            OFFER-HUB runs freelance marketplaces like{" "}
            <a
              href="https://offer-hub.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold hover:underline text-primary"
            >
              OFFER-HUB.org
            </a>
            . Escrow, automatic release, and dispute resolution all happen on
            Stellar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-12">
          {freelanceSteps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl p-6 shadow-raised bg-background"
            >
              <p className="text-sm font-black tracking-wide mb-3 text-primary">
                {step.number}
              </p>
              <h3 className="text-lg font-bold leading-snug mb-2 text-text-primary">
                {step.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </article>
          ))}
        </div>

        <div className="rounded-2xl p-6 md:p-8 shadow-raised bg-background">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-text-primary">
            Key benefits
          </h3>

          <ul className="space-y-4 mb-8">
            {freelanceBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-sm md:text-base font-light leading-relaxed text-text-secondary">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>

          <div>
            <a
              href="https://offer-hub.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-raised hover:shadow-raised-hover active:shadow-sunken-subtle transition-all duration-[400ms] ease-out bg-primary text-white"
            >
              <span>Visit OFFER-HUB.org</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
