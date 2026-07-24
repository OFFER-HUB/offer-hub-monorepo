import type { ReactNode } from "react";
import { getIcon } from "@/lib/icon-registry";

interface TermsSectionProps {
  icon: string;
  title: string;
  children: ReactNode;
}

export function TermsSection({ icon, title, children }: TermsSectionProps) {
  const Icon = getIcon(icon, "FileText");
  return (
    <section className="p-8 md:p-12 rounded-[2.5rem] bg-bg-base shadow-raised">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bg-base shadow-sunken-subtle text-theme-primary">
          <Icon size={20} />
        </div>
        <h2 className="text-2xl font-black text-content-primary tracking-tight">{title}</h2>
      </div>
      <div className="[&_h3:first-child]:mt-0">{children}</div>
    </section>
  );
}
