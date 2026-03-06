import { Info, AlertTriangle, Lightbulb, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/cn";

type CalloutType = "info" | "note" | "warning" | "tip" | "danger";

interface CalloutProps {
  type?: CalloutType;
  children: React.ReactNode;
}

const VARIANTS: Record<
  CalloutType,
  {
    icon: React.ReactNode;
    label: string;
    containerClass: string;
    accentClass: string;
  }
> = {
  // ✅ Matches requested palette: Info (blue)
  info: {
    icon: <Info size={16} />,
    label: "Info",
    containerClass:
      "bg-[#dbeafe] dark:bg-[#1e3a5f] border-l-[#2563eb] dark:border-l-[#93c5fd] border border-black/5 dark:border-white/10",
    accentClass: "text-[#2563eb] dark:text-[#93c5fd]",
  },

  // ✅ Matches requested palette: Note (gray)
  note: {
    icon: <Info size={16} />,
    label: "Note",
    containerClass:
      "bg-[#f3f4f6] dark:bg-[#374151] border-l-[#6b7280] dark:border-l-[#d1d5db] border border-black/5 dark:border-white/10",
    accentClass: "text-[#6b7280] dark:text-[#d1d5db]",
  },

  // ✅ Matches requested palette: Warning (yellow/orange)
  warning: {
    icon: <AlertTriangle size={16} />,
    label: "Warning",
    containerClass:
      "bg-[#fef3c7] dark:bg-[#78350f] border-l-[#d97706] dark:border-l-[#fbbf24] border border-black/5 dark:border-white/10",
    accentClass: "text-[#d97706] dark:text-[#fbbf24]",
  },

  // ✅ Matches requested palette: Error/Danger (red)
  danger: {
    icon: <AlertOctagon size={16} />,
    label: "Danger",
    containerClass:
      "bg-[#fee2e2] dark:bg-[#7f1d1d] border-l-[#ef4444] dark:border-l-[#fca5a5] border border-black/5 dark:border-white/10",
    accentClass: "text-[#ef4444] dark:text-[#fca5a5]",
  },

  // (Extra) Tip (green) — kept for backwards compatibility if docs already use it
  tip: {
    icon: <Lightbulb size={16} />,
    label: "Tip",
    containerClass:
      "bg-[#dcfce7] dark:bg-[#14532d] border-l-[#16a34a] dark:border-l-[#86efac] border border-black/5 dark:border-white/10",
    accentClass: "text-[#16a34a] dark:text-[#86efac]",
  },
};

export function Callout({ type = "note", children }: CalloutProps) {
  const config = VARIANTS[type];

  return (
    <div
      role="note"
      className={cn("my-5 rounded-xl border-l-4 px-4 py-3", config.containerClass)}
    >
      <div className={cn("mb-1.5 flex items-center gap-2 text-sm font-semibold", config.accentClass)}>
        {config.icon}
        {config.label}
      </div>

      {/* ✅ Required: main text uses token (theme-aware) */}
      <div className="text-sm leading-relaxed text-content-primary dark:text-[#f1f3f7] dark:[&_p]:!text-[#f1f3f7] dark:[&_li]:!text-[#f1f3f7] dark:[&_span]:!text-[#f1f3f7] dark:[&_strong]:!text-[#f1f3f7] dark:[&_code]:!text-[#f1f3f7]">
        {children}
      </div>
    </div>
  );
}