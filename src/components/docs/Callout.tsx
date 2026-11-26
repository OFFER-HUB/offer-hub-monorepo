import { Info, AlertTriangle, Lightbulb, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/cn";

export type CalloutTone = "note" | "tip" | "warning" | "danger";

interface CalloutProps {
  tone?: CalloutTone;
  /** Kept as an alias for the MDX `<Callout type="warning">` API. */
  type?: CalloutTone;
  label?: string;
  className?: string;
  children: React.ReactNode;
  role?: "note" | "alert";
}

const VARIANTS: Record<
  CalloutTone,
  { icon: React.ReactNode; background: string; accent: string; label: string }
> = {
  note: {
    icon: <Info size={16} aria-hidden="true" />,
    background: "bg-[var(--color-callout-note-bg)]",
    accent: "text-theme-primary",
    label: "Note",
  },
  tip: {
    icon: <Lightbulb size={16} aria-hidden="true" />,
    background: "bg-[var(--color-callout-tip-bg)]",
    accent: "text-theme-success",
    label: "Tip",
  },
  warning: {
    icon: <AlertTriangle size={16} aria-hidden="true" />,
    background: "bg-[var(--color-callout-warning-bg)]",
    accent: "text-theme-warning",
    label: "Warning",
  },
  danger: {
    icon: <AlertOctagon size={16} aria-hidden="true" />,
    background: "bg-[var(--color-callout-danger-bg)]",
    accent: "text-theme-error",
    label: "Danger",
  },
};

/** One theme-aware callout for docs, forms and marketing notices. */
export function Callout({
  tone,
  type,
  label,
  className,
  children,
  role = "note",
}: CalloutProps) {
  const variant = VARIANTS[tone ?? type ?? "note"];

  return (
    <div
      role={role}
      className={cn(
        "my-5 w-full min-w-0 rounded-2xl px-4 py-3 shadow-neu-raised-sm",
        variant.background,
        className,
      )}
    >
      <div
        className={cn(
          "mb-1.5 flex items-center gap-2 text-sm font-semibold",
          variant.accent,
        )}
      >
        {variant.icon}
        {label ?? variant.label}
      </div>
      <div className="text-sm leading-relaxed text-content-primary">
        {children}
      </div>
    </div>
  );
}
