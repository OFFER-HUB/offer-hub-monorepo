"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Types ── */

export type CardVariant = "detailed" | "simple";

export interface DetailedMetricCard {
  id: string;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
  offerHub: { value: string; unit: string; sublabel: string };
  traditional: { value: string; unit: string; sublabel: string };
  savingsLabel: string;
  savingsValue: string;
  isGrowth: boolean;
  description: string;
}

export interface SimpleMetricCard {
  label: string;
  offerhub: string;
  traditional: string;
  icon: React.FC<{ size?: number; className?: string }>;
  savingsLabel: string;
  savingsValue: string;
  description: string;
  higherIsBetter: boolean;
}

export type MetricCard = DetailedMetricCard | SimpleMetricCard;

export interface StellarImpactCardsProps {
  variant: CardVariant;
  cards: MetricCard[];
  toggleId: string;
  showHeader?: boolean;
  summaryContent?: {
    offerhub?: { icon?: React.FC<{ size?: number; className?: string }>; text: React.ReactNode };
    traditional?: { icon?: React.FC<{ size?: number; className?: string }>; text: React.ReactNode };
  };
}

/* ── Helpers ── */

function isDetailed(card: MetricCard): card is DetailedMetricCard {
  return "id" in card && "offerHub" in card;
}

/* ── Animated Counter (detailed variant) ── */

function AnimatedNumberDetailed({ value, suffix }: { value: string; suffix: string }) {
  const [displayed, setDisplayed] = useState("0");

  useEffect(() => {
    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    if (isNaN(numeric)) {
      setDisplayed(value);
      return;
    }

    const duration = 1200;
    const steps = 40;
    const stepMs = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = numeric * eased;

      if (value.includes(".")) {
        const decimals = value.split(".")[1]?.length ?? 1;
        setDisplayed(val.toFixed(decimals));
      } else if (value.includes("–")) {
        setDisplayed(value);
      } else {
        setDisplayed(Math.round(val).toString());
      }

      if (current >= steps) {
        setDisplayed(value);
        clearInterval(timer);
      }
    }, stepMs);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {displayed}
      <span className="ml-1">{suffix}</span>
    </span>
  );
}

/* ── Animated Text (simple variant) ── */

function AnimatedText({ value, mode }: { value: string; mode: "offerhub" | "traditional" }) {
  const prevModeRef = useRef<"offerhub" | "traditional">(mode);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (prevModeRef.current !== mode) {
      prevModeRef.current = mode;
      setDisplay(value);
    }
  }, [value, mode]);

  return (
    <motion.span
      key={`${mode}-${value}`}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {display}
    </motion.span>
  );
}

/* ── GrowthBadge (detailed variant) ── */

function GrowthBadge({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="flex items-center gap-1.5 bg-theme-success/10 rounded-full px-3 py-1 w-fit"
    >
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
      >
        <TrendingUp size={12} className="text-theme-success" />
      </motion.div>
      <span className="text-[10px] font-bold text-theme-success uppercase tracking-wider">
        {label}:
      </span>
      <span className="text-[10px] font-black text-theme-success">{value}</span>
    </motion.div>
  );
}

/* ── ModeToggle (detailed variant) ── */

