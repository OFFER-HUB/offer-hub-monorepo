import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CommandLine } from "@/components/docs/CommandLine";
import { GITHUB_REPO_URL } from "@/constants/github";
import { cn } from "@/lib/cn";

export const INSTALL_COMMAND = "npx create-offer-hub-orchestrator";

const STACK = ["USDC", "Stellar", "Trustless Work"] as const;

/** Shared card surface for the home bento. */
export const BENTO_CARD_CLASS = "rounded-3xl bg-bg-elevated shadow-neu-raised";

/** Label 12/600 uppercase. `text-action` keeps ≥ 4.5:1 on bg-elevated in both themes. */
export const BENTO_EYEBROW_CLASS = "text-xs font-semibold uppercase tracking-widest text-action";

/** H2 28/700. */
export const BENTO_H2_CLASS = "text-[1.75rem] font-bold leading-[1.25] text-content-primary";

/** Tinted pill (badge style: rounded-full, no shadow). */
export const PILL_CLASS =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-content-primary bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const ENTER_CLASS = "animate-fadeIn motion-reduce:animate-none";

/**
 * Bento row 1: the value-proposition card (4/6) and the install card (2/6).
 * Rendered as two grid items, so it must sit inside the home page's bento grid.
 */
export function HeroSection() {
  return (
    <>
      <section
        aria-labelledby="home-title"
        className={cn(BENTO_CARD_CLASS, ENTER_CLASS, "flex flex-col justify-center p-6 sm:p-10 lg:col-span-4")}
      >
        <p className={BENTO_EYEBROW_CLASS}>Self-hosted · non-custodial · open source</p>

        <h1
          id="home-title"
          className="mt-4 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-content-primary sm:text-[3.5rem] xl:text-[4.5rem]"
        >
          Escrow for your marketplace{" "}
          <span className="bg-[linear-gradient(90deg,var(--color-action),var(--color-primary))] bg-clip-text text-transparent">
            without building payments
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-content-secondary sm:text-lg">
          OFFER-HUB is a self-hosted orchestrator that adds non-custodial USDC escrow, releases,
          refunds, and disputes to your marketplace through one REST API and a TypeScript SDK.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button
            href="/docs/guide/quick-start"
            size="lg"
            trailingIcon={<ArrowRight size={16} aria-hidden="true" />}
          >
            Read the quick start
          </Button>
          <Button
            href={GITHUB_REPO_URL}
            variant="secondary"
            size="lg"
            target="_blank"
            rel="noopener noreferrer"
            trailingIcon={<ExternalLink size={16} aria-hidden="true" />}
          >
            View on GitHub
          </Button>
        </div>
      </section>

      <section
        aria-labelledby="home-install"
        className={cn(BENTO_CARD_CLASS, ENTER_CLASS, "flex min-w-0 flex-col gap-6 p-6 sm:p-8 lg:col-span-2")}
      >
        <div>
          <p className={BENTO_EYEBROW_CLASS}>Install</p>
          <h2 id="home-install" className={cn(BENTO_H2_CLASS, "mt-2")}>
            Run your own orchestrator
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-content-secondary">
            The scaffolder asks a few questions and sets up a configured instance.
          </p>
        </div>

        <CommandLine command={INSTALL_COMMAND} title="Terminal" className="my-0" />

        <div className="mt-auto">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-content-secondary">
            Built on
          </p>
          <ul role="list" className="flex flex-wrap gap-2">
            {STACK.map((item) => (
              <li key={item} className={PILL_CLASS}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
