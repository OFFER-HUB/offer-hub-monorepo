import React from "react";
import { Mail, Cookie, ShieldCheck, Link2 } from "lucide-react";
import { DataRightsForm } from "./DataRightsForm";
export { DataRightsForm };

const iconMap = {
  Mail,
  Cookie,
  ShieldCheck,
  Link2,
};

export function FeatureCard({
  title,
  description,
  iconName,
  large = false,
}: {
  title: string;
  description: string;
  iconName: keyof typeof iconMap;
  large?: boolean;
}) {
  const Icon = iconMap[iconName] || iconMap.ShieldCheck;
  return (
    <div
      className={`${
        large ? "sm:col-span-2 md:col-span-2" : ""
      } p-10 rounded-[2.5rem] bg-bg-elevated shadow-neu-raised flex flex-col gap-6 group hover:shadow-neu-raised-hover transition-all duration-500`}
    >
      <div className="w-14 h-14 rounded-2xl shadow-neu-sunken-subtle flex items-center justify-center shrink-0 bg-bg-elevated group-hover:shadow-neu-sunken transition-all duration-300">
        <Icon size={24} className="text-theme-primary" />
      </div>
      <div>
        <h3 className={`font-black tracking-tight mb-4 ${large ? "text-2xl" : "text-xl"} text-content-primary`}>
          {title}
        </h3>
        <p className={`font-medium leading-relaxed ${large ? "text-base" : "text-sm"} text-content-secondary`}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function FeaturesGrid({ children }: { children: React.ReactNode }) {
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
}) {
  return (
    <div className="p-8 rounded-[2rem] bg-bg-elevated shadow-neu-raised flex flex-col gap-4 border border-theme-primary/5 hover:shadow-neu-raised-hover transition-all duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-content-primary">{name}</h3>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
        >
          Privacy Policy <Link2 size={12} />
        </a>
      </div>
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-content-secondary block mb-1">
            Purpose
          </span>
          <p className="text-sm font-medium text-content-secondary leading-relaxed">{purpose}</p>
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-content-secondary block mb-1">
            Data Shared
          </span>
          <p className="text-sm font-medium text-content-secondary leading-relaxed">{data}</p>
        </div>
        {region && (
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-content-secondary block mb-1">
              Information
            </span>
            <p className="text-sm font-medium text-content-secondary leading-relaxed">{region}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProcessorsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}

export function ContactSection() {
  return (
    <div className="p-8 sm:p-12 md:p-14 rounded-[3rem] shadow-neu-raised flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-14 mt-16 bg-bg-elevated">
      <div className="flex flex-col gap-6 md:max-w-md">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-neu-sunken-subtle bg-bg-elevated">
          <Mail size={24} className="text-theme-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-content-primary tracking-tight mb-4">Get in Touch</h2>
          <p className="font-medium leading-relaxed text-base text-content-secondary">
            Questions about this policy or how we handle your data? Our privacy team is here to help. We aim to respond
            to all inquiries within 2 business days.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-5 w-full md:w-auto md:shrink-0 md:min-w-[280px]">
        {[
          { label: "Privacy inquiries", email: "privacy@offerhub.io" },
          { label: "General support", email: "support@offerhub.io" },
        ].map(({ label, email }) => (
          <a
            key={email}
            href={`mailto:${email}`}
            className="flex flex-col gap-1 rounded-2xl px-6 py-5 transition-all duration-300 shadow-neu-sunken-subtle bg-bg-elevated hover:shadow-neu-sunken group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-content-secondary">{label}</span>
            <span className="text-base font-bold text-theme-primary group-hover:text-content-primary transition-colors">
              {email}
            </span>
          </a>
        ))}
        <div className="rounded-2xl px-6 py-5 shadow-neu-raised-sm bg-bg-elevated">
          <p className="text-xs leading-relaxed font-medium text-content-secondary">
            Offer Hub Inc.
            <br />
            123 Market Street, Suite 400
            <br />
            San Francisco, CA 94105, USA
          </p>
        </div>
      </div>
    </div>
  );
}

export const MDX_PRIVACY_COMPONENTS = {
  FeaturesGrid,
  FeatureCard,
  ProcessorsGrid,
  ProcessorCard,
  ContactSection,
  DataRightsForm,
};
