import React from "react";
import Link from "next/link";
import { Mail, Link2 } from "lucide-react";
import { DataRightsForm } from "./DataRightsForm";
import { Callout } from "@/components/docs/Callout";
import { getIcon, type IconName } from "@/lib/icon-registry";
import { COMPANY_INFO } from "@/data/company-info";
import { legalSlug } from "@/components/legal/legalSlug";
export { DataRightsForm };

export function PrivacyFeatureCard({
  title,
  description,
  iconName,
  large = false,
}: {
  title: string;
  description: string;
  iconName: IconName;
  large?: boolean;
}): React.ReactElement {
  const Icon = getIcon(iconName, "ShieldCheck");
  return (
    <div
      className={`${
        large ? "sm:col-span-2 md:col-span-2" : ""
      } p-10 rounded-3xl bg-bg-elevated shadow-neu-raised flex flex-col gap-6 group hover:shadow-neu-raised-hover transition-shadow duration-200`}
    >
      <div className="w-14 h-14 rounded-2xl shadow-neu-sunken-subtle flex items-center justify-center shrink-0 bg-bg-elevated group-hover:shadow-neu-sunken transition-shadow duration-200">
        <Icon size={24} className="text-theme-primary" />
      </div>
      <div>
          <h2 id={legalSlug(title)} className="scroll-mt-28 mb-4 text-h3 text-content-primary">
          {title}
        </h2>
        <p className={`font-medium leading-relaxed ${large ? "text-base" : "text-sm"} text-content-secondary`}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function PrivacyFeaturesGrid({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-5">
      {children}
    </div>
  );
}

export function ProcessorCard({
  name,
  purpose,
  data,
  region,
  link,
}: {
  name: string;
  purpose: string;
  data: string;
  region?: string;
  link: string;
}): React.ReactElement {
  return (
    <div className="p-8 rounded-2xl bg-bg-elevated shadow-neu-raised flex flex-col gap-4 border border-[color-mix(in_srgb,var(--color-primary)_5%,transparent)] hover:shadow-neu-raised-hover transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-content-primary">{name}</h3>
      <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center text-sm font-semibold text-theme-primary hover:underline focus-visible:outline-2 focus-visible:outline-theme-primary"
        >
          Privacy Policy <Link2 size={12} />
        </a>
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-content-secondary block mb-1">
            Purpose
          </span>
          <p className="text-sm font-medium text-content-secondary leading-relaxed">{purpose}</p>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-content-secondary block mb-1">
            Data Shared
          </span>
          <p className="text-sm font-medium text-content-secondary leading-relaxed">{data}</p>
        </div>
        {region && (
          <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-content-secondary block mb-1">
              Information
            </span>
            <p className="text-sm font-medium text-content-secondary leading-relaxed">{region}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProcessorsGrid({ children }: { children: React.ReactNode }): React.ReactElement {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}

export function ContactSection(): React.ReactElement {
  return (
    <div className="p-8 sm:p-12 md:p-14 rounded-3xl shadow-neu-raised flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-14 mt-16 bg-bg-elevated">
      <div className="flex flex-col gap-6 md:max-w-md">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-neu-sunken-subtle bg-bg-elevated">
          <Mail size={24} className="text-theme-primary" />
        </div>
        <div>
          <h2 id="get-in-touch" className="scroll-mt-28 text-h2 font-bold leading-tight text-content-primary tracking-tight mb-4">Get in Touch</h2>
          <p className="font-medium leading-relaxed text-base text-content-secondary">
            Questions about this policy or how we handle your data? Our privacy team is here to help. We aim to respond
            to all inquiries within 2 business days.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5 w-full md:w-auto md:shrink-0 md:min-w-[280px]">
        {[
          { label: "Privacy inquiries", cta: "Submit via contact form" },
          { label: "General support", cta: "Reach us via contact form" },
        ].map(({ label, cta }) => (
          <Link
            key={label}
            href={COMPANY_INFO.contactPath}
            className="flex min-h-11 flex-col justify-center gap-1 rounded-2xl px-6 py-5 transition-shadow duration-200 shadow-neu-sunken-subtle bg-bg-elevated hover:shadow-neu-sunken group focus-visible:outline-2 focus-visible:outline-theme-primary"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-content-secondary">{label}</span>
            <span className="text-base font-bold text-theme-primary group-hover:text-content-primary transition-colors">
              {cta}
            </span>
          </Link>
        ))}
        <Callout tone="note" label="Registered office" className="my-0">
          {COMPANY_INFO.name}
          <br />
          {COMPANY_INFO.address.line1}
          <br />
          {COMPANY_INFO.address.line2}
        </Callout>
      </div>
    </div>
  );
}

export const MDX_PRIVACY_COMPONENTS = {
  FeaturesGrid: PrivacyFeaturesGrid,
  FeatureCard: PrivacyFeatureCard,
  ProcessorsGrid,
  ProcessorCard,
  ContactSection,
  DataRightsForm,
  h2: ({ children }: { children: React.ReactNode }) => {
    const label = React.Children.toArray(children).map((child) => typeof child === "string" ? child : React.isValidElement<{ children?: React.ReactNode }>(child) ? String(child.props.children ?? "") : "").join("").replace(/\s+/g, " ").trim();
    return <h2 id={legalSlug(label)} className="scroll-mt-28 text-h2 font-bold leading-tight tracking-tight text-content-primary">{children}</h2>;
  },
  h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-xl font-semibold leading-tight text-content-primary">{children}</h3>,
};
