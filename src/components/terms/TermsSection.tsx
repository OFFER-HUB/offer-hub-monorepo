import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle, Ban, Briefcase, Code, Coins, CreditCard,
  FileCheck, FileText, Gavel, HelpCircle, Lock, Plug,
  RefreshCw, Scale, Server, Shield, Split, UserCircle, Users,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  AlertTriangle, Ban, Briefcase, Code, Coins, CreditCard,
  FileCheck, FileText, Gavel, HelpCircle, Lock, Plug,
  RefreshCw, Scale, Server, Shield, Split, UserCircle, Users,
};

interface TermsSectionProps {
  icon: string;
  title: string;
  children: ReactNode;
}

export function TermsSection({ icon, title, children }: TermsSectionProps) {
  const Icon = ICON_MAP[icon];
  return (
    <section className="p-8 md:p-12 rounded-[2.5rem] bg-bg-base shadow-raised">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-bg-base shadow-sunken-subtle text-theme-primary">
          {Icon && <Icon size={20} />}
        </div>
        <h2 className="text-2xl font-black text-content-primary tracking-tight">{title}</h2>
      </div>
      <div className="[&_h3:first-child]:mt-0">
        {children}
      </div>
    </section>
  );
}
