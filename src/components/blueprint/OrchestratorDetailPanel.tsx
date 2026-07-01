import Link from "next/link";
import { ArrowRight, ChevronDown, Command } from "lucide-react";
import { DetailCard, LayerKey } from "./OrchestratorShowcase.types";

interface OrchestratorDetailPanelProps {
  cards: DetailCard[];
  expandedKey: LayerKey | null;
  onToggle: (key: LayerKey) => void;
}

function ArchitectureCard({
  card,
  expanded,
  onToggle,
}: {
  card: DetailCard;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = card.icon;

  return (
    <article className="rounded-[2rem] bg-bg-elevated p-8 shadow-neu-raised-l2-sm overflow-visible transition-transform duration-300 hover:-translate-y-1 blueprint-layer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-[1.25rem] bg-bg-base p-3 shadow-neu-sunken-subtle">
            <Icon className="h-5 w-5 text-theme-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary">
              {card.eyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-content-primary">{card.title}</h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-bg-base text-content-secondary shadow-neu-raised-sm transition-transform duration-300 hover:text-theme-primary"
          aria-expanded={expanded}
          aria-controls={`${card.key}-details`}
        >
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <p className="mt-6 text-sm leading-7 text-content-secondary">{card.summary}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full bg-theme-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-theme-primary">
          Core call: {card.method}
        </span>
        <span className="inline-flex items-center rounded-full bg-bg-base px-3 py-1 text-xs text-content-muted shadow-neu-sunken-subtle">
          Deep-dive available
        </span>
      </div>

      <div
        id={`${card.key}-details`}
        className={`grid transition-all duration-300 ${expanded ? "mt-6 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"}`}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          {expanded ? (
            <div className="rounded-[1.5rem] bg-bg-base p-5 shadow-neu-sunken-l2-subtle overflow-visible">
              <p className="text-sm leading-7 text-content-primary">{card.callout}</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-content-secondary">
                {card.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-theme-primary" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={card.docHref}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-theme-primary transition-colors hover:text-theme-primary-hover"
              >
                Open {card.docLabel}
                <Command className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function OrchestratorDetailPanel({ cards, expandedKey, onToggle }: OrchestratorDetailPanelProps) {
  return (
    <div className="mt-12 grid gap-6 xl:grid-cols-3 overflow-visible">
      {cards.map((card) => (
        <ArchitectureCard
          key={card.key}
          card={card}
          expanded={expandedKey === card.key}
          onToggle={() => onToggle(card.key)}
        />
      ))}
    </div>
  );
}
