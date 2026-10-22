"use client";

import { useEffect, useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { TopProgressBar } from "./TopProgressBar";

/** Page-load animation that then tracks scroll position. See NavigationProgress for route changes. */
export function LoadingBar() {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const scrollY = useScrollProgress(!isLoading);

    useEffect(() => {
        setProgress(0.3);
        const timer = setTimeout(() => {
            setProgress(1);
            setTimeout(() => setIsLoading(false), 500);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoading) return;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(docHeight > 0 ? scrollY / docHeight : 0);
    }, [isLoading, scrollY]);

    return (
        <TopProgressBar
            progress={progress}
            transition={isLoading ? "transform 0.4s ease" : "none"}
        />
    );
}
