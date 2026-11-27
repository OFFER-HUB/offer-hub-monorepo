import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Code, Rocket, Terminal } from "lucide-react";
import { DocsSearchBar } from "@/components/docs/DocsSearchBar";
import { GITHUB_REPO_URL } from "@/constants/github";
import { cn } from "@/lib/cn";

interface EntryCard {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
}

const START_HERE: EntryCard = {
  icon: <Rocket size={22} aria-hidden="true" />,
  title: "Getting started",
  description:
    "Learn what OFFER-HUB is, run the Orchestrator, and make your first API call in a few minutes.",
  href: "/docs/getting-started",
};

const SECTION_CARDS: EntryCard[] = [
  {
    icon: <BookOpen size={20} aria-hidden="true" />,
    title: "Guides",
    description: "Step-by-step flows for orders, escrow, disputes, and self-hosting.",
    href: "/docs/guide/quick-start",
  },
  {
    icon: <Terminal size={20} aria-hidden="true" />,
    title: "API reference",
    description: "Every REST endpoint, authentication, errors, and webhook events.",
    href: "/docs/api-reference/overview",
  },
  {
    icon: <Code size={20} aria-hidden="true" />,
    title: "SDK",
    description: "Install the TypeScript SDK and call OFFER-HUB from your app.",
    href: "/docs/sdk/quick-start",
  },
];

const CARD_LINK_CLASS =
  "group block h-full bg-bg-base shadow-neu-raised transition-shadow duration-200 ease-out motion-reduce:transition-none hover:shadow-neu-raised-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base";

const ICON_WELL_CLASS =
  "flex shrink-0 items-center justify-center rounded-xl bg-bg-sunken text-theme-primary shadow-neu-sunken-subtle";

const CARD_TITLE_CLASS =
  "text-xl font-[650] text-content-primary transition-colors duration-200 motion-reduce:transition-none group-hover:text-theme-primary";

const H2_CLASS = "mb-5 text-[1.75rem] font-bold leading-[1.25] text-content-primary";

const HELP_LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-xl font-semibold text-theme-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary";

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-12 pb-8">
      <header className="max-w-2xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-theme-primary">
          OFFER-HUB documentation
        </p>
        <h1 className="mb-4 text-[2rem] font-bold leading-[1.2] text-content-primary">
          Integrate escrow into your marketplace
        </h1>
        <p className="mb-6 text-base leading-relaxed text-content-secondary">
          Guides, API reference, and SDK docs for running the self-hosted OFFER-HUB Orchestrator
          and wiring escrow payments into your product.
        </p>
        <DocsSearchBar />
      </header>

      <section aria-labelledby="docs-start-here">
        <h2 id="docs-start-here" className={H2_CLASS}>
          Start here
        </h2>
        <Link href={START_HERE.href} className={cn(CARD_LINK_CLASS, "rounded-3xl p-6 md:p-8")}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className={cn(ICON_WELL_CLASS, "h-12 w-12")}>{START_HERE.icon}</div>
            <div className="min-w-0 flex-1">
              <h3 className={cn(CARD_TITLE_CLASS, "mb-1")}>{START_HERE.title}</h3>
              <p className="text-base leading-relaxed text-content-secondary">
                {START_HERE.description}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-theme-primary">
              Read the guide
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </div>
        </Link>
      </section>

      <section aria-labelledby="docs-explore">
        <h2 id="docs-explore" className={H2_CLASS}>
          Explore the docs
        </h2>
        <ul role="list" className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {SECTION_CARDS.map((card) => (
            <li key={card.href}>
              <Link href={card.href} className={cn(CARD_LINK_CLASS, "rounded-2xl p-6")}>
                <div className={cn(ICON_WELL_CLASS, "mb-5 h-11 w-11")}>{card.icon}</div>
                <h3 className={cn(CARD_TITLE_CLASS, "mb-2")}>{card.title}</h3>
                <p className="text-sm leading-relaxed text-content-secondary">{card.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="flex flex-wrap items-center gap-x-6 text-sm text-content-secondary">
        <span>Can&apos;t find what you&apos;re looking for?</span>
        <Link href="/community" className={HELP_LINK_CLASS}>
          Community
        </Link>
        <Link href={`${GITHUB_REPO_URL}/issues`} className={HELP_LINK_CLASS}>
          GitHub issues
        </Link>
      </p>
    </div>
  );
}
