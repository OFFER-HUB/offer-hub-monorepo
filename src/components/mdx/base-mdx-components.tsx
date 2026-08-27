import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { slugify } from "@/utils/slugify";

function headingId(children: ReactNode): string {
  return slugify(String(children ?? ""));
}

/**
 * Shared prose overrides for docs / privacy / terms MDX maps.
 * Contexts spread this and layer custom components on top.
 */
export const BASE_MDX_COMPONENTS: MDXComponents = {
  h2: ({ children, ...props }) => {
    const id = headingId(children);
    return (
      <h2
        id={id}
        className="text-2xl font-black mt-16 mb-6 scroll-mt-32 flex items-center gap-3 tracking-tight text-content-primary"
        {...props}
      >
        <span className="w-1 h-6 rounded-full bg-[#149A9B]" />
        {children}
      </h2>
    );
  },

  h3: ({ children, ...props }) => {
    const id = headingId(children);
    return (
      <h3
        id={id}
        className="text-xl font-extrabold mt-10 mb-4 scroll-mt-32 tracking-tight text-content-primary"
        {...props}
      >
        {children}
      </h3>
    );
  },

  p: ({ children }) => (
    <p className="leading-[1.8] mb-6 text-base font-medium text-content-secondary">{children}</p>
  ),

  code: ({ children }) => (
    <code className="px-2 py-0.5 rounded-lg text-[0.9em] font-mono font-semibold bg-theme-primary/10 text-theme-primary border border-theme-primary/10">
      {children}
    </code>
  ),

  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-theme-primary/40 pl-4 text-content-secondary italic">
      {children}
    </blockquote>
  ),

  ul: ({ children }) => (
    <ul className="list-none space-y-3 mb-8 pl-1 text-content-secondary">{children}</ul>
  ),

  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-3 mb-8 pl-1 font-medium text-content-secondary">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="leading-relaxed flex items-start gap-2.5">
      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#149A9B]/30 flex-shrink-0" />
      <span className="flex-1 font-medium">{children}</span>
    </li>
  ),

  hr: () => <hr className="my-12 border-t border-theme-border/30" />,

  a: ({ href, children }) => (
    <a
      href={href}
      className="font-bold underline decoration-2 underline-offset-4 decoration-theme-primary/40 hover:decoration-theme-primary transition-all text-theme-primary"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  strong: ({ children }) => (
    <strong className="font-extrabold text-content-primary">{children}</strong>
  ),

  table: ({ children }) => (
    <div className="neu-table-wrap my-10 w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">{children}</table>
      </div>
    </div>
  ),
  thead: ({ children }) => <thead className="neu-table-head">{children}</thead>,
  tbody: ({ children }) => <tbody className="neu-table-body bg-bg-base">{children}</tbody>,
  tr: ({ children }) => <tr className="neu-table-row">{children}</tr>,
  th: ({ children }) => (
    <th className="px-6 py-4 font-black uppercase tracking-[0.12em] text-[11px] text-theme-primary whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-6 py-4 text-content-primary font-medium leading-relaxed text-sm border-0">
      {children}
    </td>
  ),
};
