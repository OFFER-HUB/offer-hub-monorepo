"use client";

import Link from "next/link";
import { BookOpen, Cpu, Shield, Coins, Server, BookMarked, Webhook } from "lucide-react";
import { motion } from "framer-motion";
import DocsSearchBar from "@/components/docs/DocsSearchBar";

const docSections = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn what OFFER-HUB is, how to install it, and make your first API call.",
    link: "/docs/getting-started",
    gradient:
      "radial-gradient(ellipse 85% 80% at 8% 15%, rgba(20,154,155,0.15) 0%, rgba(20,154,155,0.05) 45%, transparent 75%), #F1F3F7",
  },
  {
    icon: Cpu,
    title: "Orchestrator Guide",
    description: "Master the orchestrator architecture, balances, top-ups, and payment flows.",
    link: "/docs/guide/orchestrator",
    gradient:
      "radial-gradient(ellipse 90% 80% at 90% 5%, rgba(27,200,202,0.16) 0%, rgba(27,200,202,0.05) 50%, transparent 75%), #F1F3F7",
  },
  {
    icon: Shield,
    title: "Escrow Flows",
    description: "Smart contract escrow, deposits, withdrawals, and dispute resolution.",
    link: "/docs/guide/escrow",
    gradient:
      "radial-gradient(ellipse 85% 90% at 10% 90%, rgba(13,115,119,0.14) 0%, rgba(13,115,119,0.04) 50%, transparent 75%), #F1F3F7",
  },
  {
    icon: Coins,
    title: "Multi-Currency",
    description: "Accept any asset — fiat, stablecoins, or Stellar tokens. Automatic conversion at settlement.",
    link: "/docs/guide/multi-currency",
    gradient:
      "radial-gradient(ellipse 90% 80% at 50% 50%, rgba(25,33,61,0.08) 0%, rgba(25,33,61,0.02) 55%, transparent 80%), #F1F3F7",
  },
  {
    icon: Server,
    title: "Self-Hosting",
    description: "Deploy OFFER-HUB on your own infrastructure with Docker and configure it.",
    link: "/docs/guide/self-hosting",
    gradient:
      "radial-gradient(ellipse 80% 85% at 50% 0%, rgba(34,224,226,0.14) 0%, rgba(34,224,226,0.04) 50%, transparent 75%), #F1F3F7",
  },
  {
    icon: BookMarked,
    title: "API Reference",
    description: "Complete REST API documentation with authentication, endpoints, and examples.",
    link: "/docs/api-reference/overview",
    gradient:
      "radial-gradient(ellipse 85% 80% at 92% 88%, rgba(10,98,101,0.15) 0%, rgba(10,98,101,0.04) 50%, transparent 75%), #F1F3F7",
  },
  {
    icon: Webhook,
    title: "Webhooks",
    description: "Instant event notifications for every state change. Stay in sync with zero polling.",
    link: "/docs/api-reference/webhooks",
    gradient:
      "radial-gradient(ellipse 85% 80% at 12% 80%, rgba(20,154,155,0.13) 0%, rgba(21,148,156,0.04) 50%, transparent 75%), #F1F3F7",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent pt-28">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative py-16 md:py-24">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(20,154,155,0.05) 0%, transparent 70%)",
            }}
          />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.p
              className="text-xs font-medium uppercase tracking-[0.4em] mb-4"
              style={{ color: "#149A9B" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Documentation Center
            </motion.p>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4"
              style={{ color: "#19213D" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              Documentation
            </motion.h1>

            <motion.p
              className="text-base md:text-lg max-w-xl mx-auto mb-10 font-light"
              style={{ color: "#6D758F" }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Everything you need to orchestrate payments, integrate escrow, and build on OFFER-HUB.
            </motion.p>

            {/* Search */}
            <motion.div
              className="relative z-20 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <DocsSearchBar />
            </motion.div>
          </div>
        </div>

        {/* Section Cards */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {docSections.map((section) => {
              const Icon = section.icon;
              return (
                <motion.div key={section.title} variants={cardVariants}>
                  <Link
                    href={section.link}
                    className="flex p-8 rounded-2xl shadow-raised flex-col gap-4 hover:shadow-[0_24px_32px_-8px_rgba(20,154,155,0.1)] transition-shadow duration-300"
                    style={{ background: section.gradient }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl shadow-raised-sm flex items-center justify-center shrink-0"
                      style={{ background: "#F1F3F7" }}
                    >
                      <Icon size={18} style={{ color: "#149A9B" }} />
                    </div>
                    <h3
                      className="font-bold text-lg"
                      style={{ color: "#19213D" }}
                    >
                      {section.title}
                    </h3>
                    <p
                      className="text-sm font-light leading-relaxed"
                      style={{ color: "#6D758F" }}
                    >
                      {section.description}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
