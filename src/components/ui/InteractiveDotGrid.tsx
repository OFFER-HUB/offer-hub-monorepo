"use client";

import { useEffect, useRef } from "react";

interface InteractiveDotGridProps {
    opacity?: number;
    dotColor?: string;
    gridSize?: number;
}

interface Dot {
    x: number;
    y: number;
    currentX: number;
    currentY: number;
    baseRadius: number;
    radius: number;
}

export function InteractiveDotGrid({
    opacity = 0.85,
    dotColor = "rgba(109, 117, 143, 0.9)",
    gridSize = 48,
}: InteractiveDotGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dotsRef = useRef<Dot[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const sizeRef = useRef({ width: 0, height: 0 });
    const isAnimatingRef = useRef(false);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const effectRadius = 160;
        const maxRepulsion = 25;
        const baseRadius = 1.8;
        const maxRadius = 4.5;
        const returnSpeed = 0.15;
        const SETTLE_THRESHOLD = 0.05;

        const initGrid = () => {
            // Use viewport size, not page size
            const width = window.innerWidth;
            const height = window.innerHeight;
            if (width === 0 || height === 0) return;

            sizeRef.current = { width, height };
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const newDots: Dot[] = [];
            const cols = Math.floor(width / gridSize) + 2;
            const rows = Math.floor(height / gridSize) + 2;
            const marginX = (width - (cols - 1) * gridSize) / 2;
            const marginY = (height - (rows - 1) * gridSize) / 2;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = marginX + i * gridSize;
                    const y = marginY + j * gridSize;
                    newDots.push({ x, y, currentX: x, currentY: y, baseRadius, radius: baseRadius });
                }
            }
            dotsRef.current = newDots;
            drawStatic();
        };

        const drawStatic = () => {
            const { width, height } = sizeRef.current;
            if (width === 0 || height === 0) return;
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = dotColor;
            ctx.globalAlpha = opacity;
            const dots = dotsRef.current;
            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.baseRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const render = () => {
            const { width, height } = sizeRef.current;
            if (width === 0 || height === 0) return;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = dotColor;
            ctx.globalAlpha = opacity;

            const dots = dotsRef.current;
            const mouseX = mouseRef.current.x;
            const mouseY = mouseRef.current.y;
            let stillMoving = false;

            // Only compute physics for dots near the mouse (within effectRadius + margin)
            const nearRange = effectRadius + 60;

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];

                // Quick distance check to mouse — skip physics for far dots
                const roughDx = Math.abs(mouseX - dot.x);
                const roughDy = Math.abs(mouseY - dot.y);

                if (roughDx < nearRange && roughDy < nearRange) {
                    const dx = mouseX - dot.x;
                    const dy = mouseY - dot.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    let targetX = dot.x;
                    let targetY = dot.y;
                    let targetRadius = dot.baseRadius;

                    if (distance < effectRadius) {
                        const force = (effectRadius - distance) / effectRadius;
                        const angle = Math.atan2(dy, dx);
                        const pushOffset = force * maxRepulsion;
                        targetX = dot.x - Math.cos(angle) * pushOffset;
                        targetY = dot.y - Math.sin(angle) * pushOffset;
                        targetRadius = dot.baseRadius + (force * (maxRadius - dot.baseRadius));
                    }

                    dot.currentX += (targetX - dot.currentX) * returnSpeed;
                    dot.currentY += (targetY - dot.currentY) * returnSpeed;
                    dot.radius += (targetRadius - dot.radius) * returnSpeed;

                    if (
                        Math.abs(dot.currentX - targetX) > SETTLE_THRESHOLD ||
                        Math.abs(dot.currentY - targetY) > SETTLE_THRESHOLD ||
                        Math.abs(dot.radius - targetRadius) > SETTLE_THRESHOLD
                    ) {
                        stillMoving = true;
                    }
                } else if (
                    Math.abs(dot.currentX - dot.x) > SETTLE_THRESHOLD ||
                    Math.abs(dot.currentY - dot.y) > SETTLE_THRESHOLD ||
                    Math.abs(dot.radius - dot.baseRadius) > SETTLE_THRESHOLD
                ) {
                    // Dot was displaced but mouse moved away — settle back
                    dot.currentX += (dot.x - dot.currentX) * returnSpeed;
                    dot.currentY += (dot.y - dot.currentY) * returnSpeed;
                    dot.radius += (dot.baseRadius - dot.radius) * returnSpeed;
                    stillMoving = true;
                }

                ctx.beginPath();
                ctx.arc(dot.currentX, dot.currentY, dot.radius, 0, Math.PI * 2);
                ctx.fill();
            }

            if (stillMoving) {
                animationFrameRef.current = requestAnimationFrame(render);
            } else {
                isAnimatingRef.current = false;
            }
        };

        const startAnimation = () => {
            if (!isAnimatingRef.current) {
                isAnimatingRef.current = true;
                animationFrameRef.current = requestAnimationFrame(render);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
            startAnimation();
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
            startAnimation();
        };

        let resizeTimer: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(initGrid, 200);
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        document.body.addEventListener("mouseleave", handleMouseLeave);

        initGrid();

        return () => {
            clearTimeout(resizeTimer);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [dotColor, gridSize, opacity]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none"
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                display: "block",
            }}
        />
    );
}
