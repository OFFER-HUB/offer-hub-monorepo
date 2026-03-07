"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/components/providers/ThemeProvider";

const InteractiveDotGrid = dynamic(
    () => import("@/components/ui/InteractiveDotGrid").then((mod) => mod.InteractiveDotGrid),
    { ssr: false }
);

export function ClientBackground() {
    const { resolvedTheme } = useTheme();
    
    // Dark mode: #3d3d5c with subtle opacity
    // Light mode: Current subtle gray/teal tint
    const dotColor = resolvedTheme === "dark" 
        ? "rgba(61, 61, 92, 0.6)" 
        : "rgba(109, 117, 143, 0.4)";
    
    const opacity = resolvedTheme === "dark" ? 0.4 : 0.3;

    return (
        <InteractiveDotGrid 
            opacity={opacity} 
            dotColor={dotColor} 
            gridSize={48} 
        />
    );
}
