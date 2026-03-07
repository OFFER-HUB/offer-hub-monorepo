import { Info, AlertTriangle, Lightbulb, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/cn";

type CalloutType = "note" | "warning" | "tip" | "danger";

interface CalloutProps {
  type?: CalloutType;
  children: React.ReactNode;
}

const VARIANTS: Record<
  CalloutType,
  { icon: React.ReactNode; borderColor: string; bgColor: string; iconColor: string; label: string }
> = {
  note: {
    icon: <Info size={16} />,
    borderColor: "#149A9B",
    bgColor: "rgba(20,154,155,0.08)",
    iconColor: "#149A9B",
    label: "Note",
  },
  tip: {
    icon: <Lightbulb size={16} />,
    borderColor: "#16a34a",
    bgColor: "rgba(22,163,74,0.08)",
    iconColor: "#16a34a",
    label: "Tip",
  },
  warning: {
    icon: <AlertTriangle size={16} />,
    borderColor: "#d97706",
    bgColor: "rgba(217,119,6,0.08)",
    iconColor: "#d97706",
    label: "Warning",
  },
  danger: {
    icon: <AlertOctagon size={16} />,
    borderColor: "#FF0000",
    bgColor: "rgba(255,0,0,0.08)",
    iconColor: "#FF0000",
    label: "Danger",
  },
};

export function Callout({ type = "note", children }: CalloutProps) {
  const config = VARIANTS[type];

  return (
    <div
      role="note"
      className={cn("rounded-xl px-4 py-3 my-5 border-l-4")}
      style={{
        borderLeftColor: config.borderColor,
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
      <div className="text-sm leading-relaxed" style={{ color: "#19213D" }}>
        {children}
      </div>
    </div>
  );
}
