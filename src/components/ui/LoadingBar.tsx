"use client";

import { useEffect, useState } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";

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
        <div
            className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-theme-primary to-[#22e0e2] z-[9999] origin-left"
            style={{ transform: `scaleX(${progress})`, transition: isLoading ? "transform 0.4s ease" : "none" }}
        />
    );
}
