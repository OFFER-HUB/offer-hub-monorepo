import { Info, AlertTriangle, Lightbulb, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/cn";

type CalloutType = "note" | "warning" | "tip" | "danger";

interface CalloutProps {
  type?: CalloutType;
  children: React.ReactNode;
}

const VARIANTS: Record<
  CalloutType,
  { icon: React.ReactNode; bgColor: string; iconColor: string; label: string }
> = {
  note: {
    icon: <Info size={16} />,
    bgColor: "var(--color-callout-note-bg)",
    iconColor: "var(--color-primary)",
    label: "Note",
  },
  tip: {
    icon: <Lightbulb size={16} />,
    bgColor: "var(--color-callout-tip-bg)",
    iconColor: "var(--color-success)",
    label: "Tip",
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    bgColor: "var(--color-callout-warning-bg)",
    iconColor: "var(--color-warning)",
    label: "Warning",
  },
  danger: {
    icon: <AlertOctagon size={16} />,
    bgColor: "var(--color-callout-danger-bg)",
    iconColor: "var(--color-error)",
    label: "Danger",
  },
};

export function Callout({ type = "note", children }: CalloutProps) {
  const config = VARIANTS[type];

  return (
    <div
      role="note"
      className={cn("rounded-2xl px-5 py-4 my-6 shadow-neu-raised-sm")}
      style={{
        background: config.bgColor,
      }}
    >
      <div
        className="flex items-center gap-2 mb-1.5 text-sm font-semibold"
        style={{ color: config.iconColor }}
      >
        {config.icon}
        {config.label}
      </div>
      <div className="text-sm leading-relaxed text-content-primary">
        {children}
      </div>
    </div>
  );
}
