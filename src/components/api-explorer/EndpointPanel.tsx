"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ApiEndpoint } from "@/data/api-schema";
import { MethodBadge } from "./MethodBadge";
import { ParameterInput } from "./ParameterInput";
import { ResponseViewer } from "./ResponseViewer";
import { Textarea } from "@/components/ui/Textarea";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

interface EndpointPanelProps {
  endpoint: ApiEndpoint;
}

export function EndpointPanel({ endpoint }: EndpointPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyValue, setBodyValue] = useState(endpoint.requestBody?.example ?? "");
  const [loading, setLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, showResponse]);

  // Build the full URL from params
  const buildUrl = useCallback(() => {
    let url = `${BASE_URL}${endpoint.path}`;

    if (endpoint.pathParams) {
      for (const param of endpoint.pathParams) {
        const val = pathValues[param.name];
        if (val) url = url.replace(`{${param.name}}`, encodeURIComponent(val));
      }
    }

    if (endpoint.queryParams) {
      const parts: string[] = [];
      for (const param of endpoint.queryParams) {
        const val = queryValues[param.name];
        if (val) parts.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(val)}`);
      }
      if (parts.length > 0) url += `?${parts.join("&")}`;
    }

    return url;
  }, [endpoint, pathValues, queryValues]);

  async function handleTryIt() {
    setLoading(true);
    setShowResponse(false);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setShowResponse(true);
  }

  const hasParams =
    (endpoint.pathParams && endpoint.pathParams.length > 0) ||
    (endpoint.queryParams && endpoint.queryParams.length > 0) ||
    endpoint.requestBody;

  return (
    <div
      className="rounded-2xl overflow-hidden bg-bg-base shadow-neu-raised relative z-10"
    >
      {/* ── Header button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-5 py-4 text-left transition-[background-color,box-shadow] duration-200",
          isOpen
            ? "bg-bg-sunken shadow-neu-sunken-subtle"
            : "bg-bg-base hover:bg-bg-sunken/50",
        )}
      >
        <MethodBadge method={endpoint.method} />
        <span className="text-sm font-mono font-semibold text-content-primary">
          {endpoint.path}
        </span>
        <span className="text-sm hidden sm:inline text-content-secondary">
          {endpoint.title}
        </span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            "ml-auto flex-shrink-0 text-content-secondary transition-transform duration-300 ease-out",
            isOpen && "rotate-0",
            !isOpen && "-rotate-90",
          )}
        />
      </button>

      {/* ── Expandable body ── */}
      <div
        className="overflow-hidden transition-[height,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ height: isOpen ? contentHeight : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div
          ref={contentRef}
          className="px-5 pb-6 pt-4 space-y-5 border-t border-theme-border/20"
        >
          {/* Description */}
          <p className="text-sm text-content-secondary leading-relaxed">
            {endpoint.description}
          </p>

          {/* Parameters */}
          {hasParams && (
            <div className="space-y-4">
              {endpoint.pathParams && endpoint.pathParams.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-theme-primary">
                    Path Parameters
                  </h4>
                  {endpoint.pathParams.map((param) => (
                    <ParameterInput
                      key={param.name}
                      {...param}
                      value={pathValues[param.name] ?? ""}
                      onChange={(v) => setPathValues((prev) => ({ ...prev, [param.name]: v }))}
                    />
                  ))}
                </div>
              )}

              {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-theme-primary">
                    Query Parameters
                  </h4>
                  {endpoint.queryParams.map((param) => (
                    <ParameterInput
                      key={param.name}
                      {...param}
                      value={queryValues[param.name] ?? ""}
                      onChange={(v) => setQueryValues((prev) => ({ ...prev, [param.name]: v }))}
                    />
                  ))}
                </div>
              )}

              {endpoint.requestBody && (
                <div className="space-y-2">
                  <Textarea
                    id={`request-body-${endpoint.path}`}
                    label="Request body"
                    labelClassName="text-[11px] font-black uppercase tracking-widest text-theme-primary"
                    value={bodyValue}
                    onChange={(e) => setBodyValue(e.target.value)}
                    rows={Math.min(bodyValue.split("\n").length + 1, 12)}
                    className="text-sm font-mono resize-y"
                  />
                  <p className="text-xs text-content-secondary">
                    {endpoint.requestBody.contentType}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Request URL */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-theme-primary">
              Request URL
            </h4>
            <div
              className="rounded-xl px-4 py-2 text-sm font-mono break-all text-theme-primary bg-bg-sunken shadow-neu-sunken-subtle"
            >
              <span className="text-content-secondary mr-1">{endpoint.method}</span>
              {buildUrl()}
            </div>
          </div>

          {/* Try it */}
          <button
            onClick={handleTryIt}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white btn-neumorphic-primary disabled:opacity-60 disabled:cursor-not-allowed transition-[background-color,box-shadow,transform,opacity] duration-200"
          >
            {loading ? <Loader2 size={16} aria-hidden="true" className="animate-spin" /> : <Play size={16} aria-hidden="true" />}
            {loading ? "Sending..." : "Try it"}
          </button>

          {/* Response */}
          {showResponse && <ResponseViewer responses={endpoint.responses} />}
        </div>
      </div>
    </div>
  );
}
