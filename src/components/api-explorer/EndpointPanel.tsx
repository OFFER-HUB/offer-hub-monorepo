"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, Play, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/cn";
import type { OpenApiOperationSpec, OpenApiMediaType } from "@/lib/openapi";
import { MethodBadge } from "./MethodBadge";
import { ParameterInput } from "./ParameterInput";
import { ResponseViewer, type ResponseTab } from "./ResponseViewer";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";

interface EndpointPanelProps {
  operation: OpenApiOperationSpec;
  baseUrl: string;
  bearerToken: string;
}

interface LiveResult {
  ok: boolean;
  status?: number;
  statusText?: string;
  durationMs: number;
  body?: string;
  error?: string;
}

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH"]);

function exampleBody(media: OpenApiMediaType | undefined): string {
  if (!media) return "(no example body)";
  if (media.example !== undefined) {
    return typeof media.example === "string" ? media.example : JSON.stringify(media.example, null, 2);
  }
  if (media.examples) {
    const first = Object.values(media.examples)[0];
    if (first) return typeof first.value === "string" ? first.value : JSON.stringify(first.value, null, 2);
  }
  return "(no example body)";
}

function formatResponseText(text: string): string {
  if (!text) return "";
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text;
  }
}

export function EndpointPanel({ operation, baseUrl, bearerToken }: EndpointPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pathValues, setPathValues] = useState<Record<string, string>>({});
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [bodyValue, setBodyValue] = useState(() => exampleBody(operation.requestBody?.content));
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveResult, setLiveResult] = useState<LiveResult | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const pathParams = operation.parameters.filter((p) => p.in === "path");
  const queryParams = operation.parameters.filter((p) => p.in === "query");
  const isStreaming = operation.responses.some((r) => r.contentType === "text/event-stream");
  const isMutating = MUTATING_METHODS.has(operation.method);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, liveResult]);

  const buildUrl = useCallback(() => {
    let url = `${baseUrl}${operation.path}`;
    for (const param of pathParams) {
      const val = pathValues[param.name];
      if (val) url = url.replace(`{${param.name}}`, encodeURIComponent(val));
    }
    const parts: string[] = [];
    for (const param of queryParams) {
      const val = queryValues[param.name];
      if (val) parts.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(val)}`);
    }
    if (parts.length > 0) url += `?${parts.join("&")}`;
    return url;
  }, [baseUrl, operation.path, pathParams, queryParams, pathValues, queryValues]);

  async function handleTryIt() {
    setLoading(true);
    setLiveResult(null);
    const start = performance.now();
    const headers: Record<string, string> = {};
    if (bearerToken.trim()) headers.Authorization = `Bearer ${bearerToken.trim()}`;
    if (operation.requestBody) headers["Content-Type"] = operation.requestBody.contentType;
    if (isMutating && idempotencyKey.trim()) headers["Idempotency-Key"] = idempotencyKey.trim();

    try {
      const res = await fetch(buildUrl(), {
        method: operation.method,
        headers,
        body: operation.requestBody && bodyValue.trim() ? bodyValue : undefined,
      });
      const text = await res.text();
      setLiveResult({
        ok: true,
        status: res.status,
        statusText: res.statusText,
        durationMs: Math.round(performance.now() - start),
        body: formatResponseText(text),
      });
    } catch (err) {
      setLiveResult({
        ok: false,
        durationMs: Math.round(performance.now() - start),
        error:
          err instanceof Error
            ? `${err.message} — if the base URL is a remote orchestrator, confirm it allows CORS from this page, and that this site's Content-Security-Policy connect-src permits it (only the configured NEXT_PUBLIC_API_BASE_URL is allowed in production by default).`
            : "Request failed.",
      });
    } finally {
      setLoading(false);
    }
  }

  const exampleResponses: ResponseTab[] = operation.responses.map((r) => ({
    status: r.status,
    label: r.description.length > 40 ? `${r.description.slice(0, 40)}…` : r.description,
    body: exampleBody(r.content),
  }));

  const hasParams = pathParams.length > 0 || queryParams.length > 0 || !!operation.requestBody;

  return (
    <div className="rounded-2xl overflow-hidden bg-bg-base shadow-neu-raised relative z-10">
      {/* Header button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-5 py-4 text-left transition-[background-color,box-shadow] duration-200",
          isOpen ? "bg-bg-sunken shadow-neu-sunken-subtle" : "bg-bg-base hover:bg-bg-sunken/50",
        )}
      >
        <MethodBadge method={operation.method} />
        <span className="text-sm font-mono font-semibold text-content-primary">{operation.path}</span>
        <span className="text-sm hidden sm:inline text-content-secondary">{operation.summary}</span>
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

      {/* Expandable body */}
      <div
        className="overflow-hidden transition-[height,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ height: isOpen ? contentHeight : 0, opacity: isOpen ? 1 : 0 }}
      >
        <div ref={contentRef} className="px-5 pb-6 pt-4 space-y-5 border-t border-theme-border/20">
          <p className="text-sm text-content-secondary leading-relaxed">{operation.description}</p>

          {operation.security.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {operation.security.map((s) => (
                <span
                  key={s.scheme}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide text-theme-primary bg-theme-primary/10"
                >
                  {s.scopes.length > 0 ? `${s.scopes.join(" / ")} scope` : "Authenticated"}
                </span>
              ))}
            </div>
          )}

          {hasParams && (
            <div className="space-y-4">
              {pathParams.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-theme-primary">
                    Path Parameters
                  </h4>
                  {pathParams.map((param) => (
                    <ParameterInput
                      key={param.name}
                      idPrefix={operation.operationId}
                      name={param.name}
                      type={param.schema.enum ? "select" : param.schema.type === "number" ? "number" : "string"}
                      required={param.required}
                      description={param.description}
                      options={param.schema.enum}
                      value={pathValues[param.name] ?? ""}
                      onChange={(v) => setPathValues((prev) => ({ ...prev, [param.name]: v }))}
                    />
                  ))}
                </div>
              )}

              {queryParams.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-theme-primary">
                    Query Parameters
                  </h4>
                  {queryParams.map((param) => (
                    <ParameterInput
                      key={param.name}
                      idPrefix={operation.operationId}
                      name={param.name}
                      type={param.schema.enum ? "select" : param.schema.type === "number" ? "number" : "string"}
                      required={param.required}
                      description={param.description}
                      options={param.schema.enum}
                      value={queryValues[param.name] ?? ""}
                      onChange={(v) => setQueryValues((prev) => ({ ...prev, [param.name]: v }))}
                    />
                  ))}
                </div>
              )}

              {operation.requestBody && (
                <div className="space-y-2">
                  <Textarea
                    id={`request-body-${operation.operationId}`}
                    label="Request body"
                    labelClassName="text-[11px] font-black uppercase tracking-widest text-theme-primary"
                    value={bodyValue}
                    onChange={(e) => setBodyValue(e.target.value)}
                    rows={Math.min(bodyValue.split("\n").length + 1, 12)}
                    className="text-sm font-mono resize-y"
                  />
                  <p className="text-xs text-content-secondary">{operation.requestBody.contentType}</p>
                </div>
              )}

              {isMutating && (
                <div className="space-y-1.5">
                  <label
                    htmlFor={`idem-${operation.operationId}`}
                    className="block text-[11px] font-black uppercase tracking-widest text-theme-primary"
                  >
                    Idempotency-Key (optional)
                  </label>
                  <Input
                    id={`idem-${operation.operationId}`}
                    hideWrapper
                    value={idempotencyKey}
                    onChange={(e) => setIdempotencyKey(e.target.value)}
                    placeholder="UUID v4"
                    className="font-mono text-sm"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setIdempotencyKey(crypto.randomUUID())}
                        className="text-xs font-semibold text-theme-primary hover:text-theme-primary-hover"
                      >
                        Generate
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Request URL */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-theme-primary">Request URL</h4>
            <div className="rounded-xl px-4 py-2 text-sm font-mono break-all text-theme-primary bg-bg-sunken shadow-neu-sunken-subtle">
              <span className="text-content-secondary mr-1">{operation.method}</span>
              {buildUrl()}
            </div>
          </div>

          {/* Try it */}
          {isStreaming ? (
            <div className="rounded-xl px-4 py-3 text-sm bg-bg-sunken shadow-neu-sunken-subtle text-content-secondary">
              This endpoint streams Server-Sent Events and doesn&apos;t fit a one-shot request. Try it with curl:
              <pre className="mt-2 overflow-x-auto text-xs font-mono text-content-primary">
                {`curl -N "${buildUrl()}"${bearerToken.trim() ? ` -H "Authorization: Bearer ${bearerToken.trim()}"` : ""}`}
              </pre>
            </div>
          ) : (
            <button
              onClick={handleTryIt}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white btn-neumorphic-primary disabled:opacity-60 disabled:cursor-not-allowed transition-[background-color,box-shadow,transform,opacity] duration-200"
            >
              {loading ? (
                <Loader2 size={16} aria-hidden="true" className="animate-spin" />
              ) : (
                <Play size={16} aria-hidden="true" />
              )}
              {loading ? "Sending..." : "Try it"}
            </button>
          )}

          {/* Live result */}
          {liveResult && (
            <div className="space-y-1.5">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-theme-primary">Live Response</h4>
              {liveResult.ok ? (
                <div className="rounded-2xl overflow-hidden shadow-neu-sunken bg-bg-sunken">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-theme-border/20">
                    <span
                      className={cn(
                        "text-xs font-mono font-semibold",
                        (liveResult.status ?? 0) < 400 ? "text-theme-success" : "text-theme-error",
                      )}
                    >
                      {liveResult.status} {liveResult.statusText}
                    </span>
                    <span className="text-xs text-content-muted">{liveResult.durationMs}ms</span>
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm leading-relaxed m-0">
                    <code className="text-content-primary font-mono">{liveResult.body || "(empty body)"}</code>
                  </pre>
                </div>
              ) : (
                <div className="rounded-xl px-4 py-3 text-sm bg-theme-error/10 text-theme-error flex items-start gap-2">
                  <AlertTriangle size={16} aria-hidden="true" className="mt-0.5 flex-shrink-0" />
                  <span>{liveResult.error}</span>
                </div>
              )}
            </div>
          )}

          {/* Example response from the spec */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-theme-primary">
              Example Response
            </h4>
            <ResponseViewer responses={exampleResponses} />
          </div>
        </div>
      </div>
    </div>
  );
}
