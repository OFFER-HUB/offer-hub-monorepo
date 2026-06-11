"use client";
import { useEffect, useRef, useState } from "react";

type Props = { chart: string; className?: string; zoom?: boolean };

export default function MermaidDiagram({ chart, className, zoom = false }: Props) {
  const [svg, setSvg] = useState<string>("");
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    const isDark = document.documentElement.classList.contains("dark");

    import("mermaid").then((m) => {
      m.default.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          primaryColor: "#149A9B",
          primaryTextColor: isDark ? "#f1f3f7" : "#19213D",
          primaryBorderColor: isDark ? "#3d3d5c" : "#d1d5db",
          lineColor: "#149A9B",
          secondaryColor: isDark ? "#2e2e3f" : "#F1F3F7",
          tertiaryColor: isDark ? "#1a1a26" : "#ffffff",
          background: isDark ? "#2e2e3f" : "#ffffff",
          mainBkg: isDark ? "#2e2e3f" : "#ffffff",
          nodeBorder: isDark ? "#3d3d5c" : "#d1d5db",
          clusterBkg: isDark ? "#1a1a26" : "#F1F3F7",
          titleColor: isDark ? "#f1f3f7" : "#19213D",
          edgeLabelBackground: isDark ? "#1a1a26" : "#F1F3F7",
          fontFamily: "Inter, sans-serif",
          fontSize: zoom ? "16px" : "13px",
        },
      });
      m.default.render(idRef.current, chart).then(({ svg: raw }) => {
        if (!cancelled) {
          // Strip Mermaid's inline max-width so the SVG fills its container
          const responsive = raw.replace(
            /(<svg[^>]*)\sstyle="[^"]*max-width:[^"]*"/,
            '$1 style="width: 100%; height: auto;"'
          );
          setSvg(responsive);
        }
      });
    });
    return () => { cancelled = true; };
  }, [chart, zoom]);

  if (!svg)
    return (
      <div
        className={`rounded-2xl bg-bg-sunken shadow-neu-sunken animate-pulse ${className ?? ""}`}
        style={{ minHeight: zoom ? 400 : 200 }}
      />
    );

  return (
    <div
      className={`${zoom ? "[&>svg]:w-full" : "[&>svg]:max-w-full"} [&>svg]:h-auto ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
