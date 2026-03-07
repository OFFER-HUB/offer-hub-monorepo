"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChevronDown, Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ApiEndpoint } from "@/data/api-schema";
import { MethodBadge } from "./MethodBadge";
import { ParameterInput } from "./ParameterInput";
import { ResponseViewer } from "./ResponseViewer";

const BASE_URL = "http://localhost:4000/api/v1";

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

    // Replace path params
    if (endpoint.pathParams) {
      for (const param of endpoint.pathParams) {
        const val = pathValues[param.name];
        if (val) {
          url = url.replace(`{${param.name}}`, encodeURIComponent(val));
        }
      }
    }

    // Append query params
    if (endpoint.queryParams) {
      const parts: string[] = [];
      for (const param of endpoint.queryParams) {
        const val = queryValues[param.name];
        if (val) {
          parts.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(val)}`);
        }
      }
      if (parts.length > 0) {
        url += `?${parts.join("&")}`;
      }
    }

    return url;
  }, [endpoint, pathValues, queryValues]);

  // Simulate a request
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
      className="rounded-2xl shadow-raised overflow-hidden"
      style={{ background: "#ffffff", border: "1px solid #e5e7eb" }}
    >
      {/* Header — clickeable */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition-all duration-200 hover:bg-gray-50/50"
      >
        <MethodBadge method={endpoint.method} />
        <span
          className="text-sm font-mono font-medium"
          style={{ color: "#19213D" }}
        >
          {endpoint.path}
        </span>
        <span
          className="text-sm hidden sm:inline"
          style={{ color: "#6D758F" }}
        >
          {endpoint.title}
        </span>
        <ChevronDown
          size={16}
          className="ml-auto transition-transform duration-300 ease-out flex-shrink-0"
          style={{
            transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
            color: "#6D758F",
          }}
        />
      </button>

      {/* Expandable content */}
      <div
        className="overflow-hidden transition-[height,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          height: isOpen ? contentHeight : 0,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div
          ref={contentRef}
          className="px-5 pb-5 space-y-5 border-t"
          style={{ borderColor: "#e5e7eb" }}
        >
          {/* Description */}
          <p className="text-sm pt-4" style={{ color: "#6D758F" }}>
            {endpoint.description}
          </p>

          {/* Parameters */}
          {hasParams && (
            <div className="space-y-4">
              {/* Path params */}
              {endpoint.pathParams && endpoint.pathParams.length > 0 && (
                <div className="space-y-3">
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#19213D" }}
                  >
                    Path Parameters
                  </h4>
                  {endpoint.pathParams.map((param) => (
                    <ParameterInput
                      key={param.name}
                      {...param}
                      value={pathValues[param.name] ?? ""}
                      onChange={(v) =>
                        setPathValues((prev) => ({ ...prev, [param.name]: v }))
                      }
                    />
                  ))}
                </div>
              )}

              {/* Query params */}
              {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                <div className="space-y-3">
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#19213D" }}
                  >
                    Query Parameters
                  </h4>
                  {endpoint.queryParams.map((param) => (
                    <ParameterInput
                      key={param.name}
                      {...param}
                      value={queryValues[param.name] ?? ""}
                      onChange={(v) =>
                        setQueryValues((prev) => ({ ...prev, [param.name]: v }))
                      }
                    />
                  ))}
                </div>
              )}

              {/* Request body */}
              {endpoint.requestBody && (
                <div className="space-y-2">
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#19213D" }}
                  >
                    Request Body
                    <span
                      className="ml-2 font-normal normal-case tracking-normal"
                      style={{ color: "#6D758F" }}
                    >
                      {endpoint.requestBody.contentType}
                    </span>
                  </h4>
                  <textarea
                    value={bodyValue}
                    onChange={(e) => setBodyValue(e.target.value)}
                    rows={Math.min(bodyValue.split("\n").length + 1, 12)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-sm font-mono",
                      "outline-none transition-all duration-200 resize-y",
                      "focus:ring-2 focus:ring-[#149A9B] focus:border-transparent"
                    )}
                    style={{ borderColor: "#e5e7eb", color: "#19213D" }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Constructed URL */}
          <div className="space-y-1.5">
            <h4
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#19213D" }}
            >
              Request URL
            </h4>
            <div
              className="rounded-xl px-3 py-2 text-sm font-mono break-all"
              style={{
                background: "#f8fafc",
                color: "#149A9B",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ color: "#6D758F" }}>{endpoint.method}</span>{" "}
              {buildUrl()}
            </div>
          </div>

          {/* Try it button */}
          <button
            onClick={handleTryIt}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white",
              "shadow-raised-sm transition-all duration-200",
              "hover:shadow-raised-sm-hover active:shadow-sunken-subtle",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
            style={{ background: loading ? "#0d7377" : "#149A9B" }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Play size={16} />
            )}
            {loading ? "Sending..." : "Try it"}
          </button>

          {/* Response */}
          {showResponse && <ResponseViewer responses={endpoint.responses} />}
        </div>
      </div>
    </div>
  );
}
