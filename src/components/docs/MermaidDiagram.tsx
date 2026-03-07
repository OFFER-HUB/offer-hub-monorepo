"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import mermaid from "mermaid";
import { useTheme } from "@/components/providers/ThemeProvider";

interface MermaidDiagramProps {
  chart?: string;
  children?: ReactNode;
  caption?: string;
}

function extractChartContent(
  chart: string | undefined,
  children: ReactNode,
): string {
  if (typeof chart === "string" && chart.trim()) return chart.trim();
  if (typeof children === "string" && children.trim()) return children.trim();
  if (children && typeof children === "object" && "props" in children) {
    const element = children as { props?: { children?: ReactNode } };
    if (typeof element.props?.children === "string")
      return element.props.children.trim();
  }
  return "";
}

export function MermaidDiagram({
  chart,
  children,
  caption,
}: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { resolvedTheme } = useTheme();

  const chartContent = extractChartContent(chart, children);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chartContent) return;

      const isDark = resolvedTheme === "dark";

      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: isDark
          ? {
              // ADDED: dark mode variables
              primaryColor: "#25253d",
              primaryTextColor: "#f1f3f7",
              primaryBorderColor: "#3d3d5c",
              secondaryColor: "#1a1a2e",
              secondaryTextColor: "#f1f3f7",
              secondaryBorderColor: "#3d3d5c",
              tertiaryColor: "#12121f",
              tertiaryTextColor: "#f1f3f7",
              tertiaryBorderColor: "#2a2a45",
              background: "#12121f",
              mainBkg: "#25253d",
              textColor: "#f1f3f7",
              lineColor: "#a0a6b8",
              fontFamily: "inherit",
              fontSize: "14px",
              nodeBorder: "#3d3d5c",
              nodeTextColor: "#f1f3f7",
              clusterBkg: "#1a1a2e",
              clusterBorder: "#3d3d5c",
              edgeLabelBackground: "#1a1a2e",
              labelBackgroundColor: "#1a1a2e",
              stateBkg: "#25253d",
              stateLabelColor: "#f1f3f7",
              compositeTitleBackground: "#3d3d5c",
              compositeBackground: "#1a1a2e",
              compositeBorder: "#3d3d5c",
            }
          : {
              primaryColor: "#E8F7F7",
              primaryTextColor: "#19213D",
              primaryBorderColor: "#149A9B",
              secondaryColor: "#F3F4F6",
              secondaryTextColor: "#19213D",
              secondaryBorderColor: "#6D758F",
              tertiaryColor: "#FFFFFF",
              tertiaryTextColor: "#19213D",
              tertiaryBorderColor: "#D1D5DB",
              background: "#FFFFFF",
              mainBkg: "#E8F7F7",
              textColor: "#19213D",
              lineColor: "#6D758F",
              fontFamily: "inherit",
              fontSize: "14px",
              nodeBorder: "#149A9B",
              nodeTextColor: "#19213D",
              clusterBkg: "#F9FAFB",
              clusterBorder: "#149A9B",
              edgeLabelBackground: "#FFFFFF",
              labelBackgroundColor: "#FFFFFF",
              stateBkg: "#E8F7F7",
              stateLabelColor: "#19213D",
              compositeTitleBackground: "#149A9B",
              compositeBackground: "#F9FAFB",
              compositeBorder: "#149A9B",
            },
        flowchart: {
          htmlLabels: true,
          curve: "basis",
          padding: 20,
        },
      });

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chartContent);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to render diagram",
        );
      }
    };

    renderChart();
    // added resolvedTheme to dependency array so effect re-runs on theme switch
  }, [chartContent, resolvedTheme]);

  if (error) {
    return (
      <div className="my-8 p-4 rounded-xl border border-red-200 bg-red-50">
        <p className="text-red-600 text-sm font-medium">
          Failed to render diagram
        </p>
        <pre className="mt-2 text-xs text-red-500 overflow-auto">{error}</pre>
      </div>
    );
  }

  return (
    <figure className="my-8">
      <div
        ref={containerRef}
        className="w-full overflow-x-auto"
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm font-medium text-[#6D758F]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
