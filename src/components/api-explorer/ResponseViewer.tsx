"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MockResponse } from "@/lib/openapi-parser";

interface ResponseViewerProps {
  responses: MockResponse[];
}

export function ResponseViewer({ responses }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = responses[activeTab];

  async function handleCopy() {
    await navigator.clipboard.writeText(current.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl shadow-neu-sunken overflow-hidden bg-bg-sunken">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b-0 bg-bg-base shadow-neu-sunken-subtle">
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {responses.map((res, i) => {
            const isActive = i === activeTab;
            const isSuccess = res.status >= 200 && res.status < 300;
            return (
              <button
                key={res.status}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors duration-200",
                  isActive ? "bg-bg-sunken shadow-neu-sunken" : "bg-transparent hover:bg-bg-sunken/50",
                  isActive && isSuccess ? "text-theme-success" : isActive ? "text-theme-error" : "text-content-secondary"
                )}
              >
                {res.status} {res.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy response"
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium shrink-0",
            "transition-colors duration-200",
            copied ? "text-theme-success" : "text-content-secondary hover:text-content-primary"
          )}
        >
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* JSON body */}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed m-0 text-content-primary">
        <code className="font-mono text-[13px]">
          {current.body}
        </code>
      </pre>
    </div>
  );
}
