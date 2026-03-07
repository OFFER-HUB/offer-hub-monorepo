"use client";

import { useEffect, useState, useRef } from "react";

export default function LoadingBar() {
    const [progress, setProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const ticking = useRef(false);

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

        const onScroll = () => {
            if (!ticking.current) {
                ticking.current = true;
                requestAnimationFrame(() => {
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                    setProgress(docHeight > 0 ? window.scrollY / docHeight : 0);
                    ticking.current = false;
                });
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [isLoading]);

    return (
        <div
            className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#149A9B] to-[#22e0e2] z-[9999] origin-left"
            style={{ transform: `scaleX(${progress})`, transition: isLoading ? "transform 0.4s ease" : "none" }}
        />
    );
}
