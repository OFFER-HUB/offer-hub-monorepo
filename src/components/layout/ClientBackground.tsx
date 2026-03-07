"use client";

import dynamic from "next/dynamic";

const InteractiveDotGrid = dynamic(
    () => import("@/components/ui/InteractiveDotGrid").then((mod) => mod.InteractiveDotGrid),
    { ssr: false }
);

export function ClientBackground() {
    return (
        <InteractiveDotGrid opacity={0.3} dotColor="rgba(109, 117, 143, 0.4)" gridSize={48} />
    );
}
