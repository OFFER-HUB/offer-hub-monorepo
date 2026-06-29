"use client";

import { useRef, useEffect } from "react";
import DocsSearchBar from "@/components/docs/DocsSearchBar";
import { Book, Code, Shield, LifeBuoy, Terminal, Zap, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const docSections = [
  {
    icon: <Book />,
    title: "Getting Started",
    description: "Learn what OFFER-HUB is, how to install it, and make your first API call.",
    link: "/docs/getting-started",
    count: "3 articles",
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <Zap />,
    title: "Quick Start Guide",
    description: "Create users, orders, and complete your first escrow transaction in minutes.",
    link: "/docs/guide/quick-start",
    count: "8 guides",
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <Terminal />,
    title: "API Reference",
    description: "Complete REST API documentation with authentication, endpoints, and webhooks.",
    link: "/docs/api-reference/overview",
    count: "3 articles",
    externalLink: { href: "/openapi.json", label: "View OpenAPI Spec" },
  },
  {
    icon: <Shield />,
    title: "Escrow & Payments",
    description: "Smart contract escrow, deposits, withdrawals, and dispute resolution.",
    link: "/docs/guide/escrow",
    count: "5 guides",
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <Code />,
    title: "TypeScript SDK",
    description: "Install and use the official SDK to integrate OFFER-HUB into your app.",
    link: "/docs/sdk/quick-start",
    count: "1 article",
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <LifeBuoy />,
    title: "Self-Hosting",
    description: "Deploy OFFER-HUB on your own infrastructure with Docker and configure it.",
    link: "/docs/guide/self-hosting",
    count: "2 articles",
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <Lock />,
    title: "Security Best Practices",
    description: "API key management, webhook validation, wallet key security, and blockchain-specific attack mitigations.",
    link: "/docs/guide/security",
    count: "1 guide",
    externalLink: undefined as { href: string; label: string } | undefined,
  },
];

export default function DocsPage() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;

    let frame: number;
    let t = 0;

    const animate = () => {
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
        `radial-gradient(ellipse 62% 72% at ${b3x}% ${b2y}%, rgba(241,243,247,0.85) 0%, rgba(241,243,247,0.40) 40%, rgba(241,243,247,0) 78%)`,
      ].join(", ");

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex-1" id="doc-page-export-content">
        {/* Hub Header */}
        <div className="relative py-12 md:py-20 overflow-hidden">
          {/* Background Glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(20,154,155,0.08) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 text-center px-4">
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] mb-6 animate-fadeIn text-theme-primary opacity-80">
              Documentation Center
            </p>

            <h1
              ref={headingRef}
              className="text-[3rem] md:text-[5rem] lg:text-[6.5rem] font-black leading-[0.85] tracking-tighter mb-8 select-none drop-shadow-[0_10px_30px_rgba(20,154,155,0.15)]"
              style={{
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                backgroundColor: "var(--color-primary)",
                willChange: "background-image",
              }}
            >
              OFFER HUB
            </h1>

            <p className="text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-medium animate-fadeInUp text-content-secondary" style={{ animationDelay: "200ms" }}>
              Explore the core architecture, integration guides, and <span className="text-content-primary font-bold">standard practices</span> for the Offer Hub ecosystem.
            </p>

            <div className="max-w-xl mx-auto animate-fadeInUp" style={{ animationDelay: "400ms" }}>
              <DocsSearchBar />
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <div className="container mx-auto px-6 py-16 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docSections.map((section) => (
              <div key={section.link} className="relative group">
                <Link
                  href={section.link}
                  className={cn(
                    "block p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2 border border-black/[0.03] dark:border-white/[0.03] bg-bg-base/50 backdrop-blur-sm",
                    "hover:border-theme-primary/20 hover:shadow-neu-raised"
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:bg-theme-primary group-hover:text-white bg-bg-sunken text-theme-primary shadow-neu-sunken-subtle">
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 group-hover:text-theme-primary transition-colors leading-tight tracking-tight text-content-primary">
                    {section.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed mb-8 font-medium text-content-secondary">
                    {section.description}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-content-secondary/40">
                    <span>{section.count}</span>
                    <span className="text-theme-primary opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 flex items-center gap-2">
                      Explore <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
                {section.externalLink && (
                  <a
                    href={section.externalLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 inline-block mt-2 ml-8 text-xs font-bold text-theme-primary hover:underline"
                  >
                    {section.externalLink.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Support Section */}
        <div className="container mx-auto px-6 py-24 max-w-4xl text-center">
          <p className="italic mb-6 text-sm font-medium text-content-secondary/60">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <div className="flex justify-center items-center gap-8">
            <Link href="/community" className="text-theme-primary font-black uppercase tracking-widest text-xs hover:tracking-[0.2em] transition-all">Help Center</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-theme-border/40" />
            <Link href="https://github.com/OFFER-HUB/offer-hub-monorepo/issues" className="text-theme-primary font-black uppercase tracking-widest text-xs hover:tracking-[0.2em] transition-all">GitHub Issues</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
