"use client";

import { DocsSearchBar } from "@/components/docs/DocsSearchBar";
import { Book, Code, Shield, LifeBuoy, Terminal, Zap, ChevronRight, Lock, Rocket } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { GITHUB_REPO_URL } from "@/constants/github";

const docSections = [
  {
    icon: <Rocket />,
    title: "Build Your First Marketplace",
    description: "Hackathon fast-track: scaffold a project, run the Orchestrator, wire the SDK, and ship buyer signup, listings, checkout with escrow, and fund release end to end.",
    link: "/docs/guide/build-your-first-marketplace",
    count: "Recommended start",
    highlight: true,
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <Book />,
    title: "Getting Started",
    description: "Learn what OFFER-HUB is, how to install it, and make your first API call.",
    link: "/docs/getting-started",
    count: "3 articles",
    highlight: false,
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <Zap />,
    title: "Quick Start Guide",
    description: "Create users, orders, and complete your first escrow transaction in minutes.",
    link: "/docs/guide/quick-start",
    count: "8 guides",
    highlight: false,
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <Terminal />,
    title: "API Reference",
    description: "Complete REST API documentation with authentication, endpoints, and real-time events.",
    link: "/docs/api-reference/overview",
    count: "7 articles",
    highlight: false,
    externalLink: { href: "/openapi.json", label: "View OpenAPI Spec" },
  },
  {
    icon: <Shield />,
    title: "Escrow & Payments",
    description: "Smart contract escrow, deposits, withdrawals, and dispute resolution.",
    link: "/docs/guide/escrow",
    count: "5 guides",
    highlight: false,
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <Code />,
    title: "TypeScript SDK",
    description: "Install and use the official SDK to integrate OFFER-HUB into your app.",
    link: "/docs/sdk/quick-start",
    count: "1 article",
    highlight: false,
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <LifeBuoy />,
    title: "Self-Hosting",
    description: "Deploy OFFER-HUB on your own infrastructure with Docker and configure it.",
    link: "/docs/guide/self-hosting",
    count: "2 articles",
    highlight: false,
    externalLink: undefined as { href: string; label: string } | undefined,
  },
  {
    icon: <Lock />,
    title: "Security Best Practices",
    description: "API key management, webhook validation, wallet key security, and blockchain-specific attack mitigations.",
    link: "/docs/guide/security",
    count: "1 guide",
    highlight: false,
    externalLink: undefined as { href: string; label: string } | undefined,
  },
];

export default function DocsPage() {
  return (
    <div className="flex flex-col">
      <div className="flex-1" id="doc-page-export-content">
        {/* Hub Header */}
        <div className="py-12 md:py-16">
          <div className="text-center px-4">
            <p className="text-xs font-black uppercase tracking-[0.4em] mb-6 animate-fadeIn text-theme-primary opacity-80">
              Documentation Center
            </p>

            <h1 className="text-[3rem] md:text-[5rem] lg:text-[6.5rem] font-black leading-[0.85] tracking-tighter mb-8 select-none text-content-primary">
              OFFER-HUB
            </h1>

            <p className="text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-medium animate-fadeInUp text-content-secondary" style={{ animationDelay: "200ms" }}>
              Explore the core architecture, integration guides, and <span className="text-content-primary font-bold">standard practices</span> for the OFFER-HUB ecosystem.
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
              <div key={section.link} className={cn("relative group", section.highlight && "md:col-span-2 lg:col-span-3")}>
                <Link
                  href={section.link}
                  className={cn(
                    "block p-8 rounded-3xl transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-2 border border-black/[0.03] dark:border-white/[0.03] bg-bg-base/50 backdrop-blur-sm",
                    "hover:border-theme-border/40 hover:shadow-neu-raised"
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-[background-color,color,transform] duration-500 group-hover:scale-110 group-hover:bg-theme-primary group-hover:text-white bg-bg-sunken text-theme-primary shadow-neu-sunken-subtle">
                    {section.icon}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap mb-4">
                    <h3 className="text-2xl font-black group-hover:text-theme-primary transition-colors leading-tight tracking-tight text-content-primary">
                      {section.title}
                    </h3>
                    {section.highlight && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider bg-theme-primary/10 text-theme-primary shadow-neu-raised-sm">
                        Hackathon Start Here
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] leading-relaxed mb-8 font-medium text-content-secondary">
                    {section.description}
                  </p>
                  <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-content-secondary/40">
                    <span>{section.count}</span>
                    <span className="text-theme-primary opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-500 translate-x-4 group-hover:translate-x-0 flex items-center gap-2">
                      Explore <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
                {section.externalLink && (
                  <a
                    href={section.externalLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 inline-flex items-center min-h-11 mt-2 ml-8 text-xs font-bold text-theme-primary hover:underline"
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
            <Link href="/community" className="inline-flex items-center min-h-11 text-theme-primary font-black uppercase tracking-widest text-xs hover:tracking-[0.2em] transition-[letter-spacing]">Help Center</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-theme-border/40" />
            <Link href={`${GITHUB_REPO_URL}/issues`} className="inline-flex items-center min-h-11 text-theme-primary font-black uppercase tracking-widest text-xs hover:tracking-[0.2em] transition-[letter-spacing]">GitHub Issues</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
