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
        "my-4 rounded-xl border border-white/10 bg-[#0f172a] text-sm font-mono text-slate-100",
        className,
      )}
    >
      {label && (
        <div className="flex items-center justify-between px-4 pt-3 pb-1 text-xs text-slate-300">
          <span>{label}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Terminal
            size={14}
            className="flex-shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="text-sm text-primary flex-shrink-0">
            {promptSymbol}
          </span>
          <div className="relative flex-1 overflow-x-auto">
            <code className="block whitespace-nowrap text-sm text-slate-100 pr-2">
              {trimmed}
            </code>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Command copied" : "Copy command"}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0",
            "transition-all duration-200",
            copied ? "text-emerald-400" : "text-slate-300 hover:text-slate-50",
          )}
        >
          {copied ? (
            <Check size={13} aria-hidden="true" />
          ) : (
            <Copy size={13} aria-hidden="true" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}
