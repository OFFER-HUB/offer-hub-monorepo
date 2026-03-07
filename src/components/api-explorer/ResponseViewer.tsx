"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MockResponse } from "@/data/api-schema";

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
    <div className="rounded-2xl shadow-sunken overflow-hidden" style={{ background: "#0f172a" }}>
      {/* Tab bar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex gap-1">
          {responses.map((res, i) => {
            const isActive = i === activeTab;
            const isSuccess = res.status >= 200 && res.status < 300;
            return (
              <button
                key={res.status}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-200"
                )}
                style={{
                  color: isActive
                    ? isSuccess
                      ? "#4ade80"
                      : "#f87171"
                    : "rgba(255,255,255,0.4)",
                  background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                }}
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
            "transition-all duration-200",
            copied ? "text-green-400" : "text-white/40 hover:text-white/80"
          )}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* JSON body */}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed m-0">
        <code style={{ color: "#a5f3fc", fontFamily: "ui-monospace, monospace" }}>
          {current.body}
        </code>
      </pre>
    </div>
  );
}
