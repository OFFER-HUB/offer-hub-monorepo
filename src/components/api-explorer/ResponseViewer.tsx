"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface ResponseTab {
  status: string;
  label: string;
  body: string;
}

interface ResponseViewerProps {
  responses: ResponseTab[];
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
      <div className="flex items-center justify-between px-4 py-2 border-b border-theme-border/20">
        <div className="flex flex-wrap gap-1">
          {responses.map((res, i) => {
            const isActive = i === activeTab;
            const statusNum = Number.parseInt(res.status, 10);
            const isSuccess = statusNum >= 200 && statusNum < 400;
            return (
              <button
                key={`${res.status}-${i}`}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-mono font-medium transition-colors duration-200",
                  isActive && isSuccess && "text-theme-success bg-theme-success/10",
                  isActive && !isSuccess && "text-theme-error bg-theme-error/10",
                  !isActive && "text-content-muted hover:text-content-secondary",
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
            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium",
            "transition-colors duration-200",
            copied ? "text-theme-success" : "text-content-muted hover:text-content-secondary",
          )}
        >
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Body */}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed m-0">
        <code className="text-content-primary font-mono">{current.body}</code>
      </pre>
    </div>
  );
}
