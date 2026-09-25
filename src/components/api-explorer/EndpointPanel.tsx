"use client";

import { useState, useCallback, useRef, useEffect, useId } from "react";
import { ChevronDown, Play, Loader2, ShieldCheck, FileCode } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ApiEndpoint } from "@/data/api-schema";
import { MethodBadge } from "./MethodBadge";
import { ParameterInput } from "./ParameterInput";
import { ResponseViewer } from "./ResponseViewer";

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

  const panelId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const headerId = `endpoint-header-${endpoint.method}-${panelId}`;
  const sectionId = `endpoint-section-${endpoint.method}-${panelId}`;
  const bodyInputId = `body-input-${endpoint.method}-${panelId}`;

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, showResponse, bodyValue, pathValues, queryValues]);

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
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setShowResponse(true);
  }

  const hasParams =
    (endpoint.pathParams && endpoint.pathParams.length > 0) ||
    (endpoint.queryParams && endpoint.queryParams.length > 0) ||
    endpoint.requestBody;

  return (
    <div className="rounded-2xl overflow-hidden bg-bg-base shadow-neu-raised relative z-10 transition-all duration-200">
      {/* ── Header button ── */}
      <button
        id={headerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={sectionId}
        aria-label={`${endpoint.method} ${endpoint.path} - ${endpoint.title}`}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary",
          isOpen ? "bg-bg-sunken shadow-neu-sunken-subtle" : "bg-bg-base hover:bg-bg-sunken/40"
        )}
      >
        <MethodBadge method={endpoint.method} />
        <span className="text-sm font-mono font-bold text-content-primary">
          {endpoint.path}
        </span>
        <span className="text-sm hidden md:inline text-content-secondary truncate max-w-sm">
          {endpoint.title}
        </span>

        <div className="ml-auto flex items-center gap-2">
          {endpoint.scope && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-elevated text-theme-primary shadow-neu-raised-sm">
              <ShieldCheck size={11} aria-hidden="true" /> {endpoint.scope}
            </span>
          )}
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(
              "flex-shrink-0 text-content-secondary transition-transform duration-300 ease-out",
              isOpen ? "rotate-0" : "-rotate-90"
            )}
          />
        </div>
      </button>

      {/* ── Expandable body ── */}
      <div
        id={sectionId}
        role="region"
        aria-labelledby={headerId}
        className="overflow-hidden transition-[height,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ height: isOpen ? contentHeight : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div
          ref={contentRef}
          className="px-5 pb-6 pt-4 space-y-5 border-t border-theme-border/20"
        >
          {/* Metadata info */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-content-secondary leading-relaxed max-w-2xl">
              {endpoint.description}
            </p>
            {endpoint.sourceController && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-content-secondary bg-bg-sunken shadow-neu-sunken-subtle">
                <FileCode size={13} className="text-theme-primary" aria-hidden="true" />
                {endpoint.sourceController}
              </span>
            )}
          </div>

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
                  <label htmlFor={bodyInputId} className="block text-[11px] font-black uppercase tracking-widest text-theme-primary">
                    Request Body{" "}
                    <span className="ml-2 font-normal normal-case tracking-normal text-content-secondary">
                      {endpoint.requestBody.contentType}
                    </span>
                  </label>
                  <textarea
                    id={bodyInputId}
                    aria-label={`Request body JSON for ${endpoint.method} ${endpoint.path}`}
                    value={bodyValue}
                    onChange={(e) => setBodyValue(e.target.value)}
                    rows={Math.min(bodyValue.split("\n").length + 1, 12)}
                    className="w-full rounded-xl px-4 py-3 text-sm font-mono text-content-primary bg-bg-sunken shadow-neu-sunken outline-none resize-y transition-all border border-transparent focus:ring-2 focus:ring-theme-primary"
                  />
                </div>
              )}
            </div>
          )}

          {/* Request URL */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-theme-primary">
              Request URL
            </h4>
            <div className="rounded-xl px-4 py-2.5 text-sm font-mono break-all text-theme-primary bg-bg-sunken shadow-neu-sunken-subtle">
              <span className="text-content-secondary mr-2 font-bold">{endpoint.method}</span>
              {buildUrl()}
            </div>
          </div>

          {/* Try it action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={`Send test request to ${endpoint.method} ${endpoint.path}`}
              onClick={handleTryIt}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-theme-primary hover:bg-theme-primary-hover shadow-neu-raised hover:shadow-neu-raised-sm active:shadow-neu-sunken transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            >
              {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              {loading ? "Simulating..." : "Send Request"}
            </button>
            <span className="text-xs text-content-secondary">
              Simulates live request against OpenAPI 3.0 mock responder
            </span>
          </div>

          {/* Response */}
          {showResponse && <ResponseViewer responses={endpoint.responses} />}
        </div>
      </div>
    </div>
  );
}
