import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { slugify } from "@/utils/slugify";
import {
  Table,
  TABLE_CELL_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/docs/ParamTable";

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
        className="text-2xl font-bold mt-16 mb-6 scroll-mt-32 tracking-tight text-content-primary"
        {...props}
      >
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
    <code className="px-2 py-0.5 rounded-xl text-[0.9em] font-mono font-semibold bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-theme-primary">
      {children}
    </code>
  ),

  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-xl bg-bg-sunken px-4 py-3 shadow-neu-sunken-subtle text-content-secondary italic">
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
      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] flex-shrink-0" />
      <span className="flex-1 font-medium">{children}</span>
    </li>
  ),

  hr: () => <hr className="my-12 border-t border-theme-border" />,

  a: ({ href, children }) => (
    <a
      href={href}
      className="font-bold underline decoration-2 underline-offset-4 decoration-theme-primary/40 hover:decoration-theme-primary transition-colors text-theme-primary"
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
    <Table label="Documentation table" caption="Documentation table">
      {children}
    </Table>
  ),
  thead: ({ children }) => <thead>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className={TABLE_ROW_CLASS}>{children}</tr>,
  th: ({ children }) => (
    <th scope="col" className={TABLE_HEAD_CLASS}>
      {children}
    </th>
  ),
  td: ({ children }) => <td className={TABLE_CELL_CLASS}>{children}</td>,
};
