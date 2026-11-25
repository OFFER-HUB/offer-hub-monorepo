"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CodeBlock } from "./CodeBlock";

interface CommandLineProps {
  command?: string;
  label?: string;
  title?: string;
  promptSymbol?: string;
  className?: string;
  children?: ReactNode;
}

/** Extracts text from MDX-transformed children (URLs may become anchors). */
function extractTextFromChildren(children: ReactNode): string {
  if (children === null || children === undefined) return "";
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join("");
  if (typeof children === "object" && "props" in children) {
    const element = children as { props?: { children?: ReactNode; href?: string } };
    if (element.props?.href && !element.props?.children) return element.props.href;
    return extractTextFromChildren(element.props?.children);
  }
  return "";
}

/** Terminal mode of the shared CodeBlock. */
export function CommandLine({
  command,
  label,
  title,
  promptSymbol = "$",
  className,
  children,
}: CommandLineProps) {
  const trimmed = (command ?? extractTextFromChildren(children)).trim();

  return (
    <CodeBlock
      code={trimmed}
      copyText={trimmed}
      terminal
      title={title ?? label}
      promptSymbol={promptSymbol}
      dense
      className={cn("my-6", className)}
    />
  );
}
