"use client";

import { useState, useRef, useCallback, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export interface EscrowStep {
  stepNumber: number;
  label: string;
  status: "CREATED" | "FUNDED" | "AWAITING_RELEASE" | "SUCCEEDED";
  icon: React.FC<{ size?: number; className?: string }>;
  apiMethod: string;
  apiSnippet: string;
  description: string;
  isOnChain: boolean;
}

export interface EscrowFlowDiagramProps {
  steps: EscrowStep[];
  className?: string;
}

const STATUS_STYLES: Record<EscrowStep["status"], string> = {
  CREATED: "bg-content-muted/12 text-content-secondary",
  FUNDED: "bg-theme-primary/12 text-theme-primary",
  AWAITING_RELEASE: "bg-theme-warning/12 text-theme-warning",
  SUCCEEDED: "bg-theme-success/12 text-theme-success",
};

function HoverDetailPanel({ step }: { step: EscrowStep }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="pt-4 space-y-3">
        <p className="text-xs font-medium leading-relaxed text-content-secondary">
          {step.description}
        </p>

        <div className="bg-bg-sunken shadow-neu-sunken-subtle rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted mb-1">
            API Endpoint
          </p>
          <code className="text-xs font-mono text-theme-primary break-all">
            {step.apiMethod}
          </code>
        </div>

        <div className="bg-bg-sunken shadow-neu-sunken-subtle rounded-xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-content-muted mb-1">
            SDK
          </p>
          <code className="text-xs font-mono text-content-primary break-all">
            {step.apiSnippet}
          </code>
        </div>
      </div>
    </motion.div>
  );
}

function StepCard({
  step,
  index,
  isActive,
  onActivate,
  onDeactivate,
}: {
  step: EscrowStep;
  index: number;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const Icon = step.icon;

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(e.relatedTarget as Node)
      ) {
        onDeactivate();
      }
    },
    [onDeactivate],
  );

  return (
    <button
      type="button"
      ref={cardRef}
      aria-expanded={isActive}
      aria-label={`Step ${step.stepNumber}: ${step.label}`}
      className={cn(
        "flex flex-col p-5 md:p-6 rounded-[1.5rem] bg-bg-elevated transition-all duration-300 ease-out cursor-pointer select-none",
        "w-full md:flex-1 min-w-0",
        "animate-fadeInUp",
        isActive
          ? "shadow-neu-raised-hover"
          : "shadow-neu-raised hover:shadow-neu-raised-hover",
      )}
      style={{ animationDelay: `${index * 150}ms` }}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onClick={() => (isActive ? onDeactivate() : onActivate())}
      onFocus={onActivate}
      onBlur={handleBlur}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-neu-sunken-subtle bg-bg-base flex items-center justify-center flex-shrink-0 text-theme-primary">
          <Icon size={20} />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted">
            Step {step.stepNumber}
          </span>
          <h4 className="text-sm md:text-base font-bold text-content-primary truncate">
            {step.label}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium shadow-neu-raised-sm",
            STATUS_STYLES[step.status],
          )}
        >
          {step.status.replace(/_/g, " ")}
        </span>
        {step.isOnChain && (
          <span className="text-[10px] font-bold text-theme-primary opacity-70">
            On-chain
          </span>
        )}
      </div>

      <AnimatePresence>
        {isActive && <HoverDetailPanel step={step} />}
      </AnimatePresence>
    </button>
  );
}

function ConnectorLine({ vertical }: { vertical: boolean }) {
  if (vertical) {
    return (
      <div className="flex justify-center py-1">
        <svg width="2" height="32" className="overflow-visible">
          <line
            x1="1"
            y1="0"
            x2="1"
            y2="32"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeDasharray="6 6"
            strokeOpacity="0.4"
            className="animate-connectorDash"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center justify-center flex-shrink-0 w-8 lg:w-12">
      <svg width="100%" height="2" className="overflow-visible">
        <line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeDasharray="6 6"
          strokeOpacity="0.4"
          className="animate-connectorDash"
        />
      </svg>
    </div>
  );
}

function BlockchainPulse({ active }: { active: boolean }) {
  const gradientId = useId();

  return (
    <div
      className={cn(
        "hidden md:block absolute inset-0 pointer-events-none transition-opacity duration-500",
        active ? "opacity-100" : "opacity-0",
      )}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <stop
              offset="0%"
              stopColor="var(--color-primary)"
              stopOpacity="0.08"
            />
            <stop
              offset="100%"
              stopColor="var(--color-primary)"
              stopOpacity="0"
            />
          </radialGradient>
        </defs>
        <circle
          cx="400"
          cy="250"
          r="200"
          fill={`url(#${gradientId})`}
          className="animate-blockchainPulse"
        />
        <circle
          cx="400"
          cy="250"
          r="300"
          fill={`url(#${gradientId})`}
          className="animate-blockchainPulse"
          style={{ animationDelay: "0.4s" }}
        />
        <circle
          cx="400"
          cy="250"
          r="400"
          fill={`url(#${gradientId})`}
          className="animate-blockchainPulse"
          style={{ animationDelay: "0.8s" }}
        />
      </svg>
    </div>
  );
}

export function EscrowFlowDiagram({
  steps,
  className,
}: EscrowFlowDiagramProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const isOnChainActive =
    activeStep !== null && steps[activeStep - 1]?.isOnChain;

  return (
    <div
      className={cn(
        "relative min-h-[400px] md:min-h-[550px] rounded-[3rem] shadow-neu-sunken w-full max-w-5xl mx-auto bg-bg-base p-6 md:p-12 animate-fadeInScale overflow-hidden",
        className,
      )}
    >
      <BlockchainPulse active={!!isOnChainActive} />

      <div
        className={cn(
          "relative z-10 flex gap-3 h-full",
          isMobile ? "flex-col" : "flex-row items-start",
        )}
      >
        {steps.map((step, i) => (
          <div key={step.stepNumber} className="contents">
            {i > 0 && <ConnectorLine vertical={isMobile} />}
            <StepCard
              step={step}
              index={i}
              isActive={activeStep === step.stepNumber}
              onActivate={() => setActiveStep(step.stepNumber)}
              onDeactivate={() => setActiveStep(null)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
