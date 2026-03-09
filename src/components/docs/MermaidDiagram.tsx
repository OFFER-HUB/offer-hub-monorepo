"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import mermaid from "mermaid";
import { useTheme } from "@/components/providers/ThemeProvider";

interface MermaidDiagramProps {
  chart?: string;
  children?: ReactNode;
  caption?: string;
}

/**
 * Extract string content from children (handles MDX transformations)
 */
function extractChartContent(
  chart: string | undefined,
  children: ReactNode,
): string {
  // If chart prop is provided as a string, use it
  if (typeof chart === "string" && chart.trim()) {
    return chart.trim();
  }

  // If children is a string, use it
  if (typeof children === "string" && children.trim()) {
    return children.trim();
  }

  // Try to extract from children if it's a React element
  if (children && typeof children === "object" && "props" in children) {
    const element = children as { props?: { children?: ReactNode } };
    if (typeof element.props?.children === "string") {
      return element.props.children.trim();
    }
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

  // Extract the chart content from props or children
  const chartContent = extractChartContent(chart, children);

  // Get the current resolved theme to support dark mode
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chartContent) return;

      const isDark = resolvedTheme === "dark";

      // Initialize mermaid with custom theme based on current color scheme
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: isDark
          ? {
              // Primary colors - dark purple background with light text
              primaryColor: "#25253d",
              primaryTextColor: "#f1f3f7",
              primaryBorderColor: "#3d3d5c",
              // Secondary colors
              secondaryColor: "#1a1a2e",
              secondaryTextColor: "#f1f3f7",
              secondaryBorderColor: "#3d3d5c",
              // Tertiary
              tertiaryColor: "#12121f",
              tertiaryTextColor: "#f1f3f7",
              tertiaryBorderColor: "#2a2a45",
              // Background
              background: "#12121f",
              mainBkg: "#25253d",
              // Text - light gray for readability
              textColor: "#f1f3f7",
              lineColor: "#a0a6b8",
              // Fonts
              fontFamily: "inherit",
              fontSize: "14px",
              // Node styling
              nodeBorder: "#3d3d5c",
              nodeTextColor: "#f1f3f7",
              clusterBkg: "#1a1a2e",
              clusterBorder: "#3d3d5c",
              // Flowchart specific
              edgeLabelBackground: "#1a1a2e",
              // State diagram specific
              labelBackgroundColor: "#1a1a2e",
              stateBkg: "#25253d",
              stateLabelColor: "#f1f3f7",
              // Composite state styling
              compositeTitleBackground: "#3d3d5c",
              compositeBackground: "#1a1a2e",
              compositeBorder: "#3d3d5c",
              // Sequence diagram specific
              noteBkgColor: "#25253d",
              noteTextColor: "#f1f3f7",
              noteBorderColor: "#3d3d5c",
              actorBkg: "#25253d",
              actorTextColor: "#f1f3f7",
              actorBorder: "#3d3d5c",
            }
          : {
              // Primary colors - light teal background with dark text
              primaryColor: "#E8F7F7",
              primaryTextColor: "#19213D",
              primaryBorderColor: "#149A9B",
              // Secondary colors
              secondaryColor: "#F3F4F6",
              secondaryTextColor: "#19213D",
              secondaryBorderColor: "#6D758F",
              // Tertiary
              tertiaryColor: "#FFFFFF",
              tertiaryTextColor: "#19213D",
              tertiaryBorderColor: "#D1D5DB",
              // Background
              background: "#FFFFFF",
              mainBkg: "#E8F7F7",
              // Text - dark gray for readability
              textColor: "#19213D",
              lineColor: "#6D758F",
              // Fonts
              fontFamily: "inherit",
              fontSize: "14px",
              // Node styling
              nodeBorder: "#149A9B",
              nodeTextColor: "#19213D",
              clusterBkg: "#F9FAFB",
              clusterBorder: "#149A9B",
              // Flowchart specific
              edgeLabelBackground: "#FFFFFF",
              // State diagram specific
              labelBackgroundColor: "#FFFFFF",
              stateBkg: "#E8F7F7",
              stateLabelColor: "#19213D",
              // Composite state styling
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
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Render the diagram
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
    // Re-run when chart content or theme changes
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
