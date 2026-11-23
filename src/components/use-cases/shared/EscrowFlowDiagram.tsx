"use client";

import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import type { UseCaseFlowStep } from "../types";

export type EscrowStep = UseCaseFlowStep;

export interface EscrowFlowDiagramProps {
  steps: UseCaseFlowStep[];
  className?: string;
}

const STATUS_DOT: Record<UseCaseFlowStep["status"], string> = {
  CREATED: "bg-content-muted",
  FUNDED: "bg-theme-primary",
  AWAITING_RELEASE: "bg-theme-warning",
  SUCCEEDED: "bg-theme-success",
};

function StepCard({
  step,
  isActive,
  onActivate,
  onDeactivate,
}: {
  step: UseCaseFlowStep;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const Icon = step.icon;

  const handleBlur = useCallback(
    (event: React.FocusEvent) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.relatedTarget as Node)
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
        "flex w-full min-w-0 min-h-11 flex-col rounded-2xl bg-bg-base p-4 text-left",
        "transition-shadow duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sunken",
        isActive
          ? "shadow-neu-raised-hover"
          : "shadow-neu-raised-sm hover:shadow-neu-raised",
      )}
      onClick={() => (isActive ? onDeactivate() : onActivate())}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={handleBlur}
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-elevated text-content-primary shadow-neu-sunken-subtle">
          <Icon size={18} />
        </span>

        <span className="flex min-w-0 flex-col">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-content-secondary">
            Step {step.stepNumber}
          </span>
          <span className="break-words text-sm font-bold text-content-primary">
            {step.label}
          </span>
        </span>
      </span>

      <span className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-content-primary">
          <span
            className={cn("h-2 w-2 rounded-full", STATUS_DOT[step.status])}
            aria-hidden="true"
          />
          {step.status.replace(/_/g, " ")}
        </span>
        {step.isOnChain && (
          <span className="text-xs font-medium text-content-secondary">
            On-chain
          </span>
        )}
      </span>

      {isActive && (
        <span className="mt-3 block rounded-xl bg-bg-elevated p-3 shadow-neu-sunken-subtle">
          <span className="block text-xs leading-relaxed text-content-secondary">
            {step.description}
          </span>
          <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.14em] text-content-secondary">
            API endpoint
          </span>
          <code className="mt-1 block break-words font-mono text-xs text-content-primary">
            {step.apiMethod}
          </code>
          <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.14em] text-content-secondary">
            SDK
          </span>
          <code className="mt-1 block break-words font-mono text-xs text-content-primary">
            {step.apiSnippet}
          </code>
        </span>
      )}
    </button>
  );
}

export function EscrowFlowDiagram({
  steps,
  className,
}: EscrowFlowDiagramProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "w-full min-w-0 rounded-2xl bg-bg-sunken p-3 shadow-neu-sunken-subtle",
        className,
      )}
    >
      <ol className="flex flex-col gap-0">
        {steps.map((step, index) => (
          <li key={step.stepNumber} className="flex flex-col">
            {index > 0 && (
              <span
                className="mx-auto h-4 w-px bg-theme-border"
                aria-hidden="true"
              />
            )}
            <StepCard
              step={step}
              isActive={activeStep === step.stepNumber}
              onActivate={() => setActiveStep(step.stepNumber)}
              onDeactivate={() => setActiveStep(null)}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
