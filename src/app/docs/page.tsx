"use client";

import { useRef, useEffect } from "react";
import DocsSearchBar from "@/components/docs/DocsSearchBar";
import { Book, Code, Shield, LifeBuoy, Terminal, Zap } from "lucide-react";
import Link from "next/link";

const docSections = [
    {
        icon: <Book className="text-[#149A9B]" />,
        title: "Getting Started",
        description: "Learn what OFFER-HUB is, how to install it, and make your first API call.",
        link: "/docs/getting-started",
        count: "3 articles"
    },
    {
        icon: <Zap className="text-[#149A9B]" />,
        title: "Quick Start Guide",
        description: "Create users, orders, and complete your first escrow transaction in minutes.",
        link: "/docs/guide/quick-start",
        count: "8 guides"
    },
    {
        icon: <Terminal className="text-[#149A9B]" />,
        title: "API Reference",
        description: "Complete REST API documentation with authentication, endpoints, and webhooks.",
        link: "/docs/api-reference/overview",
        count: "3 articles"
    },
    {
        icon: <Shield className="text-[#149A9B]" />,
        title: "Escrow & Payments",
        description: "Smart contract escrow, deposits, withdrawals, and dispute resolution.",
        link: "/docs/guide/escrow",
        count: "5 guides"
    },
    {
        icon: <Code className="text-[#149A9B]" />,
        title: "TypeScript SDK",
        description: "Install and use the official SDK to integrate OFFER-HUB into your app.",
        link: "/docs/sdk/quick-start",
        count: "1 article"
    },
    {
        icon: <LifeBuoy className="text-[#149A9B]" />,
        title: "Self-Hosting",
        description: "Deploy OFFER-HUB on your own infrastructure with Docker and configure it.",
        link: "/docs/guide/self-hosting",
        count: "2 articles"
    }
];

export default function DocsPage() {
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const el = headingRef.current;
        if (!el) return;

        let frame: number;
        let t = 0;
        let paused = false;

        const animate = () => {
            if (paused) return;
            t += 0.022;

            const b1x = 50 + 28 * Math.sin(t * 0.70);
            const b1y = 50 + 22 * Math.cos(t * 0.50);
            const b2x = 50 + 22 * Math.sin(t * 0.40 + 2.0);
            const b2y = 50 + 28 * Math.cos(t * 0.60 + 1.2);
            const b3x = 50 + 32 * Math.sin(t * 0.85 + 4.2);
            const b3y = 50 + 18 * Math.cos(t * 0.75 + 3.0);
            const b4x = 50 + 18 * Math.sin(t * 1.10 + 1.0);
            const b4y = 50 + 30 * Math.cos(t * 0.95 + 5.1);
            const b5x = 50 + 38 * Math.sin(t * 0.55 + 5.5);
            const b5y = 50 + 24 * Math.cos(t * 0.42 + 4.0);

            el.style.backgroundImage = [
                `radial-gradient(ellipse 48% 55% at ${b1x}% ${b1y}%, #1bc8ca 0%, #149A9B 45%, rgba(20,154,155,0) 82%)`,
                `radial-gradient(ellipse 38% 46% at ${b2x}% ${b2y}%, #22e0e2 0%, #1bc8ca 40%, rgba(27,200,202,0) 80%)`,
                `radial-gradient(ellipse 32% 42% at ${b3x}% ${b3y}%, #15949C 0%, rgba(21,148,156,0) 78%)`,
                `radial-gradient(ellipse 28% 38% at ${b4x}% ${b4y}%, #0d7377 0%, rgba(13,115,119,0) 78%)`,
                `radial-gradient(ellipse 44% 52% at ${b5x}% ${b5y}%, #149A9B 0%, rgba(20,154,155,0) 82%)`,
                `radial-gradient(ellipse 62% 72% at ${b3x}% ${b2y}%, rgba(241,243,247,0.90) 0%, rgba(241,243,247,0.50) 40%, rgba(241,243,247,0) 78%)`,
            ].join(", ");

            frame = requestAnimationFrame(animate);
        };

        const onVisibility = () => {
            if (document.hidden) {
                paused = true;
                cancelAnimationFrame(frame);
            } else {
                paused = false;
                frame = requestAnimationFrame(animate);
            }
        };

        document.addEventListener("visibilitychange", onVisibility);
        frame = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(frame);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-transparent">
            <main className="flex-1" id="doc-page-export-content">
                {/* Hub Header */}
                <div className="relative py-28 md:py-40 overflow-hidden">
                    {/* Background Glow */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(20,154,155,0.05) 0%, transparent 70%)",
                        }}
                    />

                    <div className="relative z-10 container mx-auto px-6 max-w-6xl text-center">
                        <p
                            className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-6 md:mb-10 animate-fadeIn"
                            style={{ color: "#149A9B" }}
                        >
                            Documentation Center
                        </p>

                        <h1
                            ref={headingRef}
                            className="text-[3.5rem] md:text-[6rem] lg:text-[8rem] font-black leading-[0.85] tracking-tighter mb-8 md:mb-12 select-none drop-shadow-[0_10px_30px_rgba(20,154,155,0.1)]"
                            style={{
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                                backgroundColor: "#149A9B",
                                willChange: "background-image",
                            }}
                        >
                            OFFER HUB
                        </h1>

                        <p className="text-base md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-fadeInUp" style={{ color: "#6D758F", animationDelay: "200ms" }}>
                            Explore the core architecture, integration guides, and <span className="text-[#19213D] font-bold">standard practices</span> for the Offer Hub ecosystem.
                        </p>

                        <div className="max-w-xl mx-auto animate-fadeInUp" style={{ animationDelay: "400ms" }}>
                            <DocsSearchBar />
                        </div>
                    </div>
                </div>

                {/* Section Cards */}
                <div className="container mx-auto px-6 py-16 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {docSections.map((section, idx) => (
                            <Link
                                key={idx}
                                href={section.link}
                                className="group p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 border border-black/[0.03] hover:border-[#149A9B]/20 hover:shadow-[0_20px_40px_rgba(20,154,155,0.08)] bg-white/50 backdrop-blur-sm"
                            >
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:bg-[#149A9B] group-hover:text-white" style={{ background: "#F1F3F7", color: "#149A9B" }}>
                                    {section.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-4 group-hover:text-[#149A9B] transition-colors leading-tight tracking-tight" style={{ color: "#19213D" }}>
                                    {section.title}
                                </h3>
                                <p className="text-[15px] leading-relaxed mb-8 font-medium" style={{ color: "#6D758F" }}>
                                    {section.description}
                                </p>
                                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "#9CA3AF" }}>
                                    <span>{section.count}</span>
                                    <span className="text-[#149A9B] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 flex items-center gap-2">
                                        Explore <ChevronRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Support Section */}
                <div className="container mx-auto px-6 py-24 max-w-4xl text-center">
                    <p className="italic mb-6 text-sm font-medium" style={{ color: "#9CA3AF" }}>
                        Can&apos;t find what you&apos;re looking for?
                    </p>
                    <div className="flex justify-center items-center gap-8">
                        <Link href="/help" className="text-[#149A9B] font-black uppercase tracking-widest text-xs hover:tracking-[0.2em] transition-all">Help Center</Link>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB]" />
                        <Link href="https://github.com/OFFER-HUB/offer-hub-monorepo/issues" className="text-[#149A9B] font-black uppercase tracking-widest text-xs hover:tracking-[0.2em] transition-all">GitHub Issues</Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ChevronRight({ size = 16, className = "" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
