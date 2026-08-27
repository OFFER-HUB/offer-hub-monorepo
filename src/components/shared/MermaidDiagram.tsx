"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/cn";
import { logger } from "@/utils/logger";

export type MermaidDiagramProps = {
  chart?: string;
  children?: ReactNode;
  caption?: string;
  className?: string;
  /** Enlarge fonts / min-height for zoom modal */
  zoom?: boolean;
  /**
   * framed = docs chrome (header + copy)
   * plain  = architecture embeds
   * auto   = framed when no className (docs); plain when className set
   */
  variant?: "framed" | "plain" | "auto";
};

function extractChartContent(chart: string | undefined, children: ReactNode): string {
  if (typeof chart === "string" && chart.trim()) return chart.trim();
  if (typeof children === "string" && children.trim()) return (children as string).trim();
  if (children && typeof children === "object" && "props" in children) {
    const el = children as { props?: { children?: ReactNode } };
    if (typeof el.props?.children === "string") return el.props.children.trim();
  }
  return "";
}

function themeVariables(isDark: boolean, zoom: boolean) {
  const fontSize = zoom ? "16px" : "14px";
  if (isDark) {
    return {
      primaryColor: "#2e2e3f",
      primaryTextColor: "#f1f3f7",
      primaryBorderColor: "#1fb8b9",
      secondaryColor: "#242433",
      secondaryTextColor: "#b8bfd0",
      secondaryBorderColor: "#3d3d5c",
      tertiaryColor: "#1a1a26",
      tertiaryTextColor: "#f1f3f7",
      tertiaryBorderColor: "#3d3d5c",
      background: "#242433",
      mainBkg: "#2e2e3f",
      textColor: "#f1f3f7",
      lineColor: "#6D758F",
      fontFamily: "Inter, sans-serif",
      fontSize,
      nodeBorder: "#1fb8b9",
      nodeTextColor: "#f1f3f7",
      clusterBkg: "#2e2e3f",
      clusterBorder: "#3d3d5c",
      edgeLabelBackground: "#2e2e3f",
      labelBackgroundColor: "#2e2e3f",
      titleColor: "#f1f3f7",
    };
  }
  return {
    primaryColor: "#E8F7F7",
    primaryTextColor: "#19213D",
    primaryBorderColor: "#149A9B",
    secondaryColor: "#F1F3F7",
    secondaryTextColor: "#19213D",
    secondaryBorderColor: "#6D758F",
    tertiaryColor: "#ffffff",
    tertiaryTextColor: "#19213D",
    tertiaryBorderColor: "#d1d5db",
    background: "#ffffff",
    mainBkg: "#E8F7F7",
    textColor: "#19213D",
    lineColor: "#6D758F",
    fontFamily: "Inter, sans-serif",
    fontSize,
    nodeBorder: "#149A9B",
    nodeTextColor: "#19213D",
    clusterBkg: "#F1F3F7",
    clusterBorder: "#149A9B",
    edgeLabelBackground: "#ffffff",
    labelBackgroundColor: "#ffffff",
    titleColor: "#19213D",
  };
}

/**
 * Shared Mermaid renderer for docs MDX + architecture blueprints.
 * Dynamic import + ThemeProvider (classList fallback).
 */
export function MermaidDiagram({
  chart,
  children,
  caption,
  className,
  zoom = false,
  variant = "auto",
}: MermaidDiagramProps) {
  const reactId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const chartContent = extractChartContent(chart, children);
  const { resolvedTheme } = useTheme();

  // Docs MDX (no className) → framed chrome; architecture (className/plain) → plain embed.
  const useFramed = variant === "framed" || (variant === "auto" && !className);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(chartContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      logger.error("Failed to copy!", err);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      if (!chartContent) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSvg("");

      const isDark =
        resolvedTheme === "dark" ||
        (typeof document !== "undefined" &&
          document.documentElement.classList.contains("dark"));

      try {
        const m = await import("mermaid");
        m.default.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: themeVariables(isDark, zoom),
          flowchart: { htmlLabels: true, curve: "basis", padding: 24 },
        });

        const id = `mermaid-${reactId}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: raw } = await m.default.render(id, chartContent);
        if (cancelled) return;

        const responsive = raw.replace(
          /(<svg[^>]*)\sstyle="[^"]*max-width:[^"]*"/,
          '$1 style="width: 100%; height: auto;"',
        );
        setSvg(responsive);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    renderChart();
    return () => {
      cancelled = true;
    };
  }, [chartContent, resolvedTheme, zoom, reactId]);

  if (error) {
    return (
      <div className="my-10 rounded-2xl overflow-hidden bg-bg-elevated p-6 border border-theme-error/30">
        <p className="text-theme-error text-sm font-semibold">Failed to render diagram</p>
        <pre className="mt-2 text-xs text-content-secondary overflow-auto max-h-32">{error}</pre>
      </div>
    );
  }

  // Plain architecture embed
  if (!useFramed) {
    if (!svg) {
      return (
        <div
          className={`rounded-2xl bg-bg-sunken shadow-neu-sunken animate-pulse ${className ?? ""}`}
          style={{ minHeight: zoom ? 400 : 200 }}
        />
      );
    }
    return (
      <div
        className={cn(zoom ? "[&>svg]:w-full" : "[&>svg]:max-w-full", "[&>svg]:h-auto", className)}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    );
  }

  // Framed docs chrome
  return (
    <figure className="my-10">
      <div
        className="rounded-3xl overflow-hidden bg-bg-elevated relative z-10"
        style={{
          boxShadow: "6px 6px 14px var(--shadow-dark), -6px -6px 14px var(--shadow-light)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 rounded-t-3xl bg-bg-sunken shadow-neu-sunken-subtle">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-theme-primary/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-theme-primary/30" />
              <span className="w-2.5 h-2.5 rounded-full bg-theme-primary/20" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.18em] font-mono text-content-secondary/80">
              Mermaid
            </span>
          </div>

          {chartContent && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Copied" : "Copy diagram source"}
              className={cn(
                "relative flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10.5px] font-black uppercase tracking-widest transition-[color,background-color,transform] duration-300",
                copied
                  ? "text-white bg-theme-primary shadow-lg shadow-theme-primary/25"
                  : "text-content-secondary bg-bg-base shadow-neu-raised-sm hover:text-content-primary hover:bg-theme-primary/10 active:scale-95",
              )}
            >
              <span className="flex items-center gap-2">
                {copied ? (
                  <Check size={14} className="stroke-[3.5]" />
                ) : (
                  <Copy size={14} className="stroke-[2.5]" />
                )}
                <span>{copied ? "Copied" : "Copy source"}</span>
              </span>
            </button>
          )}
        </div>

        <div
          ref={containerRef}
          className="mermaid-diagram-canvas w-full overflow-x-auto overflow-y-hidden p-8 flex items-center justify-center min-h-[200px] bg-bg-elevated"
        >
          {isLoading || !svg ? (
            <div className="flex flex-col items-center gap-3 text-content-secondary">
              <div className="w-8 h-8 rounded-full border-2 border-theme-primary/30 border-t-theme-primary animate-spin" />
              <span className="text-sm font-medium">Rendering diagram…</span>
            </div>
          ) : (
            <div
              className="mermaid-svg-wrapper [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:min-w-0"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      </div>

      {caption && (
        <figcaption className="mt-3 text-center text-sm font-medium text-content-secondary">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}