function ModeToggleDetailed({
  mode,
  onChange,
  toggleId,
}: {
  mode: "offerhub" | "traditional";
  onChange: (m: "offerhub" | "traditional") => void;
  toggleId: string;
}) {
  return (
    <div className="inline-flex items-center bg-bg-sunken shadow-neu-sunken rounded-2xl p-1 gap-1">
      {(
        [
          { key: "offerhub" as const, label: "OFFER-HUB Engine", icon: Zap },
          { key: "traditional" as const, label: "Standard Platform", icon: BarChart3 },
        ]
      ).map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300",
            mode === key
              ? "text-theme-primary shadow-neu-raised"
              : "text-content-muted hover:text-content-secondary",
          )}
        >
          {mode === key && (
            <motion.div
              layoutId={`${toggleId}-toggle-bg`}
              className="absolute inset-0 rounded-xl bg-bg-elevated shadow-neu-raised"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <Icon size={13} />
            {label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── ModeToggle (simple variant) ── */

function ModeToggleSimple({
  mode,
  onChange,
  toggleId,
}: {
  mode: "offerhub" | "traditional";
  onChange: (m: "offerhub" | "traditional") => void;
  toggleId: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full shadow-neu-raised-sm bg-bg-elevated p-1 gap-1">
      {(["offerhub", "traditional"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            "relative z-10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors duration-200",
            mode === m
              ? "text-bg-base"
              : "text-content-muted hover:text-content-secondary",
          )}
        >
          {mode === m && (
            <motion.span
              layoutId={`${toggleId}-toggle-bg`}
              className="absolute inset-0 rounded-full bg-theme-primary"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <span className="relative">
            {m === "offerhub" ? "Offer Hub" : "Traditional"}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── SummaryBar (detailed variant) ── */

function SummaryBarDetailed({
  mode,
  content,
}: {
  mode: "offerhub" | "traditional";
  content?: {
    offerhub?: { icon?: React.FC<{ size?: number; className?: string }>; text: React.ReactNode };
    traditional?: { icon?: React.FC<{ size?: number; className?: string }>; text: React.ReactNode };
  };
}) {
  if (mode !== "offerhub") return null;

  const Icon = content?.offerhub?.icon ?? ShieldCheck;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-bg-elevated shadow-neu-raised rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-theme-success/10 flex items-center justify-center">
          <Icon size={16} className="text-theme-success" />
        </div>
        <p className="text-sm font-bold text-content-primary">
          {content?.offerhub?.text}
        </p>
      </div>
      <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-content-muted bg-bg-base shadow-neu-sunken-subtle rounded-full px-3 py-1">
        Stellar Network &middot; Current averages
      </span>
    </motion.div>
  );
}

/* ── SummaryBar (simple variant) ── */

function SummaryBarSimple({
  mode,
  content,
}: {
  mode: "offerhub" | "traditional";
  content?: {
    offerhub?: { icon?: React.FC<{ size?: number; className?: string }>; text: React.ReactNode };
    traditional?: { icon?: React.FC<{ size?: number; className?: string }>; text: React.ReactNode };
  };
}) {
  return (
    <div className="flex items-center gap-3 py-4 px-6 md:px-8 rounded-2xl shadow-neu-sunken-subtle bg-bg-sunken">
      <div className="w-2 h-2 rounded-full bg-theme-primary animate-pulse flex-shrink-0" />
      {mode === "offerhub" ? (
        <p className="text-xs md:text-sm text-content-secondary leading-relaxed">
          {content?.offerhub?.text}
        </p>
      ) : (
        <p className="text-xs md:text-sm text-content-secondary leading-relaxed">
          {content?.traditional?.text}
        </p>
      )}
    </div>
  );
}

/* ── Metric Card (detailed variant) ── */

function DetailedMetricCardComponent({
  metric,
  mode,
  index,
}: {
  metric: DetailedMetricCard;
  mode: "offerhub" | "traditional";
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = metric.icon;
  const active = mode === "offerhub" ? metric.offerHub : metric.traditional;
  const isOfferHub = mode === "offerhub";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.12,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      onClick={() => setExpanded((p) => !p)}
      className={cn(
        "relative rounded-[1.75rem] bg-bg-elevated cursor-pointer select-none",
        "p-6 md:p-7 transition-all duration-300",
        "shadow-neu-raised hover:shadow-neu-raised-hover",
        "overflow-hidden",
      )}
    >
      {isOfferHub && (
        <div
          className="absolute inset-0 rounded-[1.75rem] pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(20,154,155,0.04) 0%, transparent 60%)",
          }}
        />
      )}

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bg-base shadow-neu-sunken-subtle flex items-center justify-center text-theme-primary flex-shrink-0">
              <Icon size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-content-muted">
              {metric.label}
            </span>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="w-6 h-6 rounded-full bg-bg-base shadow-neu-sunken-subtle flex items-center justify-center"
          >
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path
                d="M1 1l4 4 4-4"
                stroke="var(--color-content-muted, #9ca3af)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <p
              className={cn(
                "text-4xl md:text-5xl font-black leading-none tracking-tight",
                isOfferHub ? "text-theme-primary" : "text-content-secondary",
              )}
            >
              <AnimatedNumberDetailed value={active.value} suffix={active.unit} />
            </p>
            <p className="text-xs text-content-muted mt-1.5 font-medium">
              {active.sublabel}
            </p>
          </motion.div>
        </AnimatePresence>

        {isOfferHub && (
          <GrowthBadge
            label={metric.savingsLabel}
            value={metric.savingsValue}
          />
        )}

        {isOfferHub && (
          <div className="flex items-center gap-2 bg-bg-sunken shadow-neu-sunken-subtle rounded-xl px-3 py-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-content-muted">
              vs
            </span>
            <span className="text-xs font-black text-theme-warning">
              {metric.traditional.value}
              <span className="ml-0.5 font-bold">
                {metric.traditional.unit}
              </span>
            </span>
            <span className="text-[10px] text-content-muted truncate">
              {metric.traditional.sublabel}
            </span>
          </div>
        )}

        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="text-xs leading-relaxed text-content-secondary overflow-hidden"
            >
              {metric.description}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Metric Card (simple variant) ── */

function SimpleMetricCardComponent({
  metric,
  mode,
  index,
}: {
  metric: SimpleMetricCard;
  mode: "offerhub" | "traditional";
  index: number;
}) {
  const Icon = metric.icon;
  const value = mode === "offerhub" ? metric.offerhub : metric.traditional;
  const isGood =
    mode === "offerhub"
      ? metric.higherIsBetter ||
        metric.offerhub === "0%" ||
        metric.offerhub === "100%"
      : false;

  return (
    <motion.div
      className="flex-1 min-w-0 flex flex-col gap-4 p-6 md:p-8 rounded-[2rem] shadow-neu-raised bg-bg-elevated animate-fadeInUp"
      style={{ animationDelay: `${index * 100}ms` }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-11 h-11 rounded-xl shadow-neu-sunken-subtle bg-bg-base flex items-center justify-center text-theme-primary flex-shrink-0">
          <Icon size={20} />
        </div>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 shadow-neu-raised-sm",
            isGood
              ? "bg-theme-success/12 text-theme-success"
              : "bg-theme-warning/12 text-theme-warning",
          )}
        >
          {metric.savingsValue}
        </span>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-1">
          {metric.label}
        </p>
        <p
          className={cn(
            "text-3xl md:text-4xl font-extrabold tabular-nums leading-none",
            mode === "offerhub" ? "text-theme-primary" : "text-content-muted",
          )}
        >
          <AnimatedText value={value} mode={mode} />
        </p>
      </div>

      <p className="text-xs text-content-muted leading-relaxed mt-auto">
        {metric.description}
      </p>

      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            isGood ? "bg-theme-success" : "bg-theme-warning",
          )}
        />
        <span className="text-[10px] font-medium text-content-muted">
          {metric.savingsLabel}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Main Component ── */

export default function StellarImpactCards({
  variant,
  cards,
  toggleId,
  showHeader = true,
  summaryContent,
}: StellarImpactCardsProps) {
  const [mode, setMode] = useState<"offerhub" | "traditional">("offerhub");

  return (
    <div
      className={cn(
        "animate-fadeInScale",
        variant === "detailed"
          ? "relative w-full max-w-5xl mx-auto space-y-6"
          : "w-full flex flex-col items-center gap-6 md:gap-8",
      )}
    >
      {variant === "detailed" && showHeader && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-1">
              Economic Proof
            </p>
            <h3 className="text-2xl md:text-3xl font-black text-content-primary leading-tight">
              The Stellar Advantage
            </h3>
            <p className="text-sm text-content-secondary mt-1 max-w-md">
              Hard data that answers{" "}
              <em className="not-italic font-semibold text-content-primary">
                &ldquo;Why switch to OFFER-HUB?&rdquo;
              </em>
            </p>
          </div>

          <ModeToggleDetailed mode={mode} onChange={setMode} toggleId={toggleId} />
        </div>
      )}

      {variant === "simple" && (
        <ModeToggleSimple mode={mode} onChange={setMode} toggleId={toggleId} />
      )}

      {variant === "detailed" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.filter(isDetailed).map((metric, i) => (
            <DetailedMetricCardComponent
              key={metric.id}
              metric={metric}
              mode={mode as "offerhub" | "traditional"}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6">
          {(cards as SimpleMetricCard[]).map((metric, i) => (
            <SimpleMetricCardComponent
              key={metric.label}
              metric={metric}
              mode={mode as "offerhub" | "traditional"}
              index={i}
            />
          ))}
        </div>
      )}

      {variant === "detailed" && (
        <AnimatePresence>
          {mode === "offerhub" && summaryContent && (
            <SummaryBarDetailed mode={mode} content={summaryContent} />
          )}
        </AnimatePresence>
      )}

      {variant === "simple" && summaryContent && (
        <SummaryBarSimple mode={mode} content={summaryContent} />
      )}
    </div>
  );
}
