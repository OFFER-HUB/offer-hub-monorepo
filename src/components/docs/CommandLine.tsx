"use client";

import { useState, ReactNode } from "react";
import { Check, Copy, Terminal } from "lucide-react";

import { cn } from "@/lib/cn";

interface CommandLineProps {
  command?: string;
  label?: string;
  promptSymbol?: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Recursively extract text content from React children.
 * This handles MDX transformations that may convert URLs or text into React elements.
 */
function extractTextFromChildren(children: ReactNode): string {
  if (children === null || children === undefined) {
    return "";
  }

  if (typeof children === "string") {
    return children;
  }

  if (typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }

  // Handle React elements (e.g., <a> tags from MDX URL processing)
  if (typeof children === "object" && "props" in children) {
    const element = children as { props?: { children?: ReactNode; href?: string } };
    // For anchor tags, prefer href as it contains the actual URL
    if (element.props?.href && !element.props?.children) {
      return element.props.href;
    }
    return extractTextFromChildren(element.props?.children);
  }

  return "";
}

export function CommandLine({
  command,
  label,
  promptSymbol = "$",
  className,
  children,
}: CommandLineProps) {
  const [copied, setCopied] = useState(false);

  const raw = command ?? extractTextFromChildren(children);
  const trimmed = raw.trim();

  async function handleCopy() {
    await navigator.clipboard.writeText(trimmed);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className={cn(
        "my-6 rounded-2xl overflow-hidden bg-bg-base relative z-10",
        className,
      )}
      style={{
        boxShadow: "6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light)",
      }}
    >
      {/* Terminal header bar */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b border-theme-border/20"
        style={{
          background: "var(--color-bg-sunken)",
          boxShadow: "inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)",
        }}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
        {label && (
          <span className="ml-2 text-[11px] font-bold uppercase tracking-widest text-content-secondary/60">
            {label}
          </span>
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Command copied" : "Copy command"}
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium",
            "transition-colors duration-200",
            copied
              ? "text-green-500"
              : "text-content-secondary hover:text-content-primary",
          )}
        >
          {copied ? (
            <Check size={12} aria-hidden="true" />
          ) : (
            <Copy size={12} aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Command row */}
      <div className="flex items-center gap-3 px-5 py-4 bg-bg-base">
        <Terminal size={14} className="flex-shrink-0 text-theme-primary" aria-hidden="true" />
        <span className="text-sm text-theme-primary flex-shrink-0 font-mono font-bold">
          {promptSymbol}
        </span>
        <div className="relative flex-1 overflow-x-auto">
          <code className="block whitespace-nowrap text-sm text-content-primary font-mono pr-2">
            {trimmed}
          </code>
        </div>
      </div>
    </div>
  );
}
