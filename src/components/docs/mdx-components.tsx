import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "./CodeBlock";
import { Callout } from "./Callout";
import { CommandLine } from "./CommandLine";
import { Badge } from "./Badge";
import { MermaidDiagram } from "./MermaidDiagram";

export const MDX_COMPONENTS: MDXComponents = {
  // ── Custom doc components (used directly in .mdx files) ──
  CodeBlock,
  Callout,
  CommandLine,
  Badge,
  MermaidDiagram,

  // ── Prose element overrides ──

  // Headings — add id for TOC anchor linking
  h2: ({ children, ...props }) => {
    const text = String(children ?? "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return (
      <h2
        id={id}
        className="text-2xl font-black mt-16 mb-6 scroll-mt-32 flex items-center gap-3 tracking-tight"
        style={{ color: "#19213D" }}
        {...props}
      >
        <span className="w-1 h-6 rounded-full bg-[#149A9B]" />
        {children}
      </h2>
    );
  },

  h3: ({ children, ...props }) => {
    const text = String(children ?? "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return (
      <h3
        id={id}
        className="text-xl font-extrabold mt-10 mb-4 scroll-mt-32 tracking-tight"
        style={{ color: "#19213D" }}
        {...props}
      >
        {children}
      </h3>
    );
  },

  // Paragraph
  p: ({ children }) => (
    <p className="leading-[1.8] mb-6 text-base font-medium" style={{ color: "#4B5563" }}>
      {children}
    </p>
  ),

  // Inline code
  code: ({ children }) => (
    <code
      className="px-2 py-0.5 rounded-lg text-[0.9em] font-mono font-semibold"
      style={{ background: "#E5E7EB", color: "#149A9B", border: "1px solid rgba(20,154,155,0.1)" }}
    >
      {children}
    </code>
  ),

  // Fenced code block — pre wraps code
  pre: ({ children }) => {
    // children is a <code> element; extract text and language
    const codeEl = children as React.ReactElement<{ className?: string; children?: string }>;
    const lang = codeEl?.props?.className?.replace("language-", "") ?? undefined;
    const code = codeEl?.props?.children ?? "";

    // Handle mermaid diagrams specially
    if (lang === "mermaid") {
      return <MermaidDiagram chart={code} />;
    }

    return <CodeBlock language={lang}>{code}</CodeBlock>;
  },

  // Blockquote → Callout note
  blockquote: ({ children }) => <Callout type="note">{children}</Callout>,

  // Unordered list
  ul: ({ children }) => (
    <ul className="list-none space-y-3 mb-8 pl-1" style={{ color: "#4B5563" }}>
      {children}
    </ul>
  ),

  // Ordered list
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-3 mb-8 pl-1 font-medium" style={{ color: "#4B5563" }}>
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="leading-relaxed flex items-start gap-2.5">
      <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#149A9B]/30 flex-shrink-0" />
      <span className="flex-1 font-medium">{children}</span>
    </li>
  ),

  // Horizontal rule
  hr: () => (
    <hr className="my-12 border-t" style={{ borderColor: "#E5E7EB" }} />
  ),

  // Links
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-bold underline decoration-2 underline-offset-4 decoration-[#149A9B]/30 hover:decoration-[#149A9B] transition-all"
      style={{ color: "#149A9B" }}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),

  // Strong
  strong: ({ children }) => (
    <strong className="font-extrabold" style={{ color: "#19213D" }}>
      {children}
    </strong>
  ),

  // Tables
  table: ({ children }) => (
    <div className="my-10 w-full overflow-hidden rounded-3xl border border-[#D1D5DB]/30 shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[14px]">
          {children}
        </table>
      </div>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#F9FAFB] border-b border-[#D1D5DB]/40">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-[#D1D5DB]/20">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="group hover:bg-[#149A9B]/[0.02] transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-8 py-5 font-black uppercase tracking-[0.1em] text-[10.5px] text-[#6D758F]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-8 py-5 text-[#19213D] font-medium leading-relaxed">
      {children}
    </td>
  ),
};
