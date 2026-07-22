"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Terminal, Layers, Wallet, Clock, TrendingUp, Package } from "lucide-react";
import { BlueprintMotionSection } from "@/components/blueprint/BlueprintMotionSection";

type View = "freelancer" | "business";

/* ── Freelancer Dashboard preview ── */
function FreelancerView() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-content-primary">Freelancer Dashboard</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-theme-primary/10 text-theme-primary font-mono">v2.4.1</span>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--color-bg-sunken)",
          boxShadow: "inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-theme-primary" />
          <span className="text-xs font-semibold text-content-secondary uppercase tracking-wide">Pending Escrows</span>
        </div>
        <div className="space-y-2">
          {[
            { label: "Logo Design — Acme Co.", amount: "$850", status: "In Review" },
            { label: "API Integration Sprint", amount: "$2,400", status: "Awaiting Release" },
            { label: "UX Audit Report", amount: "$620", status: "In Review" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <span className="text-content-primary truncate max-w-[60%]">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-theme-primary">{item.amount}</span>
                <span className="text-content-muted">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--color-bg-sunken)",
          boxShadow: "inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={14} className="text-theme-primary" />
          <span className="text-xs font-semibold text-content-secondary uppercase tracking-wide">Payout Status</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-content-primary font-mono">$3,870</p>
            <p className="text-xs text-content-muted mt-0.5">Available for withdrawal</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-theme-success font-semibold">+$620 this week</p>
            <p className="text-xs text-content-muted mt-0.5">Next payout: Friday</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Business Dashboard preview ── */
function BusinessView() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-content-primary">Business Dashboard</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-theme-primary/10 text-theme-primary font-mono">v2.4.1</span>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--color-bg-sunken)",
          boxShadow: "inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-theme-primary" />
          <span className="text-xs font-semibold text-content-secondary uppercase tracking-wide">Fund Project</span>
        </div>
        <div className="space-y-2">
          {[
            { label: "Mobile App Redesign", funded: "80%", total: "$12,000" },
            { label: "Backend Infrastructure", funded: "45%", total: "$8,500" },
            { label: "Marketing Campaign", funded: "100%", total: "$3,200" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-content-primary">{item.label}</span>
                <span className="font-mono text-theme-primary font-semibold">{item.total}</span>
              </div>
              <div
                className="h-1.5 rounded-full w-full"
                style={{
                  background: "var(--color-bg-base)",
                  boxShadow: "inset 1px 1px 3px var(--shadow-dark), inset -1px -1px 3px var(--shadow-light)",
                }}
              >
                <div
                  className="h-full rounded-full bg-theme-primary"
                  style={{ width: item.funded, opacity: 0.85 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--color-bg-sunken)",
          boxShadow: "inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Package size={14} className="text-theme-primary" />
          <span className="text-xs font-semibold text-content-secondary uppercase tracking-wide">Asset Tracking</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Active Projects", value: "7" },
            { label: "Deliverables", value: "23" },
            { label: "Vendors", value: "12" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg p-2 text-center"
              style={{
                background: "var(--color-bg-base)",
                boxShadow: "3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)",
              }}
            >
              <p className="text-lg font-bold font-mono text-content-primary">{stat.value}</p>
              <p className="text-[10px] text-content-muted leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MarketplaceTemplate() {
  const [view, setView] = useState<View>("freelancer");

  return (
    <BlueprintMotionSection id="templates" className="py-24 px-6 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full text-xs font-semibold text-theme-primary uppercase tracking-widest"
            style={{
              background: "var(--color-bg-base)",
              boxShadow: "inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)",
            }}
          >
            <Layers size={12} />
            Marketplace Template
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-content-primary mt-3">
            Your Frontend, Ready to Ship
          </h2>
          <p className="mt-4 text-content-secondary max-w-xl mx-auto text-sm leading-relaxed">
            The Marketplace Template is the official frontend boilerplate that connects directly to the Orchestrator—giving you split Buyer and Seller experiences out of the box.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="flex flex-col items-center gap-6">
            <div
              className="flex items-center gap-1 p-1 rounded-full"
              style={{
                background: "var(--color-bg-base)",
                boxShadow: "inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)",
              }}
            >
              {(["freelancer", "business"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="relative px-5 py-2 rounded-full text-xs font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
                  style={
                    view === v
                      ? {
                          background: "var(--color-bg-base)",
                          boxShadow: "4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)",
                          color: "var(--color-primary)",
                        }
                      : { color: "var(--color-text-secondary)" }
                  }
                >
                  {v === "freelancer" ? "Freelancer Dashboard" : "Business Dashboard"}
                </button>
              ))}
            </div>

            <div
              className="w-full rounded-3xl p-4"
              style={{
                background: "var(--color-bg-base)",
                boxShadow:
                  "12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light), 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)",
              }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                style={{
                  background: "var(--color-bg-sunken)",
                  boxShadow: "inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)",
                }}
              >
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
                </div>
                <div
                  className="flex-1 mx-2 px-3 py-0.5 rounded-full text-[10px] text-content-muted font-mono"
                  style={{
                    background: "var(--color-bg-base)",
                    boxShadow: "inset 1px 1px 3px var(--shadow-dark), inset -1px -1px 3px var(--shadow-light)",
                  }}
                >
                  app.offerhub.io/{view}
                </div>
              </div>

              <div
                className="rounded-2xl p-4 min-h-[280px]"
                style={{
                  background: "var(--color-bg-elevated)",
                  boxShadow: "inset 2px 2px 5px var(--shadow-dark), inset -2px -2px 5px var(--shadow-light)",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={view}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    {view === "freelancer" ? <FreelancerView /> : <BusinessView />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                <Terminal size={14} className="text-theme-primary" />
                Quick Start
              </h3>
              <div
                className="bg-bg-base shadow-neu-sunken p-6 rounded-2xl font-mono text-xs"
                style={{ overflowX: "auto" }}
              >
                <p className="text-content-muted select-none mb-1">
                  $ <span className="text-theme-primary">npx</span>{" "}
                  <span className="text-content-primary">create-offer-hub-app@latest</span>
                </p>
                <p className="text-content-muted text-[10px] mt-3">
                  ↳ Scaffolds a full marketplace with Buyer &amp; Seller routes, escrow hooks, and the @offerhub/sdk pre-configured.
                </p>
              </div>
            </div>

            <div
              className="rounded-2xl p-6"
              style={{
                background: "var(--color-bg-base)",
                boxShadow: "6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)",
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="mt-0.5 p-2 rounded-xl"
                  style={{
                    background: "var(--color-bg-base)",
                    boxShadow: "4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)",
                  }}
                >
                  <Layers size={16} className="text-theme-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-content-primary font-mono">@offerhub/sdk</p>
                  <p className="text-xs text-content-muted mt-0.5">The official JavaScript/TypeScript SDK</p>
                </div>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed mb-5">
                The <span className="font-mono text-content-primary">@offerhub/sdk</span> bridges the Marketplace Template and the Orchestrator. It exposes typed hooks for escrow lifecycle management, real-time payout tracking, and asset resolution — so your frontend stays synced with the payment engine without writing a single REST call by hand.
              </p>
              <a
                href="https://docs.offerhub.io/sdk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold btn-neumorphic-primary transition-all"
              >
                SDK Documentation
                <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Escrow Hooks", desc: "Fund, hold, release" },
                { label: "Payout Tracking", desc: "Real-time status" },
                { label: "Asset Resolution", desc: "File & delivery mgmt" },
                { label: "Role Splitting", desc: "Buyer / Seller context" },
              ].map((feat) => (
                <div
                  key={feat.label}
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: "var(--color-bg-base)",
                    boxShadow: "4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)",
                  }}
                >
                  <p className="text-xs font-semibold text-content-primary">{feat.label}</p>
                  <p className="text-[10px] text-content-muted mt-0.5">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BlueprintMotionSection>
  );
}