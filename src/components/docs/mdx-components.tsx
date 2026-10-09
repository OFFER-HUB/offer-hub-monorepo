import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactElement } from "react";
import { cn } from "@/lib/cn";
import { MethodBadge } from "@/components/api-explorer/MethodBadge";
import { CodeBlock } from "./CodeBlock";
import { CodeTabs } from "./CodeTabs";
import { Callout } from "./Callout";
import { CommandLine } from "./CommandLine";
import { Badge } from "./Badge";
import { Endpoint } from "./Endpoint";
import { Steps } from "./Steps";
import { LinkCard } from "./LinkCard";
import { MermaidDiagram } from "@/components/shared/MermaidDiagram";
import { ParamTable } from "./ParamTable";
import { ResponseSchema } from "./ResponseSchema";
import { BASE_MDX_COMPONENTS } from "@/components/mdx/base-mdx-components";

function DocsMethodBadge({ className, ...props }: ComponentProps<typeof MethodBadge>) {
  return (
    <MethodBadge
      {...props}
      className={cn(
        "justify-center px-2.5 py-1 text-[10px] font-black uppercase leading-none tracking-[0.16em] shadow-neu-raised-sm",
        className,
      )}
    />
  );
}

export const MDX_COMPONENTS: MDXComponents = {
  ...BASE_MDX_COMPONENTS,

  // Custom doc components (used directly in .mdx files)
  CodeBlock,
  CodeTabs,
  Callout,
  CommandLine,
  Badge,
  MethodBadge: DocsMethodBadge,
  Endpoint,
  Steps,
  LinkCard,
  MermaidDiagram,
  ParamTable,
  ResponseSchema,

  // Blockquote → Callout note (docs-specific override of base)
  blockquote: ({ children }) => <Callout type="note">{children}</Callout>,

  // Fenced code block — pre wraps code; mermaid → MermaidDiagram
  pre: ({ children }) => {
    const codeEl = children as ReactElement<{
      className?: string;
      children?: string;
    }>;
    const lang =
      codeEl?.props?.className?.replace("language-", "") ?? undefined;
    const code = codeEl?.props?.children ?? "";

    if (lang === "mermaid") {
      return <MermaidDiagram chart={code} variant="framed" />;
    }

    return <CodeBlock language={lang}>{code}</CodeBlock>;
  },
};
