"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useState, useEffect, useRef } from "react";
import {
    Users,
    ShieldCheck,
    Zap,
    Globe
} from "lucide-react";
import { cn } from "@/lib/cn";

const PAGE_SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features" },
    { id: "architecture", label: "Architecture" },
];

export default function UseCasesPage() {
    const [activeSection, setActiveSection] = useState("overview");
    const [isNavPinned, setIsNavPinned] = useState(false);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                let mostVisibleEntry = entries[0];
                entries.forEach((entry) => {
                    if (entry.intersectionRatio > mostVisibleEntry.intersectionRatio) {
                        mostVisibleEntry = entry;
                    }
                });
                if (mostVisibleEntry.isIntersecting) {
                    setActiveSection(mostVisibleEntry.target.id);
                }
            },
            { threshold: [0.1, 0.5, 0.9], rootMargin: "-20% 0px -20% 0px" }
        );

        PAGE_SECTIONS.forEach((section) => {
            const element = document.getElementById(section.id);
            if (element) observer.observe(element);
        });

        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(() => {
                    if (navRef.current) {
                        setIsNavPinned(navRef.current.getBoundingClientRect().top <= 81);
                    }
                    ticking = false;
                });
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            observer.disconnect();
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 140;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="bg-transparent min-h-[100dvh]">
            <Navbar />

            <main>
                {/* ── Hero / Overview Section ── */}
                <section id="overview" className="pt-40 pb-20 relative overflow-hidden bg-transparent">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
                        <div
                            className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.8),inset_-2px_-2px_5px_rgba(0,0,0,0.05),4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] animate-fadeIn"
                            style={{ color: "#149A9B", background: "#F1F3F7" }}
                        >
                            <Users size={14} className="inline mr-2.5 mb-0.5" />
                            Freelance Marketplace
                        </div>

                        <h1
                            className="text-5xl md:text-7xl font-black tracking-tight mb-8 animate-fadeInUp"
                            style={{ color: "#19213D" }}
                        >
                            Powering the Future of <br className="hidden md:block" /> Independent Work
                        </h1>

                        <p
                            className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12 animate-fadeInUp"
                            style={{ color: "#6D758F", animationDelay: "0.1s" }}
                        >
                            Build a global, trustless freelance platform. Escrow funds in smart contracts, release payments upon milestone completion, and pay talent instantly across borders on Stellar.
                        </p>
                    </div>
                </section>

                {/* ── Sticky Navigation (Neumorphic Pill) ── */}
                <div ref={navRef} className="sticky top-[80px] z-40 py-6 pointer-events-none">
                    <div className="max-w-3xl mx-auto px-6 flex justify-center">
                        <div
                            className={cn(
                                "pointer-events-auto flex items-center p-2 rounded-2xl transition-all duration-500",
                                isNavPinned ? "shadow-nav-scrolled" : "shadow-nav"
                            )}
                            style={{ background: "#F1F3F7" }}
                        >
                            <div className="flex items-center gap-2">
                                {PAGE_SECTIONS.map((section) => (
                                    <a
                                        key={section.id}
                                        id={`nav-link-${section.id}`}
                                        href={`#${section.id}`}
                                        onClick={(e) => handleNavClick(e, section.id)}
                                        className={cn(
                                            "relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                                            activeSection === section.id
                                                ? "btn-neumorphic-primary"
                                                : "text-[#6D758F] hover:shadow-[inset_2px_2px_5px_#d1d5db,inset_-2px_-2px_5px_#ffffff]"
                                        )}
                                    >
                                        {section.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Features Section ── */}
                <section id="features" className="py-24 scroll-mt-24 relative bg-transparent">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="flex flex-col items-center text-center p-10 rounded-[2rem] bg-[#F1F3F7] shadow-raised hover:shadow-raised-hover transition-all duration-300 ease-out group">
                                <div className="w-16 h-16 rounded-2xl shadow-sunken-subtle bg-[#F1F3F7] flex items-center justify-center mb-8 group-hover:shadow-sunken transition-all duration-300">
                                    <ShieldCheck size={28} style={{ color: "#149A9B" }} />
                                </div>
                                <h3 className="text-xl font-bold mb-4" style={{ color: "#19213D" }}>Trustless Escrow</h3>
                                <p className="text-sm font-medium leading-relaxed" style={{ color: "#6D758F" }}>
                                    Lock client funds into secure smart contracts at project kick-off. Funds are guaranteed to exist, protecting both the freelancer and the client.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col items-center text-center p-10 rounded-[2rem] bg-[#F1F3F7] shadow-raised hover:shadow-raised-hover transition-all duration-300 ease-out group">
                                <div className="w-16 h-16 rounded-2xl shadow-sunken-subtle bg-[#F1F3F7] flex items-center justify-center mb-8 group-hover:shadow-sunken transition-all duration-300">
                                    <Zap size={28} style={{ color: "#149A9B" }} />
                                </div>
                                <h3 className="text-xl font-bold mb-4" style={{ color: "#19213D" }}>Milestone Automation</h3>
                                <p className="text-sm font-medium leading-relaxed" style={{ color: "#6D758F" }}>
                                    Trigger partial or full payments automatically when APIs dictate completion of deliverables, removing manual invoice friction.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col items-center text-center p-10 rounded-[2rem] bg-[#F1F3F7] shadow-raised hover:shadow-raised-hover transition-all duration-300 ease-out group">
                                <div className="w-16 h-16 rounded-2xl shadow-sunken-subtle bg-[#F1F3F7] flex items-center justify-center mb-8 group-hover:shadow-sunken transition-all duration-300">
                                    <Globe size={28} style={{ color: "#149A9B" }} />
                                </div>
                                <h3 className="text-xl font-bold mb-4" style={{ color: "#19213D" }}>Global Payouts</h3>
                                <p className="text-sm font-medium leading-relaxed" style={{ color: "#6D758F" }}>
                                    Settle funds instantly in USDC or fiat-backed stablecoins directly to the freelancer&apos;s wallet, bypassing multi-day bank transfer delays and high FX fees.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Architecture Section ── */}
                <section id="architecture" className="py-24 scroll-mt-24 relative bg-transparent">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
                        <div className="w-16 h-16 rounded-2xl shadow-raised bg-[#F1F3F7] mx-auto mb-8 flex items-center justify-center">
                            <Users size={24} style={{ color: "#149A9B" }} />
                        </div>

                        <h2
                            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
                            style={{ color: "#19213D" }}
                        >
                            How it works under the hood
                        </h2>

                        <p
                            className="text-lg font-medium max-w-2xl mx-auto mb-16 leading-relaxed"
                            style={{ color: "#6D758F" }}
                        >
                            A simplified view of the smart contract interactions orchestrated by OFFER HUB APIs.
                        </p>

                        <div
                            className="relative overflow-hidden h-[400px] md:h-[550px] rounded-[3rem] shadow-[inset_8px_8px_16px_#d1d5db,inset_-8px_-8px_16px_#ffffff] w-full max-w-5xl mx-auto bg-[#F1F3F7] flex flex-col items-center justify-center animate-fadeInScale"
                        >
                            {/* Inner UI mock */}
                            <div className="relative text-center p-8 w-full max-w-lg">
                                <div className="w-24 h-24 rounded-3xl bg-[#F1F3F7] shadow-raised mx-auto mb-8 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full border-4 border-t-[#149A9B] border-r-transparent border-b-[#149A9B]/20 border-l-transparent animate-spin" style={{ animationDuration: '3s' }} />
                                </div>
                                <h3 className="text-[#19213D]/50 font-black tracking-widest uppercase text-sm mb-6">
                                    Awaiting Milestone Validation
                                </h3>

                                {/* Fake contract parameters */}
                                <div className="w-full bg-[#e7edf4] rounded-2xl p-6 shadow-sunken-subtle flex flex-col gap-4 text-left">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-[#6D758F] uppercase tracking-wider">Escrow Balance</span>
                                        <span className="text-sm font-black text-[#149A9B]">5,000.00 USDC</span>
                                    </div>
                                    <div className="w-full h-px bg-[#d1d5db]/50" />
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-[#6D758F] uppercase tracking-wider">Status</span>
                                        <span className="text-xs font-bold text-white bg-[#19213D] px-3 py-1 rounded-full shadow-raised-sm">LOCKED</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
