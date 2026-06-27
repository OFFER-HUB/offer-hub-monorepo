import type { MDXComponents } from "mdx/types";
import { TermsSection } from "./TermsSection";

export const TERMS_MDX_COMPONENTS: MDXComponents = {
  TermsSection,

  h3: ({ children }) => (
    <h3 className="text-lg font-black text-content-primary tracking-tight mt-8 first:mt-0 mb-4">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <p className="text-base font-medium leading-relaxed text-content-secondary [&:not(:first-child)]:mt-6">
      {children}
    </p>
  ),

  ul: ({ children }) => (
    <ul className="space-y-4 mt-4">{children}</ul>
  ),

  li: ({ children }) => (
    <li className="flex items-start gap-4 text-sm font-medium text-content-primary">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-theme-primary shrink-0" />
      <span>{children}</span>
    </li>
  ),

  strong: ({ children }) => (
    <strong className="font-extrabold text-content-primary">{children}</strong>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      className="font-bold text-theme-primary hover:text-content-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
};
