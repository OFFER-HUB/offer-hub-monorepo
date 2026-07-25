"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import MermaidDiagram from "@/components/shared/MermaidDiagram";
import DiagramZoomModal from "./DiagramZoomModal";

type ZoomableDiagramProps = {
  chart: string;
  title: string;
  /** Extra classes for the rendered diagram — typically a `min-w-[…]` floor. */
  className?: string;
};

export default function ZoomableDiagram({
  chart,
  title,
  className,
}: ZoomableDiagramProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <>
      <div className="relative rounded-[2rem] bg-bg-base shadow-neu-sunken p-6 w-full flex-grow overflow-x-auto">
        <MermaidDiagram chart={chart} className={className} variant="plain" />
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute top-4 right-4 rounded-xl bg-bg-base shadow-neu-raised-sm p-2 hover:shadow-neu-sunken transition-all z-10"
          aria-label="Expand diagram"
        >
          <Maximize2 size={15} className="text-theme-primary" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-content-muted">
        For a better view, click <Maximize2 size={11} className="inline text-theme-primary mx-0.5 -mt-0.5" /> to expand
      </p>

      <DiagramZoomModal title={title} isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)}>
        <MermaidDiagram chart={chart} className="w-full" zoom variant="plain" />
      </DiagramZoomModal>
    </>
  );
}
