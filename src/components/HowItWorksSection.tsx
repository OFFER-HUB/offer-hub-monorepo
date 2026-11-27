import { Lock, PackageCheck, Scale } from "lucide-react";
import { BENTO_CARD_CLASS, BENTO_EYEBROW_CLASS, BENTO_H2_CLASS } from "@/components/HeroSection";
import { cn } from "@/lib/cn";

const steps = [
  {
    icon: Lock,
    title: "Funds locked",
    description:
      "The buyer funds the order and the USDC is locked in a non-custodial escrow on Stellar, created through Trustless Work.",
  },
  {
    icon: PackageCheck,
    title: "Work delivered",
    description:
      "The seller delivers and your marketplace moves the order forward through the REST API or the SDK.",
  },
  {
    icon: Scale,
    title: "Released or disputed",
    description:
      "Funds are released to the seller, refunded to the buyer, or frozen while a dispute is resolved.",
  },
];

/** Bento row 2: the escrow lifecycle as three compact cards. */
export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-32 lg:col-span-6"
    >
      <h2 id="how-it-works-title" className={cn(BENTO_H2_CLASS, "mb-6")}>
        How it works
      </h2>
      <ol role="list" className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.title} className={cn(BENTO_CARD_CLASS, "flex flex-col gap-4 p-6 sm:p-8")}>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bg-sunken text-action shadow-neu-sunken-subtle">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span className={BENTO_EYEBROW_CLASS}>Step {index + 1}</span>
              </div>
              <h3 className="text-xl font-[650] text-content-primary">{step.title}</h3>
              <p className="text-sm leading-relaxed text-content-secondary">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
