import type { MDXComponents } from "mdx/types";
import type { ReactElement } from "react";
import { CodeBlock } from "./CodeBlock";
import { CodeTabs } from "./CodeTabs";
import { Callout } from "./Callout";
import { CommandLine } from "./CommandLine";
import { Badge } from "./Badge";
import { MermaidDiagram } from "@/components/shared/MermaidDiagram";
import { ParamTable } from "./ParamTable";
import { ResponseSchema } from "./ResponseSchema";
import { BASE_MDX_COMPONENTS } from "@/components/mdx/base-mdx-components";

export const MDX_COMPONENTS: MDXComponents = {
  ...BASE_MDX_COMPONENTS,

  // Custom doc components (used directly in .mdx files)
  CodeBlock,
  CodeTabs,
  Callout,
  CommandLine,
  Badge,
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
