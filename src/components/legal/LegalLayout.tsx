"use client";

import { useEffect, useState, type ReactNode } from "react";
export { legalSlug } from "./legalSlug";

export interface LegalSectionLink {
  id: string;
  label: string;
}

function LegalToc({ sections, mobile = false }: { sections: LegalSectionLink[]; mobile?: boolean }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-15% 0px -70% 0px" });
    sections.forEach(({ id }) => {
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    });
    return () => observer.disconnect();
  }, [sections]);

  return <nav aria-label="Table of contents" className={mobile ? "mt-2 flex flex-col" : "sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto flex flex-col rounded-2xl bg-bg-elevated p-4 shadow-neu-raised"}>
    {!mobile && <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-content-secondary">On this page</p>}
    {sections.map((section) => <a key={section.id} aria-current={active === section.id ? "location" : undefined} className={`flex min-h-11 items-center rounded-xl px-3 text-sm focus-visible:outline-2 focus-visible:outline-theme-primary ${active === section.id ? "bg-bg-sunken text-content-primary" : "text-content-secondary hover:text-theme-primary"}`} href={`#${section.id}`}>{section.label}</a>)}
  </nav>;
}

export function LegalLayout({
  eyebrow,
  title,
  updated,
  description,
  sections,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  updated: string;
  description?: ReactNode;
  sections: LegalSectionLink[];
  children: ReactNode;
}) {
  return (
    <main className="flex-grow px-4 pb-20 pt-24 sm:px-8 md:px-12 md:pt-32 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-12 max-w-[70ch] text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-theme-primary">{eyebrow}</p>
          <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-content-primary">{title}</h1>
          {description && <p className="text-base leading-relaxed text-content-secondary">{description}</p>}
          <p className="mt-5 inline-flex min-h-11 items-center rounded-full bg-bg-elevated px-4 text-sm text-content-secondary shadow-neu-raised-sm">
            Last updated: <span className="ml-1 font-semibold text-theme-primary">{updated}</span>
          </p>
        </header>
        {sections.length > 0 && <details className="mb-8 rounded-xl bg-bg-elevated p-4 shadow-neu-raised lg:hidden">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-content-primary">On this page</summary>
          <LegalToc sections={sections} mobile />
        </details>}
        <div className={`grid grid-cols-1 gap-10 lg:justify-center ${sections.length > 0 ? "lg:grid-cols-[220px_minmax(0,70ch)]" : "max-w-[70ch] mx-auto"}`}>
          {sections.length > 0 && <aside className="hidden lg:block">
            <LegalToc sections={sections} />
          </aside>}
          <div className="min-w-0 max-w-[70ch] space-y-12">{children}</div>
        </div>
      </div>
    </main>
  );
}
